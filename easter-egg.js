// Contenido de tu archivo remoto (ej: https://blogblog.es/easter-egg.js)
const codigoSecreto = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown'];
let indiceSecreto = 0;

document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return; 

    const key = e.key.toLowerCase();

    if (key === codigoSecreto[indiceSecreto]) {
        indiceSecreto++;
        if (indiceSecreto === codigoSecreto.length) {
            window.location.href = 'https://google.com';
            indiceSecreto = 0;
        }
    } else {
        indiceSecreto = 0;
    }
});
