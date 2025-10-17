// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔧 Configuración Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_ID_PROYECTO",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🧩 Elementos del DOM
const authSection = document.getElementById("auth-section");
const panelSection = document.getElementById("panel-section");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const form = document.getElementById("inquilinoForm");
const lista = document.getElementById("listaInquilinos");
const msg = document.getElementById("auth-msg");

// 🔐 Estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.style.display = "none";
    panelSection.style.display = "block";
    cargarReportes();
  } else {
    authSection.style.display = "block";
    panelSection.style.display = "none";
  }
});

// 🔑 Login / Registro / Logout
loginBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    msg.textContent = e.message;
  }
};

registerBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) {
    msg.textContent = e.message;
  }
};

logoutBtn.onclick = () => signOut(auth);

// 📝 Guardar reporte
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    nombre: nombre.value,
    apodos: apodos.value,
    documento: documento.value,
    tipoDocumento: tipoDocumento.value,
    pais: pais.value,
    fotos: fotos.value,
    telefono: telefono.value,
    zona: zona.value,
    motivos: motivos.value,
    evidencia: evidencia.value,
    infoAdicional: infoAdicional.value,
    etiquetas: etiquetas.value,
    representante: representante.value,
    docRepresentante: docRepresentante.value,
    tipoDocRepresentante: tipoDocRepresentante.value,
    nacionalidad: nacionalidad.value,
    direccion: direccion.value,
    facebook: facebook.value,
    instagram: instagram.value,
    fecha: new Date().toISOString()
  };
  await addDoc(collection(db, "inquilinos"), data);
  alert("Reporte guardado correctamente");

  // Notificación por Formspree
  fetch("https://formspree.io/f/XXXXXXXX", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: `Nuevo reporte: ${data.nombre}` })
  });

  form.reset();
});

// 📋 Mostrar reportes
function cargarReportes() {
  const q = query(collection(db, "inquilinos"), orderBy("fecha", "desc"));
  onSnapshot(q, (snap) => {
    lista.innerHTML = "";
    snap.forEach((doc) => {
      const d = doc.data();
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <h3>${d.nombre}</h3>
        <p><b>Apodos:</b> ${d.apodos || ""}</p>
        <p><b>Motivos:</b> ${d.motivos || ""}</p>
        <p><b>Zona:</b> ${d.zona || ""}</p>
        ${d.fotos ? `<a href="${d.fotos}" target="_blank">Ver Fotos</a>` : ""}
      `;
      lista.appendChild(div);
    });
  });
}
