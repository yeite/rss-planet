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

async function loadFeedList() {
    const container = document.querySelector("[data-feed-list]");
    if (!container) return;

    try {
        const response = await fetch(container.dataset.feedSource || "feeds.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const items = await response.json();
        container.replaceChildren(...items.map(createFeedItem));
    } catch (error) {
        console.error("Error al cargar las publicaciones:", error);
        container.textContent = "No se pudieron cargar las publicaciones.";
    }
}

document.addEventListener("DOMContentLoaded", loadFeedList);
