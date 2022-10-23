async function sendEmail(toMail) {
  await Email.send({
    Host: "smtp.gmail.com",
    Username: "marsfood.online@gmail.com",
    Password: "Ammunitions",
    To: toMail,
    From: "marsfood.online@gmail.com",
    Subject: "MarsFood - Password Recovery",
    Body: "Hi, this is for your whatever something idk",
  });
}

document
  .getElementById("forgotPassButton")
  .addEventListener("click", (event) => {
    event.preventDefault();
    console.log("first")
    sendEmail(document.getElementById("email-field").value);
  });
