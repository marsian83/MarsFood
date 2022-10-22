function ValidateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  }
  return false;
}

async function fetchUserByMail(mail) {
  data = await fetch(`/api/users/email/${mail}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData.reverse();
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
    popup.textContent = "Pick a password greater than 6 characters in length";
  } else if (errors.includes("3")) {
    popup.textContent = "Confirmation password does not match";
  } else if (errors.includes("4")) {
    popup.textContent =
      "This email is already registered, consider trying to login";
  } else {
    popup.textContent = "Unknown error happened, Please try again";
  }
}

const registerButton = document.getElementById("register-button");
const registerForm = document.getElementById("register-form");

registerButton.addEventListener("click", async function (event) {
  event.preventDefault();
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let passwordConfirm = document.getElementById("passwordConfirm").value;

  userCheck = await fetchUserByMail(email);

  popup.classList.add("show");
  if (userCheck.length) {
    popup.textContent =
      "This email is already registered, consider trying to login";
  } else if (!(name && email && password && passwordConfirm)) {
    popup.textContent = "Please fill out all the fields";
  } else if (name.length < 3) {
    popup.textContent = "Name should be atleast 3 characters in length";
  } else if (password.length < 6) {
    popup.textContent = "Pick a password greater than 6 characters in length";
  } else if (password != passwordConfirm) {
    popup.textContent = "Confirmation password does not match";
  } else if (!ValidateEmail(email)) {
    popup.textContent = "Please enter a valid email address";
  } else {
    popup.classList.remove("show");
    registerForm.submit();
  }
});

window.addEventListener("click", (event) => {
  if (!(event.target === registerButton)) {
    popup.classList.remove("show");
  }
});

// ANIMATIONS
document.querySelector("#deliveryman").classList.add("deliveryman-popup");
let deliverymanpopup = document.querySelector(".deliveryman-popup");
deliverymanpopup.addEventListener("animationend", () => {
  deliverymanpopup.classList.add("deliveryman-popup-done");
  deliverymanpopup.classList.remove("deliveryman-popup");
});
