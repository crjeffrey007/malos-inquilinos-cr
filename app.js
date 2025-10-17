// Importar Firebase (versión modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// 🔐 Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBZlZdNrP4IwgaeDxpGKSBNlSfsP9rsUg8",
  authDomain: "malos-inquilinos.firebaseapp.com",
  projectId: "malos-inquilinos",
  storageBucket: "malos-inquilinos.firebasestorage.app",
  messagingSenderId: "173364535857",
  appId: "1:173364535857:web:906e69810e94795ac12b10"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elementos del DOM
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const panelSection = document.getElementById("panel-section");

const showLogin = document.getElementById("show-login");
const showRegister = document.getElementById("show-register");

// Alternar entre login y registro
if (showRegister && showLogin) {
  showRegister.addEventListener("click", () => {
    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");
  });

  showLogin.addEventListener("click", () => {
    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
  });
}

// Registro de usuario
const registerBtn = document.getElementById("register-btn");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Usuario registrado con éxito");
    } catch (e) {
      alert("⚠️ Error al registrar: " + e.message);
    }
  });
}

// Inicio de sesión
const loginBtn = document.getElementById("login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      alert("⚠️ Error al iniciar sesión: " + e.message);
    }
  });
}

// Cerrar sesión
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => signOut(auth));
}

// Detectar sesión activa
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    panelSection.classList.remove("hidden");
    cargarInquilinos();
  } else {
    loginSection.classList.remove("hidden");
    panelSection.classList.add("hidden");
  }
});

// Guardar inquilino (versión extendida)
const inquilinoForm = document.getElementById("inquilino-form");
if (inquilinoForm) {
  inquilinoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recoger los datos del formulario
    const data = {
      nombre: document.getElementById("nombre").value.trim(),
      apodos: document.getElementById("apodos").value.trim(),
      documento: document.getElementById("documento").value.trim(),
      tipoDoc: document.getElementById("tipoDoc").value,
      pais: document.getElementById("pais").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      zona: document.getElementById("zona").value.trim(),
      motivo: document.getElementById("motivo").value.trim(),
      info: document.getElementById("info").value.trim(),
      etiquetas: document
        .getElementById("etiquetas")
        .value.split(",")
        .map((t) => t.trim())
        .filter((t) => t !== ""),

      // Representante
      repNombre: document.getElementById("repNombre").value.trim(),
      repDocumento: document.getElementById("repDocumento").value.trim(),
      repTipoDoc: document.getElementById("repTipoDoc").value,
      repNacionalidad: document.getElementById("repNacionalidad").value.trim(),
      repDireccion: document.getElementById("repDireccion").value.trim(),

      // Redes y categoría
      facebook: document.getElementById("facebook").value.trim(),
      instagram: document.getElementById("instagram").value.trim(),
      categoria: document.getElementById("categoria").value,

      // Evidencias (URLs)
      fotos: [
        document.getElementById("foto1").value.trim(),
        document.getElementById("foto2").value.trim(),
      ].filter((f) => f !== ""),

      fecha: new Date().toISOString(),
      usuario: auth.currentUser ? auth.currentUser.email : "anónimo",
    };

    // Validación mínima
    if (!data.nombre || !data.motivo) {
      alert("⚠️ Completa al menos el nombre y el motivo del reporte.");
      return;
    }

    try {
      await addDoc(collection(db, "inquilinos"), data);
      alert("✅ Registro guardado correctamente.");
      e.target.reset();
      cargarInquilinos();
    } catch (error) {
      alert("⚠️ Error al guardar: " + error.message);
    }
  });
}

// Cargar inquilinos
async function cargarInquilinos() {
  const lista = document.getElementById("lista-inquilinos");
  if (!lista) return;

  lista.innerHTML = "<li>Cargando...</li>";

  try {
    const querySnapshot = await getDocs(collection(db, "inquilinos"));
    lista.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${data.nombre}</strong> — ${data.motivo}
        <br><small>${data.fecha ? new Date(data.fecha).toLocaleString() : ""}</small>
      `;
      lista.appendChild(li);
    });

    if (lista.innerHTML === "") {
      lista.innerHTML = "<li>No hay registros aún.</li>";
    }
  } catch (err) {
    lista.innerHTML = "<li>Error al cargar registros.</li>";
    console.error("Error al cargar inquilinos:", err);
  }
}
