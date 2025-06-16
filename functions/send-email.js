const fetch = require("node-fetch");

exports.handler = async (event) => {
  const data = JSON.parse(event.body);

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: { email: "info@metatronstudio.com", name: "Metatron Studio" },
      to: [{ email: "crjeffrey7@gmail.com", name: "Administrador" }],
      subject: data.subject,
      htmlContent: `
        <p><strong>Nombre:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Teléfono:</strong> ${data.phone}</p>
        <p><strong>Mensaje:</strong> ${data.message}</p>
      `
    })
  });

  if (!response.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error al enviar el correo" })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Correo enviado con éxito" })
  };
};
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Correo enviado con éxito" })
  };
};
