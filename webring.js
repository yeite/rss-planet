const JSON_URL = "https://blogblog.es/blogs.json"; 

document.write(`
  <div id="my-webring" style="font-family: system-ui, -apple-system, sans-serif; border: 2px solid #222; padding: 15px; text-align: center; max-width: 380px; margin: 20px auto; background: #fff; border-radius: 8px; box-shadow: 2px 2px 0px #222;">
    <h4 style="margin: 0 0 5px 0; font-size: 1.1em; color: #222;">Anillo Web de Aliados</h4>
    <p id="webring-status" style="font-size: 0.85em; margin: 0 0 15px 0; color: #555;">Cargando comunidad...</p>
    <div style="display: flex; justify-content: space-around; font-size: 0.85em; font-weight: bold;">
      <a id="webring-prev" href="#" style="text-decoration: none; color: #0066cc;">[← Anterior]</a>
      <a id="webring-random" href="#" style="text-decoration: none; color: #0066cc;">[Azar]</a>
      <a id="webring-next" href="#" style="text-decoration: none; color: #0066cc;">[Siguiente →]</a>
    </div>
  </div>
`);

// Agregamos ?v= aleatorio para saltar la caché vieja rota
fetch(JSON_URL + "?v=" + Math.random())
  .then(response => {
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
    return response.json();
  })
  .then(allSites => {
    const sites = allSites.filter(site => site.Aliado === "si");

    if (sites.length === 0) {
      document.getElementById('webring-status').innerText = "No hay aliados activos.";
      return;
    }

    const currentUrl = window.location.href.replace(/\/$/, "");
    let currentIndex = sites.findIndex(site => currentUrl.includes(site.Url.replace(/\/$/, "")));

    if (currentIndex === -1) currentIndex = 0;

    const prevIndex = (currentIndex - 1 + sites.length) % sites.length;
    const nextIndex = (currentIndex + 1) % sites.length;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * sites.length);
    } while (randomIndex === currentIndex && sites.length > 1);

    document.getElementById('webring-prev').href = sites[prevIndex].Url;
    document.getElementById('webring-next').href = sites[nextIndex].Url;
    document.getElementById('webring-random').href = sites[randomIndex].Url;
    
    document.getElementById('webring-status').innerText = `Estás visitando: ${sites[currentIndex].Nombre}`;
  })
  .catch(err => {
    let mensajeError = "Error al conectar con el anillo web.";
    if (err.name === "SyntaxError") {
      mensajeError = "Error: El archivo webring.json tiene un error de formato (sintaxis).";
    } else {
      mensajeError = err.message;
    }
    document.getElementById('webring-status').innerHTML = `<span style="color: red;">${mensajeError}</span>`;
    console.error(err);
  });
