userid = params.userid;

// FETCH
async function fetchUserData(uid = userid) {
  data = await fetch(`/api/users/id/${uid}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchDishData(uid = userid) {
  data = await fetch(`/api/dishes/id/${uid}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchOrderHistory(uid = userid) {
  data = await fetch(`/api/users/id/${uid}/orders/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData.reverse();
}

async function fetchAddressData(aid) {
  data = await fetch(`/api/addresses/id/${aid}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchRestaurantData(id) {
  data = await fetch(`/api/restaurants/id/${id}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

// DISPLAY
async function displayUserData() {
  const userData = await fetchUserData(userid);
  document.getElementById("user-email-display").innerText = userData.email;
}

async function displayOrderHistory() {
  const ordersData = await fetchOrderHistory(userid);
  const ordersHolder = document.getElementById("orders-holder");
  ordersHolder.innerHTML = "";
  for (let order of ordersData) {
    let dish = await fetchDishData(order.dish_id);
    let address = await fetchAddressData(order.address_id);
    let restaurant = await fetchRestaurantData(dish.restaurant_id);
    let newCard = `
        <div class="order-card" onclick="window.location.href='/user/dish/${
          order.dish_id
        }'">
            <img src=${dish.image_url || "/static/assets/placeholder_food.jpg"}
                alt="food-thumbnail">
            <div class="order-card-content">
                <h5>${dish.name}</h5>
                <div class="container order-info">
                    <div class="order-info-list-item-container">
                        <h6>Quantity : </h6>
                        <p>${order.quantity}</p>
                    </div>
                    <div class="order-info-list-item-container">
                        <h6>Sold by : </h6>
                        <a href="/user/restaurant/${
                          restaurant.restaurant_id
                        }"> ${restaurant.name}</a>
                    </div>
                    <div class="order-info-list-item-container">
                        <h6>Ordered on : </h6>
                        <p>${new Intl.DateTimeFormat("en-IN", {
                          dateStyle: "long",
                          timeStyle: "short",
                        }).format(new Date(order.order_time))}</p>
                    </div>
                    <div class="order-info-list-item-container">
                        ${
                          !order.completed
                            ? `<h6 class="order-not-dispatched-text"><strong><u>Order has not yeet been dispatched</u></strong></h6>`
                            : `<h6>Delivered to : </h6>
                      <p><u>${address.name}</u> at ${address.line1}, ${address.line2}</p>`
                        }
                    </div>

                </div>
            </div>
        </div>`;
    ordersHolder.innerHTML += newCard;
  }
}

async function renderPage() {
  displayUserData();
  displayOrderHistory();
}

renderPage();

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
        `/user/password/change?currPass=${currPass}&newPass=${newPass}`,
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
