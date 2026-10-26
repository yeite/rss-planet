// Blog aleatorio: recorre los blogs del directorio (blogs.json) en orden
// aleatorio, los muestra en un iframe y permite ver su ficha en un panel.
//
// Si un blog no se deja mostrar dentro de otra página (X-Frame-Options / CSP),
// se puede excluir del azar agregando  "NoFrame": "si"  en su entrada de blogs.json.

(function () {
    const COUNTRY_CODES = {
        Argentina: "ar",
        Bolivia: "bo",
        Chile: "cl",
        Colombia: "co",
        Cuba: "cu",
        Ecuador: "ec",
        España: "es",
        "Estados Unidos": "us",
        México: "mx",
        Paraguay: "py",
        Perú: "pe",
        Uruguay: "uy",
        Venezuela: "ve",
    };

    const CATEGORY_ICONS = {
        "AIRE LIBRE": "🍃",
        "ARTE Y DISEÑO": "🎨",
        "CIENCIA Y HUMANIDADES": "🧪",
        "COMIDA Y BEBIDA": "🍽️",
        "ENTRETENIMIENTO Y CULTURA": "📺",
        FOTOGRAFÍA: "📸",
        LITERARIO: "📚",
        "MANUALIDADES / HOBBIES": "✂️",
        NEWSLETTER: "🗞️",
        PODCAST: "🎙️",
        "SOCIEDAD Y ECONOMÍA": "💸",
        TECNOLOGÍA: "💻",
        VIAJES: "✈️",
        "VIDA DIARIA": "🏠",
    };

    const BADGE_ORDER = ["Webring", "Aliado", "Sponsor"];
    const SLOW_MS = 8000;

    const $ = (id) => document.getElementById(id);
    const els = {
        stage: $("rb-stage"),
        next: $("rb-next"),
        prev: $("rb-prev"),
        dice: $("rb-dice"),
        info: $("rb-info"),
        url: $("rb-url"),
        panel: $("rb-panel"),
        panelBody: $("rb-panel-body"),
        panelClose: $("rb-panel-close"),
        loading: $("rb-loading"),
        loadingText: $("rb-loading-text"),
        toast: $("rb-toast"),
        toastOpen: $("rb-toast-open"),
        toastNext: $("rb-toast-next"),
    };

    let pool = [];
    let queue = [];
    let history = [];
    let pos = -1;
    let token = 0;
    let slowTimer = null;
    let frame = null;

    /* ---------- Utilidades ---------- */

    function normalizeUrl(raw) {
        if (!raw || typeof raw !== "string") return null;
        let value = raw.trim();
        if (!value) return null;
        if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
        try {
            return new URL(value).href;
        } catch {
            return null;
        }
    }

    // Un iframe https no puede mostrar contenido http, así que se prueba con https.
    function toFrameUrl(raw) {
        const url = normalizeUrl(raw);
        return url ? url.replace(/^http:\/\//i, "https://") : null;
    }

    function hostOf(blog) {
        try {
            return new URL(toFrameUrl(blog.Url)).hostname;
        } catch {
            return "";
        }
    }

    function displayUrl(url) {
        try {
            const parsed = new URL(url);
            const path = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
            return parsed.host + path;
        } catch {
            return url;
        }
    }

    function shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /* ---------- Azar sin repetir hasta recorrer todos ---------- */

    function pickRandom() {
        if (!queue.length) {
            queue = shuffle(pool);
            const current = history[pos];
            // Evita repetir justo el blog actual al reiniciar la ronda
            if (queue.length > 1 && queue[queue.length - 1] === current) {
                [queue[0], queue[queue.length - 1]] = [queue[queue.length - 1], queue[0]];
            }
        }
        return queue.pop();
    }

    function next() {
        const blog = pickRandom();
        if (!blog) return;
        history.splice(pos + 1);
        history.push(blog);
        pos = history.length - 1;
        show(blog);
    }

    function prev() {
        if (pos <= 0) return;
        pos--;
        show(history[pos]);
    }

    /* ---------- Panel de información ---------- */

    function setPanel(open) {
        els.panel.classList.toggle("open", open);
        els.panel.inert = !open;
        els.panel.setAttribute("aria-hidden", String(!open));
        els.info.setAttribute("aria-expanded", String(open));
        els.info.classList.toggle("is-active", open);
    }

    function infoRow(label, content) {
        const row = document.createElement("div");
        row.className = "rb-info-row";
        const title = document.createElement("span");
        title.className = "rb-info-label-text";
        title.textContent = label;
        row.append(title, content);
        return row;
    }

    function externalLink(url, text, className) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = text;
        if (className) link.className = className;
        return link;
    }

    function renderInfo(blog) {
        const url = toFrameUrl(blog.Url);
        const nodes = [];

        // Encabezado: favicon + nombre + país
        const head = document.createElement("div");
        head.className = "rb-info-head";

        const favicon = document.createElement("img");
        favicon.className = "favicon";
        favicon.alt = "";
        favicon.src = url
            ? `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`
            : "favicon.ico";
        head.append(favicon);

        const titleBox = document.createElement("div");
        const name = document.createElement("h2");
        name.className = "rb-info-name";
        name.textContent = blog.Nombre || "Sin nombre";
        titleBox.append(name);

        if (blog.País) {
            const country = document.createElement("span");
            country.className = "rb-info-country";
            const code = COUNTRY_CODES[blog.País];
            if (code) {
                const flag = document.createElement("img");
                flag.className = "flag-icon";
                flag.src = `https://flagcdn.com/24x18/${code}.png`;
                flag.srcset = `https://flagcdn.com/48x36/${code}.png 2x`;
                flag.width = 20;
                flag.height = 15;
                flag.alt = "";
                country.append(flag);
            }
            country.append(blog.País.toUpperCase());
            titleBox.append(country);
        }
        head.append(titleBox);
        nodes.push(head);

        // Insignias
        const active = new Set();
        if (blog.Webring?.trim()) active.add("Webring");
        if (blog.Aliado === "si") active.add("Aliado");
        if (blog.Sponsor === "si") active.add("Sponsor");
        const badges = BADGE_ORDER.filter((b) => active.has(b));
        if (badges.length) {
            const row = document.createElement("div");
            row.className = "rb-info-badges";
            badges.forEach((badge) => {
                const pill = document.createElement("span");
                pill.className = `badge-pill badge-pill--${badge.toLowerCase()}`;
                const label = document.createElement("span");
                label.textContent = badge.toUpperCase();
                const star = document.createElement("span");
                star.className = "badge-pill__star";
                star.setAttribute("aria-hidden", "true");
                star.textContent = "★";
                pill.append(label, star);
                row.append(pill);
            });
            nodes.push(row);
        }

        // Descripción
        if (blog.Descripción) {
            const desc = document.createElement("p");
            desc.className = "rb-info-desc";
            desc.textContent = blog.Descripción;
            nodes.push(desc);
        }

        // URL
        if (url) nodes.push(infoRow("Sitio", externalLink(url, displayUrl(url))));

        // Categorías
        const categories = (blog.Categoría || "")
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean);
        if (categories.length) {
            const tags = document.createElement("div");
            tags.className = "tags-row";
            categories.forEach((category) => {
                const tag = document.createElement("span");
                tag.className = "category-tag";
                tag.textContent =
                    `${CATEGORY_ICONS[category.toUpperCase()] || ""} ${category.toUpperCase()}`.trim();
                tags.append(tag);
            });
            nodes.push(infoRow("Categorías", tags));
        }

        // Feed RSS
        const feed = normalizeUrl(blog.Feed);
        if (feed) nodes.push(infoRow("Feed RSS", externalLink(feed, displayUrl(feed))));

        // Abrir en pestaña nueva
        if (url) nodes.push(externalLink(url, "Abrir el blog ↗", "rb-open-btn"));

        els.panelBody.replaceChildren(...nodes);
    }

    /* ---------- Mostrar un blog ---------- */

    function updateLocation(blog) {
        try {
            const host = hostOf(blog);
            history_replace(host);
        } catch {
            /* no pasa nada si no se puede actualizar la URL */
        }
    }

    function history_replace(host) {
        if (!host) return;
        window.history.replaceState(null, "", `?b=${encodeURIComponent(host)}`);
    }

    function show(blog) {
        const myToken = ++token;
        clearTimeout(slowTimer);

        const src = toFrameUrl(blog.Url);
        const label = blog.Nombre || displayUrl(src);

        els.url.textContent = displayUrl(src);
        els.url.href = src;
        els.toastOpen.href = src;
        els.toast.hidden = true;
        els.loadingText.textContent = `Cargando ${label}…`;
        els.loading.hidden = false;
        els.prev.disabled = pos <= 0;
        document.title = `${label} · ¡Blog!¡Blog! random`;
        updateLocation(blog);
        renderInfo(blog);

        // Se crea un iframe nuevo cada vez: así el botón "atrás" del navegador
        // no queda atrapado recorriendo los blogs ya visitados.
        const f = document.createElement("iframe");
        f.className = "rb-frame";
        f.title = `Blog: ${label}`;
        f.setAttribute(
            "sandbox",
            "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation",
        );
        f.addEventListener("load", () => {
            if (myToken !== token) return;
            clearTimeout(slowTimer);
            els.loading.hidden = true;
        });
        f.src = src;

        if (frame) frame.remove();
        frame = f;
        els.stage.prepend(f);

        // Si tarda demasiado, se ofrece abrirlo en otra pestaña o pasar al siguiente
        slowTimer = setTimeout(() => {
            if (myToken !== token) return;
            els.loading.hidden = true;
            els.toast.hidden = false;
        }, SLOW_MS);
    }

    function roll() {
        els.dice.classList.remove("roll");
        void els.dice.offsetWidth; // reinicia la animación
        els.dice.classList.add("roll");
        next();
    }

    /* ---------- Inicio ---------- */

    async function init() {
        try {
            const response = await fetch("blogs.json");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blogs = await response.json();

            pool = blogs.filter((blog) => toFrameUrl(blog.Url) && blog.NoFrame !== "si");
            if (!pool.length) throw new Error("No hay blogs disponibles");

            // ?b=dominio.com permite compartir un blog concreto
            const wanted = new URLSearchParams(location.search).get("b");
            const first = wanted && pool.find((blog) => hostOf(blog) === wanted);

            if (first) {
                history = [first];
                pos = 0;
                show(first);
            } else {
                next();
            }
        } catch (error) {
            console.error("Error al cargar los blogs:", error);
            els.loading.hidden = false;
            els.loadingText.textContent = "No se pudo cargar el directorio de blogs 😢";
        }
    }

    els.next.addEventListener("click", roll);
    els.toastNext.addEventListener("click", roll);
    els.prev.addEventListener("click", prev);
    els.info.addEventListener("click", () => setPanel(!els.panel.classList.contains("open")));
    els.panelClose.addEventListener("click", () => {
        setPanel(false);
        els.info.focus();
    });

    document.addEventListener("keydown", (e) => {
        const tag = e.target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === "ArrowRight" || e.key.toLowerCase() === "n") roll();
        else if (e.key === "ArrowLeft") prev();
        else if (e.key.toLowerCase() === "i") setPanel(!els.panel.classList.contains("open"));
        else if (e.key === "Escape") setPanel(false);
    });

    setPanel(false);
    init();
})();
