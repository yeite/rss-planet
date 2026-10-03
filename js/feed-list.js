const VIEW_STORAGE_KEY = "blogblog-view";

function getStoredView() {
    try {
        return localStorage.getItem(VIEW_STORAGE_KEY);
    } catch {
        return null;
    }
}

function storeView(view) {
    try {
        localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
        // Modo privado o storage bloqueado: no se recuerda entre visitas.
    }
}

// Dominio del link del post, para pedir el favicon del blog (sirve de
// "portada" de respaldo cuando la entrada no trae ninguna imagen propia).
function getHostname(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

function createFeedItem(item) {
    const article = document.createElement("article");
    article.className = "item";

    const blog = document.createElement("span");
    blog.className = "blog";
    blog.textContent = item.blog || "Sin nombre";

    const date = document.createElement("span");
    date.className = "fecha";
    date.textContent = item.fecha || "";

    const link = document.createElement("a");
    link.className = "feed-title";
    link.href = item.link || "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = item.titulo || "Sin título";

    const content = document.createElement("p");
    content.className = "contenido";
    content.textContent = item.contenido ? `${item.contenido}...` : "";

    article.append(link, blog, date, content);
    return article;
}

// Tarjeta de la vista mosaico: portada (imagen propia o, si no hay,
// el favicon del blog repetido para cubrir todo el espacio), y debajo
// título, nombre del blog y extracto.
function createFeedMosaicItem(item) {
    const article = document.createElement("article");
    article.className = "mosaic-item";

    const cover = document.createElement("div");
    cover.className = "mosaic-cover";

    if (item.imagen) {
        // Portada real: va como <img loading="lazy"> para que el navegador
        // solo la pida cuando esté por entrar en pantalla (son las imágenes
        // más pesadas de la vista mosaico).
        const img = document.createElement("img");
        img.className = "mosaic-cover-img";
        img.src = item.imagen;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        cover.append(img);
    } else {
        // Sin portada: se repite el favicon del blog como fondo. Pesa muy
        // poco (un ícono de pocos KB, casi siempre ya en caché porque se
        // usa también en el directorio), así que no hace falta carga diferida.
        const domain = getHostname(item.link);
        cover.classList.add("mosaic-cover--favicon");
        cover.style.backgroundImage = domain
            ? `url("https://www.google.com/s2/favicons?domain=${domain}&sz=64")`
            : `url("favicon.ico")`;
    }

    const body = document.createElement("div");
    body.className = "mosaic-body";

    const title = document.createElement("a");
    title.className = "mosaic-title";
    title.href = item.link || "#";
    title.target = "_blank";
    title.rel = "noopener noreferrer";
    title.textContent = item.titulo || "Sin título";

    const blog = document.createElement("span");
    blog.className = "mosaic-blog";
    blog.textContent = item.blog || "Sin nombre";

    const date = document.createElement("span");
    date.className = "fecha";
    date.textContent = item.fecha || "";

    const excerpt = document.createElement("p");
    excerpt.className = "mosaic-excerpt";
    excerpt.textContent = item.contenido ? `${item.contenido}...` : "";

    body.append(title, blog, date, excerpt);
    article.append(cover, body);
    return article;
}

let cachedItems = [];
let currentView = "lista";

function renderView(view) {
    const container = document.querySelector("[data-feed-list]");
    if (!container) return;

    if (!cachedItems.length) return;

    container.className = view === "mosaico" ? "mosaic-grid" : "";
    container.replaceChildren(
        ...cachedItems.map(view === "mosaico" ? createFeedMosaicItem : createFeedItem),
    );
}

function setView(view) {
    currentView = view;
    storeView(view);

    const listBtn = document.getElementById("vista-lista");
    const mosaicBtn = document.getElementById("vista-mosaico");
    if (listBtn) {
        listBtn.classList.toggle("is-active", view === "lista");
        listBtn.setAttribute("aria-pressed", view === "lista" ? "true" : "false");
    }
    if (mosaicBtn) {
        mosaicBtn.classList.toggle("is-active", view === "mosaico");
        mosaicBtn.setAttribute("aria-pressed", view === "mosaico" ? "true" : "false");
    }

    renderView(view);
}

function initViewToggle() {
    const listBtn = document.getElementById("vista-lista");
    const mosaicBtn = document.getElementById("vista-mosaico");
    if (!listBtn || !mosaicBtn) return;

    listBtn.addEventListener("click", () => setView("lista"));
    mosaicBtn.addEventListener("click", () => setView("mosaico"));

    setView(getStoredView() || "lista");
}

async function loadFeedList() {
    const container = document.querySelector("[data-feed-list]");
    if (!container) return;

    initViewToggle();

    try {
        const response = await fetch(container.dataset.feedSource || "feeds.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        cachedItems = await response.json();
        renderView(currentView);
    } catch (error) {
        console.error("Error al cargar las publicaciones:", error);
        container.textContent = "No se pudieron cargar las publicaciones.";
    }
}

document.addEventListener("DOMContentLoaded", loadFeedList);
