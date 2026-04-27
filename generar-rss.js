const fs = require("fs");

const SITE_URL = "https://blogblog.es";
const FEED_URL = `${SITE_URL}/rss.xml`;
const SITE_TITLE = "¡Blog!¡Blog!";
const SITE_DESC = "Últimas publicaciones del directorio";
const SITE_LANG = "es-es";
const MAX_ITEMS = 25;
const IMAGE_URL = `${SITE_URL}/favicon.ico`; // cambia si luego usas logo mejor

const raw = JSON.parse(fs.readFileSync("feeds.json", "utf8"));

function parseDate(str) {
  const [d, m, y] = str.split("/");
  const dt = new Date(`${y}-${m}-${d}T12:00:00Z`);
  return isNaN(dt) ? new Date() : dt;
}

function escapeXml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanText(str = "") {
  return str
    .replace(/\s+/g, " ")
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .trim();
}

function excerpt(str = "", max = 320) {
  const t = cleanText(str);
  return t.length > max ? t.slice(0, max).trim() + "…" : t;
}

// eliminar duplicados por link
const uniqueMap = new Map();
for (const item of raw) {
  if (item.link && !uniqueMap.has(item.link)) {
    uniqueMap.set(item.link, item);
  }
}

const data = [...uniqueMap.values()]
  .sort((a, b) => parseDate(b.fecha) - parseDate(a.fecha))
  .slice(0, MAX_ITEMS);

const items = data.map(item => {
  const title = escapeXml(cleanText(item.titulo || "Sin título"));
  const link = escapeXml(item.link || SITE_URL);
  const blog = cleanText(item.blog || "");
  const desc = escapeXml(excerpt(item.contenido || ""));
  const pubDate = parseDate(item.fecha).toUTCString();

  return `
<item>
<title>${title}</title>
<link>${link}</link>
<guid isPermaLink="true">${link}</guid>
<pubDate>${pubDate}</pubDate>
<category>${escapeXml(blog)}</category>
<description><![CDATA[${desc}<br><br><strong>Fuente:</strong> ${escapeXml(blog)}]]></description>
</item>`;
}).join("");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
xmlns:atom="http://www.w3.org/2005/Atom">

<channel>
<title>${SITE_TITLE}</title>
<link>${SITE_URL}</link>
<description>${SITE_DESC}</description>
<language>${SITE_LANG}</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>

<image>
<title>${SITE_TITLE}</title>
<url>${IMAGE_URL}</url>
<link>${SITE_URL}</link>
</image>

${items}

</channel>
</rss>`;

fs.writeFileSync("rss.xml", xml);
console.log("rss.xml pro generado");
