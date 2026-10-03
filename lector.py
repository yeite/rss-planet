import calendar
from datetime import datetime, timedelta, timezone
import json
import os
import re
from concurrent.futures import ThreadPoolExecutor

import feedparser

# Leer feeds
with open("feeds.txt", "r", encoding="utf-8") as f:
    feeds = [line.strip() for line in f if line.strip()]

# Rango de tiempo: últimos 7 días (lo que se muestra en el feed de Inicio)
ahora_utc = datetime.now(timezone.utc)
# Ventana de la portada (Inicio): solo lo publicado en los últimos 7 días.
hace_una_semana = ahora_utc - timedelta(days=7)


def extraer_imagen(entry, contenido_html):
    """Busca una imagen de portada para la entrada, en este orden:
    1) <media:content> o <media:thumbnail> (formato usado por WordPress y otros)
    2) un <enclosure> de tipo imagen
    3) la primera <img> dentro del cuerpo/resumen original del post
    Si no encuentra nada, devuelve None (el front-end usa el favicon del
    blog repetido como respaldo en ese caso).
    """
    media = entry.get("media_content") or entry.get("media_thumbnail")
    if media:
        url = media[0].get("url")
        if url:
            return url

    for enclosure in entry.get("links", []):
        tipo = str(enclosure.get("type", ""))
        if enclosure.get("rel") == "enclosure" and tipo.startswith("image"):
            return enclosure.get("href")

    match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', contenido_html or "")
    if match:
        return match.group(1)

    return None


def procesar_feed(url):
    feed_items = []
    try:
        d = feedparser.parse(url)
        blog_name = d.feed.get("title", "Sin nombre")
        if not d.entries:
            return []

        for e in d.entries[:10]:
            fecha_parsed = getattr(e, "published_parsed", None) or getattr(
                e, "updated_parsed", None
            )

            # Fallback: Si el feed no provee fecha parseable, usar la fecha actual
            if fecha_parsed:
                timestamp = calendar.timegm(fecha_parsed)
                fecha_utc = datetime.fromtimestamp(timestamp, tz=timezone.utc)
            else:
                fecha_utc = ahora_utc
                timestamp = ahora_utc.timestamp()

            # Filtrar si entra en el rango deseado
            if fecha_utc >= hace_una_semana:
                contenido_html = e.get("summary", "") or e.get("description", "")
                imagen = extraer_imagen(e, contenido_html)
                contenido = re.sub("<[^<]+?>", "", contenido_html)[:300]

                feed_items.append(
                    {
                        "blog": blog_name,
                        "titulo": getattr(e, "title", "Sin título"),
                        "link": getattr(e, "link", "#"),
                        "timestamp": timestamp,
                        "fecha": fecha_utc.strftime("%d/%m/%Y %H:%M"),
                        "contenido": contenido,
                        "imagen": imagen,
                    }
                )
    except Exception as ex:
        print(f"[❌] Error procesando {url}: {ex}")
        return feed_items

    return feed_items


def ejecutar_con_progreso(feeds):
    results = []
    total = len(feeds)
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_url = {
            executor.submit(procesar_feed, url): url for url in feeds
        }
        for i, future in enumerate(future_to_url):
            url = future_to_url[future]
            try:
                feed_posts = future.result()
                results.extend(feed_posts)
                print(f"[{i+1}/{total}] {url} -> {len(feed_posts)} posts")
            except Exception as e:
                print(f"[❌] Error en {url}: {e}")
    return results


items = ejecutar_con_progreso(feeds)

if items:
    # Ordenar de más reciente a más antiguo
    items.sort(key=lambda x: x["timestamp"], reverse=True)

    # Limpiar campo auxiliar de ordenamiento
    for item in items:
        item.pop("timestamp", None)

    with open("feeds.json", "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(
        f"\n✅ Éxito: Se guardaron {len(items)} publicaciones en feeds.json"
    )
else:
    print(
        "\n⚠️ Advertencia: Ningún post cumplió el filtro de fecha. Se conservará el archivo existente o revisa los logs arriba."
    )
