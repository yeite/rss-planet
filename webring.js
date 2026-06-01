const JSON_URL = "https://blogblog.es/blogs.json"; 

function inicializarWebring() {
  // Buscamos el contenedor en la web del usuario
  const contenedor = document.querySelector('.webring-container');
  
  if (!contenedor) {
    console.error("Webring Error: No se encontró un elemento con la clase 'webring-container'.");
    return;
  }

  // Inyectamos el HTML de manera moderna dentro de su contenedor
  contenedor.innerHTML = `
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=PT+Sans+Narrow:wght@700&display=swap" rel="stylesheet" />

<div
    id="my-webring"
    style="
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        max-width: 500px;
        margin: 5px auto;
        padding: 10px;
        color: #222;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    "
>
    <div
        style="
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            font-size: 0.9em;
            font-weight: 500;
            gap: 5px;
        "
    >
        <div style="display: flex; align-items: center; gap: 6px;">
            <a href="https://blogblog.es" 
               target="_blank" 
               style="display: flex; align-items: center; gap: 6px; text-decoration: none; font-family: 'PT Sans Narrow', sans-serif; font-weight: 500; font-size: 1.15em; color: #5a982f;">
                <img src="https://blogsencastellano.wordpress.com/wp-content/uploads/2025/08/frog-pixel-recortada.gif"
                     alt="Logo de ¡Blog!¡Blog!"
                     style="height: 23px; width: auto; display: block; object-fit: contain;" />
                <span>¡Blog!¡Blog!</span>
            </a>
        </div>

        <a id="webring-prev" href="#" target="_self" style="text-decoration: none; color: #6bbe30; transition: color 0.2s;">[⏮︎]</a>
        <a id="webring-next" href="#" target="_self" style="text-decoration: none; color: #6bbe30; transition: color 0.2s;">[⏭︎]</a>

        <a
            id="webring-random"
            href="#"
            target="_self"
            title="Ir a un blog al azar"
            style="
                text-decoration: none;
                font-size: 1.3em;
                line-height: 0;
                transition: transform 0.2s;
                display: inline-block;
                color: #6bbe30;
            "
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" class="bi bi-shuffle" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"/>
                <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192"/>
            </svg>
        </a>
    </div>

    <p id="webring-status" style="font-size: 0.75em; margin: 0; color: #888; font-style: italic;">Cargando comunidad...</p>
</div>
  `;

  fetch(JSON_URL + "?v=" + Math.random())
    .then(response => {
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
      return response.json();
    })
    .then(allSites => {
      const sites = allSites.filter(site => site.Webring && site.Webring.trim() !== "");

      if (sites.length === 0) {
        document.getElementById('webring-status').innerText = "No hay blogs activos en el webring.";
        return;
      }

      // FUNCIÓN AUXILIAR: Normaliza por completo una URL removiendo protocolos, www y barras finales
      const normalizar = (url) => {
        return url.toLowerCase()
                  .replace(/^(https?:\/\/)?(www\.)?/, "")
                  .replace(/\/$/, "")
                  .trim();
      };

      const currentUrlClean = normalizar(window.location.href);
      
      // NUEVA BÚSQUEDA INTEGRAL: Compara de forma precisa para evitar colisiones en carpetas de GitHub Pages
      let currentIndex = sites.findIndex(site => {
        const siteUrlClean = normalizar(site.Webring);
        // Si las URLs son idénticas tras limpiarlas, es un acierto exacto
        if (currentUrlClean === siteUrlClean) return true;
        // Si comparte subcarpeta específica ej: yeite.github.io/lps vs yeite.github.io/esencial
        return currentUrlClean.startsWith(siteUrlClean) || siteUrlClean.startsWith(currentUrlClean);
      });

      if (currentIndex === -1) currentIndex = 0;

      const prevIndex = (currentIndex - 1 + sites.length) % sites.length;
      const nextIndex = (currentIndex + 1) % sites.length;
      
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * sites.length);
      } while (randomIndex === currentIndex && sites.length > 1);

      document.getElementById('webring-prev').href = sites[prevIndex].Webring;
      document.getElementById('webring-next').href = sites[nextIndex].Webring;
      document.getElementById('webring-random').href = sites[randomIndex].Webring;
      
      document.getElementById('webring-status').innerText = `Estás visitando: ${sites[currentIndex].Nombre}`;
    })
    .catch(err => {
      let mensajeError = "Error al conectar con el anillo web.";
      if (err.name === "SyntaxError") {
        mensajeError = "Error: El archivo blogs.json tiene un error de formato (sintaxis).";
      } else {
        mensajeError = err.message;
      }
      document.getElementById('webring-status').innerHTML = `<span style="color: red;">${mensajeError}</span>`;
      console.error(err);
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarWebring);
} else {
  inicializarWebring();
}
