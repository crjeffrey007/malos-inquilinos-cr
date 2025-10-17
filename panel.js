import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Firebase
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

const listaDiv = document.getElementById("lista-inquilinos");
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => signOut(auth));

// Verificar usuario autenticado
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html"; // si no hay sesión, redirigir
  } else {
    cargarRegistros();
  }
});

// Cargar registros pendientes
async function cargarRegistros() {
  listaDiv.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "inquilinos"));
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.estado === "pendiente") {
      const div = document.createElement("div");
      div.className = "bg-white p-4 shadow rounded flex flex-col gap-2";

      div.innerHTML = `
        <strong>Nombre:</strong> ${data.nombre} <br>
        <strong>Motivo:</strong> ${data.motivo} <br>
        <strong>Usuario:</strong> ${data.usuario} <br>
        <strong>Fecha:</strong> ${new Date(data.fecha).toLocaleString()} <br>
        <strong>Archivos:</strong>
        <div class="flex flex-wrap gap-2 mb-2">
          ${data.archivos?.map(url => `<a href="${url}" target="_blank" class="bg-gray-200 px-2 py-1 rounded text-sm">${url.split("/").pop()}</a>`).join("") || "No hay archivos"}
        </div>
        <div class="flex gap-2 mt-2">
          <button class="aprobar-btn bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Aprobar</button>
          <button class="rechazar-btn bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Rechazar</button>
          <button class="editar-btn bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Editar</button>
        </div>
      `;

      // Aprobar
      div.querySelector(".aprobar-btn").addEventListener("click", async () => {
        await updateDoc(doc(db, "inquilinos", docSnap.id), { estado: "aprobado" });
        cargarRegistros();
      });

      // Rechazar
      div.querySelector(".rechazar-btn").addEventListener("click", async () => {
        await updateDoc(doc(db, "inquilinos", docSnap.id), { estado: "rechazado" });
        cargarRegistros();
      });

      // Editar
      div.querySelector(".editar-btn").addEventListener("click", () => {
        localStorage.setItem("registroEditar", docSnap.id);
        window.location.href = "editar.html";
      });

      listaDiv.appendChild(div);
    }
  });
}
