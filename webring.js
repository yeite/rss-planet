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
  <div id="my-webring" style="font-family: system-ui, -apple-system, sans-serif; text-align: center; max-width: 450px; margin: 25px auto; padding: 10px; color: #222;">
      
      <!-- Fila principal integrada: Anterior | Título + Logo | Siguiente -->
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9em; font-weight: 500;">
        
        <a id="webring-prev" href="#" style="text-decoration: none; color: #6BBE30; transition: color 0.2s;">[⏮]</a>
        
        <!-- Bloque Central -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <a href="https://blogblog.es" target="_blank" style="font-weight: bold; font-size: 1em; color: #111; text-decoration: none;">¡Blog!¡Blog!</a>
            <a href="https://blogblog.es" target="_blank" style="display: flex; align-items: center;">
              <img src="https://blogsencastellano.wordpress.com/wp-content/uploads/2025/08/frog-pixel-recortada.gif" alt="¡Blog!¡Blog!" style="height: 20px; width: auto; display: block;" />
            </a>
          </div>
          
          <!-- Botón de Azar representado por el dado -->
          <a id="webring-random" href="#" title="Ir a un blog al azar" style="text-decoration: none; font-size: 1.2em; line-height: 1; margin-top: 2px; transition: transform 0.2s; display: inline-block;">🎲</a>
        </div>

        <a id="webring-next" href="#" style="text-decoration: none; color: #6BBE30; transition: color 0.2s;">[⏭]</a>
        
      </div>

      <!-- Estado informativo discreto abajo del todo -->
      <p id="webring-status" style="font-size: 0.75em; margin: 12px 0 0 0; color: #888; font-style: italic;">Cargando comunidad...</p>

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
