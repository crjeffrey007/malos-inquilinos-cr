import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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

// Cloudinary
const CLOUD_NAME = "dvijtn6ti";
const UPLOAD_PRESET = "malos-inquilinos-preset"; // tu preset unsigned

// Formspree
const FORMSPREE_URL = "https://formspree.io/f/yourformid"; // reemplaza

const form = document.getElementById("editar-form");
const inputArchivos = document.getElementById("archivos-nuevos");
const listaArchivos = document.getElementById("lista-archivos");
const archivosExistentesDiv = document.getElementById("archivos-existentes");

let registroId = localStorage.getItem("registroEditar"); // id del doc a editar

// Mostrar archivos nuevos seleccionados
inputArchivos.addEventListener("change", () => {
  listaArchivos.innerHTML = "";
  Array.from(inputArchivos.files).forEach(file => {
    const li = document.createElement("li");
    li.textContent = file.name;
    li.className = "bg-gray-200 px-2 py-1 rounded text-sm";
    listaArchivos.appendChild(li);
  });
});

// Subir a Cloudinary
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

// Cargar registro existente
async function cargarRegistro() {
  if (!registroId) { alert("No se especificó registro"); return; }
  const docRef = doc(db, "inquilinos", registroId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) { alert("Registro no encontrado"); return; }

  const data = docSnap.data();
  form.nombre.value = data.nombre || "";
  form.apodos.value = data.apodos || "";
  form.documento.value = data.documento || "";
  form.tipoDoc.value = data.tipoDoc || "";
  form.pais.value = data.pais || "";
  form.telefono.value = data.telefono || "";
  form.zona.value = data.zona || "";
  form.motivo.value = data.motivo || "";
  form.info.value = data.info || "";
  form.etiquetas.value = data.etiquetas ? data.etiquetas.join(",") : "";
  form.repNombre.value = data.repNombre || "";
  form.repDocumento.value = data.repDocumento || "";
  form.repTipoDoc.value = data.repTipoDoc || "";
  form.repNacionalidad.value = data.repNacionalidad || "";
  form.repDireccion.value = data.repDireccion || "";
  form.facebook.value = data.facebook || "";
  form.instagram.value = data.instagram || "";
  form.categoria.value = data.categoria || "Malos Inquilinos";

  // Mostrar archivos existentes
  archivosExistentesDiv.innerHTML = "";
  data.archivos?.forEach(url => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.textContent = url.split("/").pop();
    a.className = "bg-gray-300 px-2 py-1 rounded text-sm";
    archivosExistentesDiv.appendChild(a);
  });
}

cargarRegistro();

// Submit actualización
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) { alert("Debes iniciar sesión."); return; }

  // Subir archivos nuevos
  const nuevosArchivos = Array.from(inputArchivos.files);
  const urlsNuevos = [];
  for (let file of nuevosArchivos) {
    const url = await subirArchivoCloudinary(file);
    urlsNuevos.push(url);
  }

  const docRef = doc(db, "inquilinos", registroId);
  const dataActualizada = {
    nombre: form.nombre.value.trim(),
    apodos: form.apodos.value.trim(),
    documento: form.documento.value.trim(),
    tipoDoc: form.tipoDoc.value,
    pais: form.pais.value.trim(),
    telefono: form.telefono.value.trim(),
    zona: form.zona.value.trim(),
    motivo: form.motivo.value.trim(),
    info: form.info.value.trim(),
    etiquetas: form.etiquetas.value.split(",").map(t => t.trim()).filter(t=>t!==""),
    repNombre: form.repNombre.value.trim(),
    repDocumento: form.repDocumento.value.trim(),
    repTipoDoc: form.repTipoDoc.value,
    repNacionalidad: form.repNacionalidad.value.trim(),
    repDireccion: form.repDireccion.value.trim(),
    facebook: form.facebook.value.trim(),
    instagram: form.instagram.value.trim(),
    categoria: form.categoria.value,
    estado: "pendiente" // vuelve a pendiente para revisión
  };

  // Agregar archivos existentes + nuevos
  const docSnap = await getDoc(docRef);
  const archivosExistentes = docSnap.data()?.archivos || [];
  dataActualizada.archivos = [...archivosExistentes, ...urlsNuevos];

  await updateDoc(docRef, dataActualizada);
  alert("Registro actualizado y enviado a revisión ✅");
  form.reset();
  listaArchivos.innerHTML = "";
  archivosExistentesDiv.innerHTML = "";
});
