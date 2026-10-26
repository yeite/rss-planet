// Menú flotante de ¡Blog!¡Blog!
// Se agrega solo: crea el botón, carga su CSS y marca la página actual.

(function () {
    const LINKS = [
        { href: "index.html", icon: "🏠", label: "Inicio" },
        { href: "directorio.html", icon: "📖", label: "Directorio" },
        { href: "random.html", icon: "🎲", label: "Random" },
        { href: "webring.html", icon: "🪐", label: "Webring" },
        { href: "acerca-de.html", icon: "ℹ️", label: "Acerca de" },
        { href: "sumate.html", icon: "➕", label: "Sumate" },
        { href: "comunidad.html", icon: "👥", label: "Comunidad" },
    ];

    function loadCss() {
        if (document.querySelector('link[href$="menu-flotante.css"]')) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "css/menu-flotante.css";
        document.head.append(link);
    }

    // Las vistas alternativas del inicio también cuentan como "Inicio".
    const HOME_VIEWS = ["mosaico", "minimal"];
    const clean = (path) => path.replace(/\.html$/, "");

    function currentPage() {
        const page = clean(location.pathname.split("/").pop() || "index");
        return HOME_VIEWS.includes(page) ? "index" : page;
    }

    function build() {
        loadCss();

        const nav = document.createElement("nav");
        nav.className = "fab";
        nav.setAttribute("aria-label", "Menú rápido");

        const list = document.createElement("ul");
        list.className = "fab-list";
        list.id = "fab-list";

        const page = currentPage();

        LINKS.forEach((item, i) => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.className = "fab-item";
            a.href = item.href;
            if (clean(item.href) === page) a.setAttribute("aria-current", "page");
            // Aparecen desde el botón hacia arriba
            a.style.transitionDelay = `${(LINKS.length - 1 - i) * 0.04}s`;

            const label = document.createElement("span");
            label.className = "fab-label";
            label.textContent = item.label;

            const icon = document.createElement("span");
            icon.className = "fab-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = item.icon;

            a.append(label, icon);
            li.append(a);
            list.append(li);
        });

        const toggle = document.createElement("button");
        toggle.className = "fab-toggle";
        toggle.type = "button";
        toggle.setAttribute("aria-controls", "fab-list");
        toggle.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';

        nav.append(list, toggle);
        document.body.append(nav);

        const items = nav.querySelectorAll(".fab-item");

        function setOpen(open) {
            nav.classList.toggle("open", open);
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
            // Los enlaces ocultos no deben recibir foco con Tab
            items.forEach((a) => (a.tabIndex = open ? 0 : -1));
        }

        toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && nav.classList.contains("open")) {
                setOpen(false);
                toggle.focus();
            }
        });
        document.addEventListener("click", (e) => {
            if (!nav.contains(e.target)) setOpen(false);
        });

        setOpen(false);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", build);
    } else {
        build();
    }
})();
