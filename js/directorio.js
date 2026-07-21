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

function formatCategories(categories) {
    if (!categories) return "-";

    return categories
        .split(",")
        .map((category) => category.trim())
        .map((category) => `${CATEGORY_ICONS[category.toUpperCase()] || ""} ${category}`.trim())
        .join(", ");
}

function addBadge(parent, blog) {
    if (blog.Aliado === "si") {
        const image = document.createElement("img");
        image.src = "img/frog-pixel-recortada.gif";
        image.alt = "Aliado";
        parent.append(" ", image);
    }

    if (blog.Sponsor === "si") {
        parent.append(" ", createExternalLink("https://ko-fi.com/matizeta", "⭐️"));
    }

    if (blog.Webring?.trim()) {
        parent.append(" ", createExternalLink("https://blogblog.es/webring.html", "🪐"));
    }
}

function createBlogCard(blog) {
    const card = document.createElement("article");
    card.className = "item";
    if (blog.Aliado === "si") card.classList.add("aliado");
    if (blog.Sponsor === "si") card.classList.add("sponsor");
    if (blog.Webring?.trim()) card.classList.add("webring");

    const heading = document.createElement("div");
    heading.className = "blog";

    // 1. EXTRAEMOS LA URL Y OBTENEMOS EL FAVICON CORRESPONDIENTE
    const url = safeUrl(blog.Url);
    const favicon = document.createElement("img");
    favicon.className = "favicon";

    if (url) {
        // Extrae el dominio (ej: "luiscarlospando.com")
        const domain = new URL(url).hostname;
        // Pide el favicon exacto de ese sitio a Google
        favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } else {
        // Respaldos si no hay URL válida
        favicon.src = "favicon.ico";
    }

    favicon.alt = "";
    favicon.setAttribute("aria-hidden", "true");
    heading.append(favicon);

    // 2. AGREGAMOS EL NOMBRE CON SU ENLACE
    if (url) {
        heading.append(createExternalLink(url, blog.Nombre || "Sin nombre"));
    } else {
        heading.append(blog.Nombre || "Sin nombre");
    }
    
    addBadge(heading, blog);

    // 3. DESCRIPCIÓN
    const description = document.createElement("p");
    description.className = "descripcion";
    description.textContent = blog.Descripción || "";

    // 4. DETALLES (Categoría y País)
    const details = document.createElement("p");
    const categoryLabel = document.createElement("strong");
    categoryLabel.textContent = "Categoría: ";
    const countryLabel = document.createElement("strong");
    countryLabel.textContent = "País: ";
    details.append(
        categoryLabel,
        formatCategories(blog.Categoría),
        document.createElement("br"),
        countryLabel,
        `${FLAGS[blog.País] || ""} ${blog.País || "-"}`.trim(),
    );

    card.append(heading, description, details);

    // 5. ENLACE AL FEED RSS
    const feedUrl = safeUrl(blog.Feed);
    if (feedUrl) {
        const feedLink = createExternalLink(feedUrl, "");
        const feedIcon = document.createElement("img");
        feedIcon.src = "img/rss-16.png";
        feedIcon.alt = "RSS";
        feedLink.append(feedIcon);
        card.append(feedLink);
    }

    return card;
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
