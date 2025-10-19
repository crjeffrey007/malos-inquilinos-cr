import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Config Firebase
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

// Cloudinary
const CLOUD_NAME = "media-anuncios";
const UPLOAD_PRESET = "malos-inquilinos"; // tu preset unsigned

// Formspree
const FORMSPREE_URL = "https://formspree.io/f/yourformid"; // reemplaza

const form = document.getElementById("inquilino-form");
const inputArchivos = document.getElementById("archivos");
const listaArchivos = document.getElementById("lista-archivos");

// Mostrar archivos seleccionados
inputArchivos.addEventListener("change", () => {
  listaArchivos.innerHTML = "";
  Array.from(inputArchivos.files).forEach(file => {
    const li = document.createElement("li");
    li.textContent = file.name;
    li.className = "bg-gray-200 px-2 py-1 rounded text-sm";
    listaArchivos.appendChild(li);
  });
});

// Subir archivo a Cloudinary
async function subirArchivoCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  return data.secure_url;
}

// Notificación Formspree
async function enviarNotificacion(data) {
  await fetch(FORMSPREE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      _subject: `Nuevo registro de inquilino: ${data.nombre}`,
      nombre: data.nombre,
      motivo: data.motivo,
      usuario: data.usuario,
      fecha: data.fecha
    })
  });
}

// Submit formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) { alert("Debes iniciar sesión."); return; }

  // Subir archivos
  const archivos = Array.from(inputArchivos.files);
  const urls = [];
  for (let file of archivos) {
    const url = await subirArchivoCloudinary(file);
    urls.push(url);
  }

  // Guardar datos
  const data = {
    nombre: document.getElementById("nombre").value.trim(),
    apodos: document.getElementById("apodos")?.value.trim() || "",
    documento: document.getElementById("documento")?.value.trim() || "",
    tipoDoc: document.getElementById("tipoDoc")?.value || "",
    pais: document.getElementById("pais")?.value.trim() || "",
    telefono: document.getElementById("telefono")?.value.trim() || "",
    zona: document.getElementById("zona")?.value.trim() || "",
    motivo: document.getElementById("motivo").value.trim(),
    info: document.getElementById("info")?.value.trim() || "",
    etiquetas: document.getElementById("etiquetas")?.value.split(",").map(t => t.trim()).filter(t=>t!=="") || [],
    repNombre: document.getElementById("repNombre")?.value.trim() || "",
    repDocumento: document.getElementById("repDocumento")?.value.trim() || "",
    repTipoDoc: document.getElementById("repTipoDoc")?.value || "",
    repNacionalidad: document.getElementById("repNacionalidad")?.value.trim() || "",
    repDireccion: document.getElementById("repDireccion")?.value.trim() || "",
    facebook: document.getElementById("facebook")?.value.trim() || "",
    instagram: document.getElementById("instagram")?.value.trim() || "",
    categoria: document.getElementById("categoria")?.value || "Malos Inquilinos",
    archivos: urls,
    fecha: new Date().toISOString(),
    usuario: user.email,
    estado: "pendiente"
  };

  if (!data.nombre || !data.motivo) { alert("Nombre y motivo obligatorios"); return; }

  await addDoc(collection(db, "inquilinos"), data);
  await enviarNotificacion(data);
  alert("Registro guardado con archivos y notificación ✅");
  form.reset();
  listaArchivos.innerHTML = "";
});
