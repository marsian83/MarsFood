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
  } else{
    popup.textContent = "Unknown error happened, Please try again"
  }
}

window.onclick=()=>{popup.classList.remove("show")}

