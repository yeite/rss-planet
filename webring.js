const JSON_URL = "https://blogblog.es/blogs.json";
// ⚠️ REEMPLAZA ESTO con la URL real de tu archivo CSS en internet
const CSS_URL = "https://blogblog.es/css/webring.css";

function inicializarWebring() {
  // 1. Inyectamos dinámicamente el CSS externo en el <head> de la web del usuario
  if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
    const linkCSS = document.createElement("link");
    linkCSS.rel = "stylesheet";
    linkCSS.href = CSS_URL;
    document.head.appendChild(linkCSS);
  }

  // Buscamos el contenedor en la web del usuario
  const contenedor = document.querySelector(".webring-container");

  if (!contenedor) {
    console.error(
      "Webring Error: No se encontró un elemento con la clase 'webring-container'.",
    );
    return;
  }

  // 2. Inyectamos el HTML limpio (Las fuentes de Google se cargan dentro del archivo CSS)
  contenedor.innerHTML = `
<div id="my-webring">
    <div class="blogblog-nav">
        <div class="blogblog-brand-wrapper">
            <a href="https://blogblog.es" target="_blank" rel="noopener noreferrer" class="blogblog-brand-link">
                <img src="https://raw.githubusercontent.com/yeite/rss-planet/main/img/frog-pixel-recortada.gif"
                     alt="Logo de ¡Blog!¡Blog!"
                     class="blogblog-logo" />
                <span>¡Blog!¡Blog!</span>
            </a>
        </div>

        <a id="webring-prev" class="blogblog-btn-nav" href="#" target="_self">[⏮︎]</a>
        <a id="webring-next" class="blogblog-btn-nav" href="#" target="_self">[⏭︎]</a>

        <a id="webring-random" class="blogblog-btn-random" href="#" target="_self" title="Ir a un blog al azar">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="bi bi-shuffle" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"/>
                <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192"/>
            </svg>
        </a>
    </div>

    <p id="webring-status">Cargando comunidad...</p>
</div>
  `;

  fetch(JSON_URL + "?v=" + Math.random())
    .then((response) => {
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
      return response.json();
    })
    .then((allSites) => {
      const sites = allSites.filter(
        (site) => site.Webring && site.Webring.trim() !== "",
      );

      if (sites.length === 0) {
        document.getElementById("webring-status").innerText =
          "No hay blogs activos en el webring.";
        return;
      }

      const normalizar = (url) => {
        return url
          .toLowerCase()
          .replace(/^(https?:\/\/)?(www\.)?/, "")
          .replace(/\/$/, "")
          .trim();
      };

      const currentUrlClean = normalizar(window.location.href);

      let currentIndex = sites.findIndex((site) => {
        const siteUrlClean = normalizar(site.Webring);
        if (currentUrlClean === siteUrlClean) return true;
        return (
          currentUrlClean.startsWith(siteUrlClean) ||
          siteUrlClean.startsWith(currentUrlClean)
        );
      });

      const noEncontrado = currentIndex === -1;

      if (noEncontrado) {
        currentIndex = 0;
      }

      const prevIndex = (currentIndex - 1 + sites.length) % sites.length;
      const nextIndex = (currentIndex + 1) % sites.length;

      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * sites.length);
      } while (randomIndex === currentIndex && sites.length > 1);

      document.getElementById("webring-prev").href = sites[prevIndex].Webring;
      document.getElementById("webring-next").href = sites[nextIndex].Webring;
      document.getElementById("webring-random").href =
        sites[randomIndex].Webring;

      if (noEncontrado) {
        document.getElementById("webring-status").innerText =
          "Blogs personales en Español";
      } else {
        document.getElementById("webring-status").innerText =
          `Estás visitando: ${sites[currentIndex].Nombre}`;
      }
    })
    .catch((err) => {
      let mensajeError = "Error al conectar con el anillo web.";
      if (err.name === "SyntaxError") {
        mensajeError =
          "Error: El archivo blogs.json tiene un error de formato (sintaxis).";
      } else {
        mensajeError = err.message;
      }
      document.getElementById("webring-status").innerHTML =
        `<span class="blogblog-error">${mensajeError}</span>`;
      console.error(err);
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarWebring);
} else {
  inicializarWebring();
}
