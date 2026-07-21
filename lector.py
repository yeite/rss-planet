import calendar
from datetime import datetime, timedelta
import json
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor

import feedparser

# Leer feeds
with open("feeds.txt", "r") as f:
    feeds = [line.strip() for line in f if line.strip()]

one_week_ago = datetime.utcnow() - timedelta(days=7)


def procesar_feed(url):
    feed_items = []
    try:
        d = feedparser.parse(url)
        blog_name = d.feed.get("title", "Sin nombre")
        if not d.entries:
            print(f"[⚠] No se encontraron posts en: {url}")
            return []

        for e in d.entries[:10]:
            fecha_parsed = getattr(e, "published_parsed", None) or getattr(
                e, "updated_parsed", None
            )
            if not fecha_parsed:
                continue

            # calendar.timegm interpreta la tupla como UTC de forma precisa
            timestamp = calendar.timegm(fecha_parsed)
            fecha = datetime.utcfromtimestamp(timestamp)

            if fecha >= one_week_ago:
                contenido = e.get("summary", "")
                contenido = re.sub("<[^<]+?>", "", contenido)
                contenido = contenido[:300]

                feed_items.append(
                    {
                        "blog": blog_name,
                        "titulo": e.title,
                        "link": e.link,
                        # Guardamos objeto datetime o ISO para preservar precisión en ordenamiento
                        "fecha_obj": fecha,
                        "fecha": fecha.strftime("%d/%m/%Y %H:%M"),  # Muestra día y hora exacta
                        "contenido": contenido,
                    }
                )
    except Exception as ex:
        print(f"[❌] Error procesando {url}: {ex}")
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


# Ejecutar y ordenar usando la precisión del objeto datetime completo
items = ejecutar_con_progreso(feeds)
items = sorted(items, key=lambda x: x["fecha_obj"], reverse=True)

# Limpiamos 'fecha_obj' antes de exportar a JSON (JSON no serializa datetime directamente)
for item in items:
    del item["fecha_obj"]

# Comparar con el JSON existente
existing_data = []
if os.path.exists("feeds.json"):
    with open("feeds.json", "r", encoding="utf-8") as f:
        try:
            existing_data = json.load(f)
        except json.JSONDecodeError:
            existing_data = []

# Guardar solo si hay cambios
if items != existing_data:
    with open("feeds.json", "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Se actualizaron {len(items)} posts en feeds.json")
else:
    print("\nℹ️ No hubo cambios en los feeds, no se sobrescribió feeds.json")
