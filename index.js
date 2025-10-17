import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

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

// Secciones
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');

// Cambiar entre login y registro
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
    alert("Usuario registrado");
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

// Redirección si ya está logueado
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "buscador.html"; // lleva al buscador de malos inquilinos
  }
});
