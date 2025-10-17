import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

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
const storage = getStorage(app);

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

// Guardar registro con subida de archivos
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) { alert("Debes iniciar sesión."); return; }

  // Subir archivos a Storage
  const archivos = Array.from(inputArchivos.files);
  const urls = [];

  for (let archivo of archivos) {
    const storageRef = ref(storage, `inquilinos/${Date.now()}_${archivo.name}`);
    await uploadBytes(storageRef, archivo);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }

  // Guardar en Firestore
  const data = {
    nombre: document.getElementById("nombre").value,
    motivo: document.getElementById("motivo").value,
    usuario: user.email,
    fecha: new Date().toISOString(),
    estado: "pendiente",
    archivos: urls
  };

  try {
    await addDoc(collection(db, "inquilinos"), data);
    alert("Registro guardado con archivos ✅");
    form.reset();
    listaArchivos.innerHTML = "";
  } catch (err) {
    alert("Error al guardar: " + err.message);
  }
});
