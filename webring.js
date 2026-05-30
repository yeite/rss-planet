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
<!-- 1. Cargamos la tipografía fija desde los servidores de Google Fonts -->
<link rel="preconnect" href="https://googleapis.com" />
<link rel="preconnect" href="https://gstatic.com" crossorigin />
<link
    href="https://googleapis.com/css2?family=PT+Sans+Narrow:wght@700&display=swap"
    rel="stylesheet"
/>

<div
    id="my-webring"
    style="
        font-family:
            system-ui,
            -apple-system,
            sans-serif;
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
    <!-- FILA SUPERIOR: Anterior | Título + Logo | Siguiente (Todos en una sola línea) -->
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
        <!-- Bloque de Título Central con la Ranita -->
        <div style="display: flex; align-items: center; gap: 1px">
            <a
                href="https://blogblog.es"
                target="_blank"
                style="display: flex; align-items: center"
            >
                <img
                    src="https://blogsencastellano.wordpress.com/wp-content/uploads/2025/08/frog-pixel-recortada.gif"
                    alt="¡Blog!¡Blog!"
                    style="height: 23px; width: 23px; display: block"
                />
            </a>

            <!-- SE AGREGA LA PROPIEDAD font-family AQUÍ -->
            <a
                href="https://blogblog.es"
                target="_blank"
                style="
                    font-family: &quot;PT Sans Narrow&quot;, sans-serif;
                    font-weight: 500;
                    font-size: 1.15em;
                    color: #5a982f;
                    text-decoration: none;
                    letter-spacing: -0px;
                "
                >¡Blog!¡Blog!</a
            >
        </div>

        <!-- Botón Anterior -->
        <a
            id="webring-prev"
            href="#"
            target="_self"
            style="
                text-decoration: none;
                color: #6bbe30;
                transition: color 0.2s;
            "
            >[⏮︎]</a
        >

        <!-- Botón Siguiente -->
        <a
            id="webring-next"
            href="#"
            target="_self"
            style="
                text-decoration: none;
                color: #6bbe30;
                transition: color 0.2s;
            "
            >[⏭︎]</a
        >

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
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                fill="currentColor"
                class="bi bi-shuffle"
                viewBox="0 0 16 16"
                stroke-width="500"
            >
                <path
                    fill-rule="evenodd"
                    d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.6 9.6 0 0 0 7.556 8a9.6 9.6 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.6 10.6 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.6 9.6 0 0 0 6.444 8a9.6 9.6 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5"
                />
                <path
                    d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192"
                />
            </svg>
        </a>
    </div>

    <!-- FILA INFERIOR: Botón de Azar centrado justo debajo -->

    <!-- Estado informativo discreto abajo del todo -->
    <p
        id="webring-status"
        style="
            font-size: 0.75em;
            margin: 0 0 0 0;
            color: #888;
            font-style: italic;
        "
    >
        Cargando comunidad...
    </p>
</div>


  `;

  // Pedimos el JSON de tu servidor ignorando la caché vieja
  fetch(JSON_URL + "?v=" + Math.random())
    .then(response => {
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
      return response.json();
    })
    .then(allSites => {
      // NUEVO FILTRO: Solo participan los blogs que tienen el campo "webring" definido y no vacío
      const sites = allSites.filter(site => site.webring && site.webring.trim() !== "");

      if (sites.length === 0) {
        document.getElementById('webring-status').innerText = "No hay blogs activos en el webring.";
        return;
      }

      // Convertimos la URL actual del navegador a minúsculas y limpiamos barras finales
      const currentUrl = window.location.href.toLowerCase().replace(/\/$/, "");
      
      // NUEVA BÚSQUEDA: Compara la URL actual usando el valor del campo "webring"
      let currentIndex = sites.findIndex(site => {
        const cleanWebringUrl = site.webring.toLowerCase().replace(/\/$/, "");
        return currentUrl.includes(cleanWebringUrl) || cleanWebringUrl.includes(currentUrl);
      });

      // Si estás haciendo pruebas y la URL actual no está en la lista, arranca en el primero (0)
      if (currentIndex === -1) currentIndex = 0;

      // Calcular navegación cíclica del anillo
      const prevIndex = (currentIndex - 1 + sites.length) % sites.length;
      const nextIndex = (currentIndex + 1) % sites.length;
      
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * sites.length);
      } while (randomIndex === currentIndex && sites.length > 1);

      // ASIGNACIÓN DE ENLACES: Usan el valor del campo "webring"
      document.getElementById('webring-prev').href = sites[prevIndex].webring;
      document.getElementById('webring-next').href = sites[nextIndex].webring;
      document.getElementById('webring-random').href = sites[randomIndex].webring;
      
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

// Ejecutamos el script de forma segura cuando el HTML base esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarWebring);
} else {
  inicializarWebring();
}
