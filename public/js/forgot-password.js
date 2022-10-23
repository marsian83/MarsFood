document
  .getElementById("forgotPassButton")
  .addEventListener("click", (event) => {
    event.preventDefault();
    fetch(
      `/services/forgot-pass/url?email=${
        document.getElementById("email-field").value
      }`
    );
    alert("mail sent");
  });
