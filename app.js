// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, getDocs, doc, updateDoc, getDoc 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBZlZdNrP4IwgaeDxpGKSBNlSfsP9rsUg8",
  authDomain: "malos-inquilinos.firebaseapp.com",
  projectId: "malos-inquilinos",
  storageBucket: "malos-inquilinos.firebasestorage.app",
  messagingSenderId: "173364535857",
  appId: "1:173364535857:web:906e69810e94795ac12b10"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Email administrador
const ADMIN_EMAIL = "crjeffrey7@gmail.com";

// ---------- Función Notificación Formspree ----------
async function enviarNotificacion(data) {
  try {
    await fetch("https://formspree.io/f/yourformid", { // <--- reemplaza con tu URL
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
    console.log("Notificación enviada a Formspree ✅");
  } catch (err) {
    console.error("Error enviando notificación:", err);
  }
}

// ---------- AUTENTICACIÓN ----------
// Login y registro
document.getElementById('register-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Usuario registrado con éxito");
  } catch (e) { alert("Error: " + e.message); }
});

document.getElementById('login-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try { await signInWithEmailAndPassword(auth, email, password); }
  catch (e) { alert("Error: " + e.message); }
});

document.getElementById('logout-btn')?.addEventListener('click', () => signOut(auth));

// ---------- DETECTAR USUARIO ----------
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('login-section')?.classList.add('hidden');
    document.getElementById('register-section')?.classList.add('hidden');
    document.getElementById('panel-section')?.classList.remove('hidden');
    cargarInquilinos?.(user);
  } else {
    document.getElementById('login-section')?.classList.remove('hidden');
    document.getElementById('panel-section')?.classList.add('hidden');
  }
});

// ---------- AGREGAR INQUILINO ----------
document.getElementById('inquilino-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nombre: document.getElementById('nombre').value.trim(),
    apodos: document.getElementById('apodos').value.trim(),
    documento: document.getElementById('documento').value.trim(),
    tipoDoc: document.getElementById('tipoDoc')?.value || "",
    pais: document.getElementById('pais')?.value.trim() || "",
    telefono: document.getElementById('telefono')?.value.trim() || "",
    zona: document.getElementById('zona')?.value.trim() || "",
    motivo: document.getElementById('motivo').value.trim(),
    info: document.getElementById('info')?.value.trim() || "",
    etiquetas: document.getElementById('etiquetas')?.value.split(",").map(t => t.trim()).filter(t => t !== "") || [],
    repNombre: document.getElementById('repNombre')?.value.trim() || "",
    repDocumento: document.getElementById('repDocumento')?.value.trim() || "",
    repTipoDoc: document.getElementById('repTipoDoc')?.value || "",
    repNacionalidad: document.getElementById('repNacionalidad')?.value.trim() || "",
    repDireccion: document.getElementById('repDireccion')?.value.trim() || "",
    facebook: document.getElementById('facebook')?.value.trim() || "",
    instagram: document.getElementById('instagram')?.value.trim() || "",
    categoria: document.getElementById('categoria')?.value || "Malos Inquilinos",
    fotos: [
      document.getElementById('foto1')?.value.trim(),
      document.getElementById('foto2')?.value.trim()
    ].filter(f => f !== ""),
    fecha: new Date().toISOString(),
    usuario: auth.currentUser.email,
    estado: "pendiente"
  };

  if (!data.nombre || !data.motivo) { alert("Completa al menos nombre y motivo."); return; }

  try {
    await addDoc(collection(db, "inquilinos"), data);
    await enviarNotificacion(data); // 🔔 enviar notificación
    alert("Registro guardado y notificación enviada ✅");
    e.target.reset();
    cargarInquilinos?.(auth.currentUser);
  } catch (err) { alert("Error al guardar: " + err.message); }
});

// ---------- EDITAR INQUILINO ----------
document.getElementById('editar-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const docRef = doc(db, "inquilinos", id);

  const updatedData = {
    nombre: document.getElementById('nombre').value.trim(),
    apodos: document.getElementById('apodos').value.trim(),
    documento: document.getElementById('documento').value.trim(),
    tipoDoc: document.getElementById('tipoDoc')?.value || "",
    pais: document.getElementById('pais')?.value.trim() || "",
    telefono: document.getElementById('telefono')?.value.trim() || "",
    zona: document.getElementById('zona')?.value.trim() || "",
    motivo: document.getElementById('motivo').value.trim(),
    info: document.getElementById('info')?.value.trim() || "",
    etiquetas: document.getElementById('etiquetas')?.value.split(",").map(t => t.trim()).filter(t => t !== "") || [],
    repNombre: document.getElementById('repNombre')?.value.trim() || "",
    repDocumento: document.getElementById('repDocumento')?.value.trim() || "",
    repTipoDoc: document.getElementById('repTipoDoc')?.value || "",
    repNacionalidad: document.getElementById('repNacionalidad')?.value.trim() || "",
    repDireccion: document.getElementById('repDireccion')?.value.trim() || "",
    facebook: document.getElementById('facebook')?.value.trim() || "",
    instagram: document.getElementById('instagram')?.value.trim() || "",
    categoria: document.getElementById('categoria')?.value || "Malos Inquilinos",
    fotos: [
      document.getElementById('foto1')?.value.trim(),
      document.getElementById('foto2')?.value.trim()
    ].filter(f => f !== ""),
    estado: "pendiente"
  };

  try {
    await updateDoc(docRef, updatedData);
    await enviarNotificacion(updatedData); // 🔔 notificación al editar
    alert("Cambios guardados y notificación enviada ✅");
    window.location.href = "panel.html";
  } catch (err) { alert("Error al guardar: " + err.message); }
});

// ---------- CARGAR INQUILINOS PANEL ----------
async function cargarInquilinos(user) {
  const lista = document.getElementById('lista-inquilinos');
  if (!lista) return;

  lista.innerHTML = "<p class='col-span-full text-center text-gray-500'>Cargando registros...</p>";
  const querySnapshot = await getDocs(collection(db, "inquilinos"));
  lista.innerHTML = "";

  if (querySnapshot.empty) {
    lista.innerHTML = "<p class='col-span-full text-center text-gray-400'>No hay registros todavía.</p>";
    return;
  }

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement("li");
    card.className = "bg-white rounded-xl shadow p-4 flex flex-col gap-3";

    const foto = data.fotos && data.fotos.length > 0 ? data.fotos[0] : "https://via.placeholder.com/300x200?text=Sin+Foto";
    card.innerHTML = `
      <img src="${foto}" alt="foto inquilino" class="rounded-lg object-cover w-full h-48">
      <div>
        <h3 class="text-lg font-semibold">${data.nombre}</h3>
        <p class="text-gray-600">${data.motivo}</p>
        <p class="text-sm text-gray-500">Estado: ${data.estado}</p>
      </div>
      ${data.usuario === user.email ? `<a href="editar.html?id=${id}" class="text-indigo-600 hover:underline">Editar</a>` : ""}
    `;
    lista.appendChild(card);
  });
}
