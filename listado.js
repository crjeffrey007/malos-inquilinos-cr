import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBZlZdNrP4IwgaeDxpGKSBNlSfsP9rsUg8",
  authDomain: "malos-inquilinos.firebaseapp.com",
  projectId: "malos-inquilinos",
  storageBucket: "malos-inquilinos.appspot.com",
  messagingSenderId: "173364535857",
  appId: "1:173364535857:web:906e69810e94795ac12b10"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const galeria = document.getElementById("galeria");
const buscador = document.getElementById("buscador");
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => signOut(auth));

let todosInquilinos = [];

// Verificar usuario autenticado
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html"; // redirige si no hay sesión
  } else {
    cargarInquilinos();
  }
});

// Cargar registros aprobados
async function cargarInquilinos() {
  const snapshot = await getDocs(collection(db, "inquilinos"));
  todosInquilinos = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.estado === "aprobado") {
      todosInquilinos.push(data);
    }
  });
  mostrarGaleria(todosInquilinos);
}

// Mostrar en galería
function mostrarGaleria(lista) {
  galeria.innerHTML = "";
  lista.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-white rounded shadow overflow-hidden flex flex-col";

    const thumbnail = item.archivos && item.archivos.length ? item.archivos[0] : "";
    const mediaHTML = thumbnail ? `<img src="${thumbnail}" alt="Foto" class="w-full h-48 object-cover">` : `<div class="w-full h-48 bg-gray-200 flex items-center justify-center">No imagen</div>`;

    card.innerHTML = `
      ${mediaHTML}
      <div class="p-2 flex flex-col gap-1">
        <h3 class="font-semibold text-lg truncate">${item.nombre}</h3>
        <p class="text-sm truncate">${item.motivo}</p>
        <p class="text-xs text-gray-500">${item.zona || ""}</p>
      </div>
    `;
    galeria.appendChild(card);
  });
}

// Buscador predictivo
buscador.addEventListener("input", () => {
  const filtro = buscador.value.toLowerCase();
  const filtrados = todosInquilinos.filter(i => i.nombre.toLowerCase().includes(filtro));
  mostrarGaleria(filtrados);
});
