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


if(!params.switchState || params.switchState==0){
  handleLoginSwitch()
}else if (params.switchState==1){
  handleSignupSwitch()
}

// Update stats
async function updateStats() {
  restaurantsCount = await fetch(`/api/restaurants/count/?apiKey=${API_KEY}`);
  parsedRestaurantsCount = await restaurantsCount.json();
  document.getElementById("totalRestaurants").innerText =
    parsedRestaurantsCount.count;
  
    dishesSoldCount = await fetch(`/api/orders/quantity/total/?apiKey=${API_KEY}`);
    parsedDishesSoldCount = await dishesSoldCount.json();
    document.getElementById("totalDishesSold").innerText =
      parsedDishesSoldCount.sum;
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

window.onclick = () => {
  displayError.classList.add("hidden");
};

if (params.loginPrompt) {
  displayError.innerHTML = `<img src="/static/assets/success-check-green.png" alt="success">`;
  displayError.innerHTML += "Successfully registered, you may now login";
  displayError.style.color="green"
}
