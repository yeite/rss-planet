# ¡Blog!¡Blog!

Directorio, agregador RSS y webring de blogs personales en español.

## Estructura

- `lector.py`: descarga los feeds de `feeds.txt` y genera `feeds.json`.
- `generar-rss.js`: genera el RSS público (`rss.xml`) desde `feeds.json`.
- `blogs.json`: datos del directorio.
- `js/`: comportamiento compartido y scripts específicos de cada página.
- `css/`: estilos compartidos.

## Desarrollo local

Requiere Python 3.6+ y Node.js 22+ para generar el RSS.

```bash
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
python lector.py
node generar-rss.js
```

Para previsualizar el sitio, serví el directorio con un servidor HTTP local, por ejemplo:

```bash
python3 -m http.server 8000
```

Luego abrí `http://localhost:8000` en el navegador. No abras los HTML directamente con `file://`, porque la carga de cabecera, pie y datos JSON usa `fetch`.

## Automatización

GitHub Actions actualiza `feeds.json` cada 12 horas y regenera `rss.xml` cuando cambian los datos o el generador.
