import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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

const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
  else cargarInquilinos();
});

const buscador = document.getElementById("buscador");
const resultadosDiv = document.getElementById("resultados");
let todosInquilinos = [];

// Cargar registros aprobados
async function cargarInquilinos() {
  const querySnapshot = await getDocs(collection(db, "inquilinos"));
  todosInquilinos = [];
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.estado === "aprobado") {
      todosInquilinos.push(data);
    }
  });
  mostrarResultados(todosInquilinos);
}

// Mostrar resultados en tarjetas con fotos/videos
function mostrarResultados(lista) {
  resultadosDiv.innerHTML = "";
  lista.forEach(data => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow flex flex-col gap-2";

    let mediaHTML = "";
    if (data.archivos && data.archivos.length) {
      mediaHTML = '<div class="flex flex-wrap gap-2">';
      data.archivos.forEach(url => {
        if (url.match(/\.(mp4|webm|ogg)$/i)) {
          mediaHTML += `<video src="${url}" controls class="w-full h-40 rounded"></video>`;
        } else {
          mediaHTML += `<img src="${url}" alt="Foto" class="w-full h-40 object-cover rounded">`;
        }
      });
      mediaHTML += '</div>';
    }

    card.innerHTML = `
      <h3 class="font-semibold text-lg">${data.nombre}</h3>
      <p><strong>Motivo:</strong> ${data.motivo}</p>
      <p><strong>Zona:</strong> ${data.zona || "No especificada"}</p>
      ${mediaHTML}
    `;

    resultadosDiv.appendChild(card);
  });
}

// Filtrar mientras escribe
buscador.addEventListener("input", () => {
  const filtro = buscador.value.toLowerCase();
  const filtrados = todosInquilinos.filter(i => i.nombre.toLowerCase().includes(filtro));
  mostrarResultados(filtrados);
});
