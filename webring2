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
    <div id="my-webring" style="font-family: system-ui, -apple-system, sans-serif; border: 2px solid #222; padding: 15px; text-align: center; max-width: 380px; margin: 20px auto; background: #fff; border-radius: 8px; box-shadow: 2px 2px 0px #222;">
      <h4 style="margin: 0 0 5px 0; font-size: 1.1em; color: #222;">Anillo Web de Aliados</h4>
      <p id="webring-status" style="font-size: 0.85em; margin: 0 0 15px 0; color: #555;">Cargando comunidad...</p>
      <div style="display: flex; justify-content: space-around; font-size: 0.85em; font-weight: bold;">
        <a id="webring-prev" href="#" style="text-decoration: none; color: #0066cc;">[← Anterior]</a>
        <a id="webring-random" href="#" style="text-decoration: none; color: #0066cc;">[Azar]</a>
        <a id="webring-next" href="#" style="text-decoration: none; color: #0066cc;">[Siguiente →]</a>
      </div>
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
