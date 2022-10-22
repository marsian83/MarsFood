async function fetchUserValidation(mail, pass) {
  data = await fetch(
    `/api/users/validate/?apiKey=${API_KEY}&email=${mail}&password=${pass}`
  );
  parsedData = await data.json();
  return parsedData;
}

// CATCH AND DISPLAY ERRRORS
errors = document.querySelector(".error-catcher").textContent;

var popup = document.getElementById("errorPopup");
if (errors.includes("#%=")) {
  popup.textContent = "";
} else {
  popup.classList.add("show");
  if (errors.includes("1")) {
    popup.textContent = "Please fill out all the fields";
  } else if (errors.includes("2")) {
    popup.textContent = "Invalid credentials, Please try again";
  } else {
    popup.textContent = "Unknown error happened, Please try again";
  }
}

const loginButton = document.getElementById("login-button");
const loginForm = document.getElementById("login-form");

loginButton.addEventListener("click", async function (event) {
  event.preventDefault();
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  let isValid = await fetchUserValidation(email, password);

  popup.classList.add("show");
  if (!isValid) {
    popup.textContent = "Invalid credentials, Please try again";
  } else if (!(email && password)) {
    popup.textContent = "Please fill out all the fields";
  } else {
    popup.classList.remove("show");
    loginForm.submit();
  }
});

window.addEventListener("click", (event) => {
  if (!(event.target === loginButton)) {
    popup.classList.remove("show");
  }
});
