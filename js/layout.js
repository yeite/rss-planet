async function loadFragment(selector, url) {
    const container = document.querySelector(selector);

    if (!container) return;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        container.innerHTML = await response.text();
    } catch (error) {
        console.error(`Error al cargar ${url}:`, error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadFragment("#header-placeholder", "header.html").then(() => {
        if (typeof initThemeToggle === "function") initThemeToggle();
        // Solo existe en el Inicio (js/feed-list.js); en el resto de páginas se ignora.
        if (typeof initViewSelector === "function") initViewSelector();
    });
    loadFragment("#footer-placeholder", "footer.html");
});

document.head.append(Object.assign(document.createElement("script"), { src: "js/menu-flotante.js", defer: true }));
