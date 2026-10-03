const THEME_STORAGE_KEY = "blogblog-theme";

// Tema por horario: de día (7 a 20hs) claro, el resto del tiempo oscuro.
// Esto solo se usa la primera vez que alguien entra al sitio; después
// se respeta siempre lo que haya elegido a mano.
function getDefaultThemeByTime() {
    const hour = new Date().getHours();
    return hour >= 7 && hour < 20 ? "light" : "dark";
}

function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
        return null;
    }
}

function storeTheme(theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Modo privado o storage bloqueado: no pasa nada, simplemente
        // no se recuerda la preferencia entre visitas.
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const toggle = document.getElementById("theme-toggle");
    if (toggle) toggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
}

// Se ejecuta ni bien el header (que contiene el botón) termina de insertarse.
function initThemeToggle() {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    const current = document.documentElement.getAttribute("data-theme") || "dark";
    toggle.setAttribute("aria-pressed", current === "light" ? "true" : "false");

    toggle.addEventListener("click", () => {
        const next =
            document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
        applyTheme(next);
        storeTheme(next);
    });
}

// Nota: el tema inicial (antes de que cargue este archivo) lo define el
// script inline en el <head> de cada página, para evitar el parpadeo del
// tema por defecto. Esta línea es un respaldo por si esa parte faltara.
if (!document.documentElement.hasAttribute("data-theme")) {
    applyTheme(getStoredTheme() || getDefaultThemeByTime());
}
