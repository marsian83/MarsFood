function ValidateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
  return false;
}

async function fetchRestaurantByMail(mail) {
  data = await fetch(`/services/restaurant/email/?email=${mail}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchRestaurantValidation(mail, pass) {
  data = await fetch(
    `/services/restaurant/auth/validate/?email=${mail}&password=${pass}`
  );
  parsedData = await data.json();
  return parsedData;
}

function handleLoginSwitch() {
  document.querySelector("#login-form").classList.remove("hidden-form");
  document.querySelector("#signup-form").classList.add("hidden-form");
  document.querySelector("#switch-signup").classList.remove("switch-selected");
  document.querySelector("#switch-login").classList.add("switch-selected");
}

function handleSignupSwitch() {
  document.querySelector("#signup-form").classList.remove("hidden-form");
  document.querySelector("#login-form").classList.add("hidden-form");
  document.querySelector("#switch-login").classList.remove("switch-selected");
  document.querySelector("#switch-signup").classList.add("switch-selected");
}

if (!params.switchState || params.switchState == 0) {
  handleLoginSwitch();
} else if (params.switchState == 1) {
  handleSignupSwitch();
}

// Update stats
async function updateStats() {
  document
    .getElementById("totalRestaurants")
    .style.setProperty("--num", params.totalRestaurants);

  document
    .getElementById("totalDishesSold")
    .style.setProperty("--num", params.dishesSold);
}

updateStats();

// Catch and display errors
let error = document.querySelector(".error-catcher").textContent;

let displayError = document.querySelector(".display-errors");

if (!error.includes("#%=")) {
  displayError.innerHTML = `<img src="/static/assets/error-cross-red.png" alt="error">`;
  if (error.includes("1")) {
    displayError.innerHTML += "Please fill out all the fields";
  } else if (error.includes("2")) {
    displayError.innerHTML +=
      "Pick a password greater than 6 characters in length";
  } else if (error.includes("3")) {
    displayError.innerHTML +=
      "Confirmation password does not match given password";
  } else if (error.includes("4")) {
    displayError.innerHTML +=
      "This email has already been registered as a restaurant";
  } else if (error.includes("5")) {
    displayError.innerHTML += "Invalid credentials, please try again";
  }
}

if (params.loginPrompt) {
  displayError.innerHTML = `<img src="/static/assets/success-check-green.png" alt="success">`;
  displayError.innerHTML += "Successfully registered, you may now login";
  displayError.style.color = "green";
}

const registerButton = document.getElementById("register-button");
const registerForm = document.getElementById("register-form");

registerButton.addEventListener("click", async function (event) {
  event.preventDefault();

  let name = document.getElementById("name").value;
  let email = document.getElementById("email-new").value;
  let address = document.getElementById("address").value;
  let password = document.getElementById("password-new").value;
  let passwordConfirm = document.getElementById("passwordConfirm").value;
  displayError.innerHTML = `<img src="/static/assets/error-cross-red.png" alt="error">`;
  displayError.classList.remove("hidden");

  if (!(name && email && address && password && passwordConfirm)) {
    displayError.innerHTML += "Please fill out all the fields";
  } else if (name.length < 3) {
    displayError.innerHTML += "Restaurant name should be 3+ characters long";
  } else if (address.length < 13) {
    displayError.innerHTML += "Address needs to be more descriptive";
  } else if (password.length < 6) {
    displayError.innerHTML +=
      "Pick a password greater than 6 characters in length";
  } else if (password != passwordConfirm) {
    displayError.innerHTML += "Confirmation password does not match";
  } else if (!ValidateEmail(email)) {
    displayError.innerHTML += "Please enter a valid email address";
  } else {
    displayError.innerHTML = "";
    let userCheck = await fetchRestaurantByMail(email);
    if (userCheck.length) {
      displayError.innerHTML = `<img src="/static/assets/error-cross-red.png" alt="error">This email is already registered, consider trying to login`;
    } else {
      registerForm.submit();
    }
  }
});

const loginButton = document.getElementById("login-button");
const loginForm = document.getElementById("login-form-form");

loginButton.addEventListener("click", async function (event) {
  event.preventDefault();
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  let validations = await fetchRestaurantValidation(email, password);
  isValid = validations.valid;

  displayError.innerHTML = `<img src="/static/assets/error-cross-red.png" alt="error">`;
  displayError.classList.remove("hidden");

  if (!isValid) {
    displayError.innerHTML += "Invalid credentials, Please try again";
  } else if (!(email && password)) {
    displayError.innerHTML += "Please fill out all the fields";
  } else {
    displayError.innerHTML = "";
    loginForm.submit();
  }
});

window.addEventListener("click", (event) => {
  if (!(event.target == registerButton && event.target == loginButton)) {
    displayError.classList.add("hidden");
  }
});
