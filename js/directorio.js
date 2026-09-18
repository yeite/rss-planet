const FLAGS = {
    Argentina: "🇦🇷",
    Bolivia: "🇧🇴",
    Chile: "🇨🇱",
    Colombia: "🇨🇴",
    Cuba: "🇨🇺",
    Ecuador: "🇪🇨",
    España: "🇪🇸",
    "Estados Unidos": "🇺🇸",
    México: "🇲🇽",
    Paraguay: "🇵🇾",
    Perú: "🇵🇪",
    Uruguay: "🇺🇾",
    Venezuela: "🇻🇪",
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

const BADGE_MESSAGES = {
    Aliado: "🐸 Blogs que ayudan a difundir el proyecto poniendo un pequeño banner de ¡Blog!¡Blog! en su blog.",
    Sponsor: "⭐ Blogs que aportaron económicamente al proyecto.",
    Webring: "🪐 Blogs que participan del Webring de blogs en español.",
};

// Orden en el que se muestran las insignias sobre cada tarjeta.
const BADGE_ORDER = ["Webring", "Aliado", "Sponsor"];

const container = document.getElementById("contenedor");
const countryFilter = document.getElementById("filtroPais");
const categoryFilter = document.getElementById("filtroCategoria");
const badgeFilter = document.getElementById("filtroInsignia");
const badgeMessage = document.getElementById("mensajeInsignia");
let blogs = [];

function safeUrl(value) {
    if (!value || typeof value !== "string") return null;

    const url = value.startsWith("http") ? value : `https://${value}`;

    try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : null;
    } catch {
        return null;
    }
}

function createExternalLink(url, text) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = text;
    return link;
}

function populateFilters() {
    const countries = [...new Set(blogs.map((blog) => blog.País).filter(Boolean))].sort();
    const categories = [
        ...new Set(
            blogs.flatMap((blog) =>
                blog.Categoría
                    ? blog.Categoría.split(",").map((category) => category.trim())
                    : [],
            ),
        ),
    ].sort();

    countries.forEach((country) => {
        const option = new Option(`${FLAGS[country] || ""} ${country}`, country);
        countryFilter.add(option);
    });

    categories.forEach((category) => {
        const option = new Option(
            `${CATEGORY_ICONS[category.toUpperCase()] || ""} ${category}`,
            category,
        );
        categoryFilter.add(option);
    });
}

// Insignia activas de un blog, en el orden en que deben mostrarse.
function getActiveBadges(blog) {
    const active = new Set();
    if (blog.Webring?.trim()) active.add("Webring");
    if (blog.Aliado === "si") active.add("Aliado");
    if (blog.Sponsor === "si") active.add("Sponsor");
    return BADGE_ORDER.filter((badge) => active.has(badge));
}

// Insignia individual: pastilla con estrella, con su link correspondiente cuando aplica.
function createBadgePill(badgeName) {
    const pill = document.createElement(
       badgeName === "Aliado" || badgeName === "Sponsor" || badgeName === "Webring" ? "a" : "span",
    );
    pill.className = `badge-pill badge-pill--${badgeName.toLowerCase()}`;
    pill.append(document.createElement("span"));
    pill.firstChild.className = "badge-pill__label";
    pill.firstChild.textContent = badgeName.toUpperCase();
    const star = document.createElement("span");
    star.className = "badge-pill__star";
    star.textContent = "★";
    star.setAttribute("aria-hidden", "true");
    pill.append(star);

    if (badgeName === "Sponsor") {
        pill.href = "https://ko-fi.com/matizeta";
        pill.target = "_blank";
        pill.rel = "noopener noreferrer";
    } else if (badgeName === "Webring") {
        pill.href = "https://blogblog.es/webring.html";
        pill.target = "_blank";
        pill.rel = "noopener noreferrer";
    } else if (badgeName === "Aliado") {
        pill.href = "http://localhost:8000/acerca-de.html#difundir";
        pill.target = "_blank";
        pill.rel = "noopener noreferrer";
    }

    return pill;
}

// Tarjeta simple: sin insignias. Solo título y descripción.
function createSimpleCard(blog, url) {
    const card = document.createElement("article");
    card.className = "item item--simple";

    const title = document.createElement("h3");
    title.className = "blog-simple-title";
    if (url) {
        title.append(createExternalLink(url, blog.Nombre || "Sin nombre"));
    } else {
        title.textContent = blog.Nombre || "Sin nombre";
    }

    const description = document.createElement("p");
    description.className = "descripcion";
    description.textContent = blog.Descripción || "";

    card.append(title, description);
    return card;
}

// Tarjeta destacada: con favicon, país, insignias, categorías y RSS.
function createFeaturedCard(blog, url, badges) {
    const card = document.createElement("article");
    card.className = "item item--featured";
    badges.forEach((badge) => card.classList.add(`item--${badge.toLowerCase()}`));

    // --- Encabezado: identidad (favicon + nombre + país) e insignias ---
    const headerRow = document.createElement("div");
    headerRow.className = "blog-header";

    const identity = document.createElement("div");
    identity.className = "blog-identity";

    const favicon = document.createElement("img");
    favicon.className = "favicon";
    if (url) {
        const domain = new URL(url).hostname;
        favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } else {
        favicon.src = "favicon.ico";
    }
    favicon.alt = "";
    favicon.setAttribute("aria-hidden", "true");
    identity.append(favicon);

    const nameCountry = document.createElement("div");
    nameCountry.className = "blog-name-country";

    const nameEl = document.createElement("span");
    nameEl.className = "blog-name";
    if (url) {
        nameEl.append(createExternalLink(url, blog.Nombre || "Sin nombre"));
    } else {
        nameEl.textContent = blog.Nombre || "Sin nombre";
    }
    nameCountry.append(nameEl);

    if (blog.País) {
        const countryEl = document.createElement("span");
        countryEl.className = "blog-country";
        countryEl.textContent = `${FLAGS[blog.País] || "📍"} ${blog.País.toUpperCase()}`;
        nameCountry.append(countryEl);
    }

    identity.append(nameCountry);
    headerRow.append(identity);

    if (badges.length) {
        const badgeRow = document.createElement("div");
        badgeRow.className = "badge-row";
        badges.forEach((badge) => badgeRow.append(createBadgePill(badge)));
        headerRow.append(badgeRow);
    }

    // --- Descripción ---
    const description = document.createElement("p");
    description.className = "descripcion";
    description.textContent = blog.Descripción || "";

    // --- Pie: categorías + feed RSS ---
    const footerRow = document.createElement("div");
    footerRow.className = "blog-footer";

    const tagsRow = document.createElement("div");
    tagsRow.className = "tags-row";
    if (blog.Categoría) {
        blog.Categoría.split(",")
            .map((category) => category.trim())
            .filter(Boolean)
            .forEach((category) => {
                const tag = document.createElement("span");
                tag.className = "category-tag";
                tag.textContent =
                    `${CATEGORY_ICONS[category.toUpperCase()] || ""} ${category.toUpperCase()}`.trim();
                tagsRow.append(tag);
            });
    }
    footerRow.append(tagsRow);

    const feedUrl = safeUrl(blog.Feed);
    if (feedUrl) {
        const feedLink = createExternalLink(feedUrl, "");
        feedLink.className = "feed-link";
        const feedIcon = document.createElement("img");
        feedIcon.src = "img/rss-16.png";
        feedIcon.alt = "RSS";
        feedLink.append(feedIcon);
        footerRow.append(feedLink);
    }

    card.append(headerRow, description, footerRow);
    return card;
}

function createBlogCard(blog) {
    const url = safeUrl(blog.Url);
    const badges = getActiveBadges(blog);

    return badges.length
        ? createFeaturedCard(blog, url, badges)
        : createSimpleCard(blog, url);
}
function renderBlogs(list) {
    if (!list.length) {
        container.textContent = "No hay blogs con esos filtros 😢";
        return;
    }

    container.replaceChildren(...list.map(createBlogCard));
}

function filterBlogs() {
    const selectedCountry = countryFilter.value;
    const selectedCategory = categoryFilter.value;
    const selectedBadge = badgeFilter.value;
    const message = BADGE_MESSAGES[selectedBadge];

    badgeMessage.textContent = message || "";
    badgeMessage.classList.toggle("is-hidden", !message);

    renderBlogs(
        blogs.filter((blog) => {
            const countryMatches = !selectedCountry || blog.País === selectedCountry;
            const categoryMatches = !selectedCategory || blog.Categoría?.includes(selectedCategory);
            const badgeMatches =
                !selectedBadge ||
                (selectedBadge === "Aliado" && blog.Aliado === "si") ||
                (selectedBadge === "Sponsor" && blog.Sponsor === "si") ||
                (selectedBadge === "Webring" && Boolean(blog.Webring?.trim()));
            return countryMatches && categoryMatches && badgeMatches;
        }),
    );
}

async function loadDirectory() {
    try {
        const response = await fetch("blogs.json");
        if (!response.ok) throw new Error("No se pudo cargar blogs.json");

        blogs = await response.json();
        populateFilters();
        renderBlogs(blogs);
        document.getElementById("contador").textContent =
            `🎉 Ya hay ${blogs.length} blogs personales en español`;
    } catch (error) {
        console.error(error);
        container.textContent = "Error al cargar los blogs 😢";
    }
}

countryFilter.addEventListener("change", filterBlogs);
categoryFilter.addEventListener("change", filterBlogs);
badgeFilter.addEventListener("change", filterBlogs);
loadDirectory();
