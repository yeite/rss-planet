// 1. Todo el array en minúsculas para que coincida con e.key.toLowerCase()
const codigoSecreto = [
  'arrowup', 'arrowup', 
  'arrowdown', 'arrowdown', 
  'arrowleft', 'arrowright', 
  'arrowleft', 'arrowright', 
  'b', 'a'
];
let indiceSecreto = 0;

document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return; 

    const key = e.key.toLowerCase();

    if (key === codigoSecreto[indiceSecreto]) {
        indiceSecreto++;
        if (indiceSecreto === codigoSecreto.length) {
            window.location.href = 'https://blogblog.es';
            indiceSecreto = 0;
        }
    } else {
        // MEJORA: Si falla, comprobamos si la tecla rota vuelve a ser la primera ('arrowup').
        // Así, si el usuario hace: Arriba, Arriba, Arriba... el tercer "Arriba" cuenta como el primero correcto.
        indiceSecreto = (key === codigoSecreto[0]) ? 1 : 0;
    }
});
