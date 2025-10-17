// Guardar inquilino (versión extendida)
document.getElementById('inquilino-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Datos principales
  const data = {
    nombre: document.getElementById('nombre').value.trim(),
    apodos: document.getElementById('apodos').value.trim(),
    documento: document.getElementById('documento').value.trim(),
    tipoDoc: document.getElementById('tipoDoc').value,
    pais: document.getElementById('pais').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    zona: document.getElementById('zona').value.trim(),
    motivo: document.getElementById('motivo').value.trim(),
    info: document.getElementById('info').value.trim(),
    etiquetas: document.getElementById('etiquetas').value.split(',').map(t => t.trim()),

    // Representante
    repNombre: document.getElementById('repNombre').value.trim(),
    repDocumento: document.getElementById('repDocumento').value.trim(),
    repTipoDoc: document.getElementById('repTipoDoc').value,
    repNacionalidad: document.getElementById('repNacionalidad').value.trim(),
    repDireccion: document.getElementById('repDireccion').value.trim(),

    // Redes y categoría
    facebook: document.getElementById('facebook').value.trim(),
    instagram: document.getElementById('instagram').value.trim(),
    categoria: document.getElementById('categoria').value,

    // Evidencias (solo URLs)
    fotos: [
      document.getElementById('foto1').value.trim(),
      document.getElementById('foto2').value.trim()
    ].filter(f => f !== ""),

    fecha: new Date().toISOString(),
    usuario: auth.currentUser.email
  };

  if (!data.nombre || !data.motivo) {
    alert("Completa al menos el nombre y el motivo del reporte.");
    return;
  }

  try {
    await addDoc(collection(db, "inquilinos"), data);
    alert("Registro guardado correctamente.");
    e.target.reset();
    cargarInquilinos();
  } catch (error) {
    alert("Error al guardar: " + error.message);
  }
});
