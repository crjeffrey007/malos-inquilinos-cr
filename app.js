// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Tu configuración
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
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const panelSection = document.getElementById('panel-section');

const showLogin = document.getElementById('show-login');
const showRegister = document.getElementById('show-register');

showRegister.addEventListener('click', () => {
  loginSection.classList.add('hidden');
  registerSection.classList.remove('hidden');
});

showLogin.addEventListener('click', () => {
  registerSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
});

// Registro
document.getElementById('register-btn').addEventListener('click', async () => {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Usuario registrado con éxito");
  } catch (e) {
    alert("Error: " + e.message);
  }
});

// Login
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    alert("Error: " + e.message);
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));

// Detectar usuario activo
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    panelSection.classList.remove('hidden');
    cargarInquilinos();
  } else {
    loginSection.classList.remove('hidden');
    panelSection.classList.add('hidden');
  }
});

// Guardar inquilino
document.getElementById('inquilino-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const apodos = document.getElementById('apodos').value;
  const documento = document.getElementById('documento').value;
  const motivo = document.getElementById('motivo').value;

  try {
    await addDoc(collection(db, "inquilinos"), {
      nombre, apodos, documento, motivo,
      fecha: new Date().toISOString()
    });
    alert("Inquilino guardado correctamente");
    e.target.reset();
    cargarInquilinos();
  } catch (error) {
    alert("Error al guardar: " + error.message);
  }
});

// Cargar inquilinos
async function cargarInquilinos() {
  const lista = document.getElementById('lista-inquilinos');
  lista.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "inquilinos"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement('li');
    li.textContent = `${data.nombre} - ${data.motivo}`;
    lista.appendChild(li);
  });
}
