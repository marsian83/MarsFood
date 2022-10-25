restaurantid = params.restaurantId;

async function fetchRestaurantData(rid = restaurantid) {
  data = await fetch(`/api/restaurants/id/${rid}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchDishes(rid = restaurantid) {
  data = await fetch(`/api/restaurants/id/${rid}/dishes/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData.reverse();
}

async function fetchDishOrders(did) {
  data = await fetch(`/api/dishes/id/${did}/sold/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function displayRestaurantData() {
  let data = await fetchRestaurantData();
  document.title = data.name;
  document.getElementById("display-name").innerHTML = `${data.name}`;
  document.getElementById(
    "restaurant-name-background"
  ).innerHTML = `${data.name}`;
  document.getElementById(
    "display-address"
  ).innerHTML = `<b>Address : </b>${data.address}`;
  document.getElementById(
    "display-email"
  ).innerHTML = `<b>Email : </b>${data.email}`;
}

async function displayDishes() {
  dishes = await fetchDishes();
  dishesHolder = document.getElementById("dishes-holder");
  dishesHolder.innerHTML = "";
  dishes.forEach(async (dish) => {
    dish.totalOrders = await fetchDishOrders(dish.dish_id);
    newCard = `
    <div class="dish-card" id="dish-card-id${dish.dish_id}">
          <img
            src=${dish.image_url || "/static/assets/placeholder_food.png"}
            alt="food-thumbnail"
          />
          <div class="dish-card-content">
            <div class="delete-dish">
              <h5>${dish.name}</h5>
                <button class="delete-dish-button" onclick="deleteDish(${dish.dish_id})" type="button">
                  DELETE DISH <i class="fa fa-trash"></i>
                </button>
            </div>
            <div class="container dish-info">
              <div class="dish-info-list-item-container">
                <h6>Cost :</h6>
                <p>${dish.cost}</p>
              </div>
              <div class="dish-info-list-item-container" id="description-holder">
                <h6>Description :</h6>
                <p>${dish.description}</p>
              </div>
              <div class="dish-info-list-item-container">
                <h6>Quantity sold till now :</h6>
                <p>${dish.totalOrders.sum || 0}</p>
              </div>
            </div>
          </div>
        </div>
    `;
    dishesHolder.innerHTML += newCard;
  });
}

async function renderPage() {
  displayRestaurantData();
  displayDishes();
}

renderPage();

async function deleteDish(did) {
  if (confirm("Delete dish?")) {
    document.getElementById(`dish-card-id${did}`).style.opacity='50%'
    await fetch("/restaurant/dish/delete?dish_id=" + did, { method: "DELETE" });
    document.getElementById(`dish-card-id${did}`).style.display='none'
  }
}

var modal = document.getElementById("passwordModal");

var changePassBtn = document.getElementById("change-password-link");

changePassBtn.onclick = function () {
  modal.style.display = "block";
  document.getElementById("passwordModalError").style.display = "none";
  document.getElementById("passwordModalSuccess").style.display = "none";
};

window.addEventListener("click", (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
});

document
  .getElementById("changePasswordButton")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    let currPass = document.getElementById("curr-pass").value;
    let newPass = document.getElementById("new-pass").value;
    let confirmPass = document.getElementById("confirm-pass").value;
    let errorBox = document.getElementById("passwordModalError");
    errorBox.style.display = "block";
    document.getElementById("passwordModalSuccess").style.display = "none";
    if (newPass.length < 6) {
      errorBox.textContent =
        "Choose a password with atleast 6 characters in length";
    } else if (currPass.length < 6) {
      errorBox.textContent = "The current password you entered is incorrect";
    } else if (currPass == newPass) {
      errorBox.textContent = "The old and new password can't be the same";
    } else if (newPass != confirmPass) {
      errorBox.textContent = "Confirmation password does not match";
    } else {
      errorBox.style.display = "none";
      let resp = await fetch(
        `/restaurant/password/change?currPass=${currPass}&newPass=${newPass}`,
        { method: "PUT" }
      );
      let response = await resp.json();
      errorBox.style.display = "block";
      if (response.error) {
        errorBox.textContent = response.error;
      } else if (response.message == "success") {
        errorBox.style.display = "none";
        document.getElementById("passwordModalSuccess").style.display = "block";
        document.getElementById("passwordModalSuccess").textContent =
          "Password changed successfully";
        setTimeout(() => {
          modal.style.display = "none";
        }, 3000);
      } else {
        errorBox.textContent = "Something went wrong, please try again!";
      }
    }
  });
