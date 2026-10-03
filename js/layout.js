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
    });
    loadFragment("#footer-placeholder", "footer.html");
});
