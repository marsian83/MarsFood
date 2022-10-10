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

window.onclick = () => {
  popup.classList.remove("show");
};

// ANIMATIONS
document.querySelector("#deliveryman").classList.add("deliveryman-popup");
let deliverymanpopup = document.querySelector(".deliveryman-popup");
deliverymanpopup.addEventListener("animationend", () => {
  deliverymanpopup.classList.add("deliveryman-popup-done");
  deliverymanpopup.classList.remove("deliveryman-popup");
});
