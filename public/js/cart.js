async function fetchDishData(did) {
  data = await fetch(`/api/dishes/id/${did}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchRestaurantData(rid) {
  data = await fetch(`/api/restaurants/id/${rid}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchCart() {
  data = await fetch(`/user/cart/data`);
  parsedData = await data.json();
  return parsedData;
}

var cart = [];

async function renderCart(cart) {
  cart = await fetchCart();
  var holder = document.getElementById("cart-card-holder");
  holder.innerHTML = "";
  cart.forEach(async (cartItem) => {
    cartItem.dish = await fetchDishData(cartItem.dish_id);
    cartItem.dish.restaurant = await fetchRestaurantData(
      cartItem.dish.restaurant_id
    );
    cartItem.newCard = `<div class="cart-card" id="cart-card${
      cartItem.dish.dish_id
    }">
    <img
      src="${cartItem.dish.image_url}"
      class="cart-card-img"
      alt="dish image"
      onerror="this.style.display='none'"
    />
    <div class="container cart-card-right">
      <h2>${cartItem.dish.name}</h2>
      <p>sold by ${cartItem.dish.restaurant.name}</p>
      <div class="container cart-card-control">
        <button class="quantity-decrease" 
        id="quantity-decrease${cartItem.dish.dish_id}"
        onclick="document.getElementById('quantity-control${
          cartItem.dish.dish_id
        }').value=Number(document.getElementById('quantity-control${
      cartItem.dish.dish_id
    }').value)-1; updateCart()">-</button
        ><input
          type="number"
          name="quantity"
          class="quantity-control"
          id="quantity-control${cartItem.dish.dish_id}"
          min="0"
          value="${cartItem.quantity}"
          oninput="updateCart()"
          onchange="updateCart()"
        />
        <button class="quantity-increase" 
        id="quantity-increase${cartItem.dish.dish_id}"
        onclick="document.getElementById('quantity-control${
          cartItem.dish.dish_id
        }').value= Number(document.getElementById('quantity-control${
      cartItem.dish.dish_id
    }').value)+1; updateCart()">+</button>
      </div>
      <h3 id="price-indicator${cartItem.dish.dish_id}">${new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
      }
    ).format(cartItem.dish.cost * cartItem.quantity)}</h3>
    </div>
  </div>`;
    holder.innerHTML += cartItem.newCard;
  });
  updateCart();
}

async function updateCart() {
  cart = await fetchCart();
  var subtotal = 0;
  for (cartItem of cart) {
    cartItem.dish = await fetchDishData(cartItem.dish_id);
    cartItem.quantity = document.getElementById(
      `quantity-control${cartItem.dish.dish_id}`
    ).value;
    document.getElementById(
      `price-indicator${cartItem.dish.dish_id}`
    ).innerHTML = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(cartItem.dish.cost * cartItem.quantity);
    if (cartItem.quantity <= 0) {
      document
        .getElementById(`cart-card${cartItem.dish.dish_id}`)
        .classList.add("cart-remove");
      setTimeout(() => {
        document.getElementById(
          `cart-card${cartItem.dish.dish_id}`
        ).style.display = "none";
      }, 400);
      await fetch(`/user/cart/remove/${cartItem.dish_id}`, {
        method: "DELETE",
      });
      setTimeout(() => {
        location.reload();
      }, 420);
    } else {
      await fetch(
        `/user/cart/set/${cartItem.dish_id}/?quantity=${cartItem.quantity}`,
        { method: "PUT" }
      );
    }
    subtotal += Number(cartItem.dish.cost) * Number(cartItem.quantity);
  }
  var ce = document.getElementById("cart-empty");
  var fo = document.getElementById("order-final-holder");
  if (subtotal > 0) {
    ce.style.display = "none";
    fo.innerHTML = `
    <h2 id="total-heading">Your Total</h2>
    <h5>Sub Total : ${new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(subtotal)}</h5>
    <h5>Taxes and Charges : ${new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(subtotal * (8 / 100))}</h5>
    <h5>Grand Total : ${new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Math.ceil(subtotal * (108 / 100)))}</h5>
    <button id="checkout-button" onclick="showCheckoutModal()">Checkout</button>
    `;
  } else {
    fo.innerHTML = "";
    ce.style.display = "flex";
  }
}

async function renderPage() {
  await renderCart();
  await updateCart();
}

renderPage();

async function inputAutoLocation(position) {
  const { latitude, longitude } = position.coords;
  data = await fetch(`/api/location/?apiKey=${API_KEY}&longitude=${longitude}&latitude=${latitude}`);
  parsedData = await data.json();
  document.getElementById('address-line1').value=parsedData.line1
  document.getElementById('address-line2').value=parsedData.line2
}

function showCheckoutModal() {
  modal.style.display = "block";
  if (window.navigator.geolocation) {
    window.navigator.geolocation.getCurrentPosition(
      inputAutoLocation,
      console.log
    );
  }
}

var modal = document.getElementById("myModal");

var span = document.getElementsByClassName("close")[0];

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
