dishid = params.dish_id;

function closestMultiple(n, x) {
  if (n == 0) {
    return 0;
  }
  if (x > n) return x;
  n = n + parseInt(x / 2, 10);
  n = n - (n % x);
  return n;
}

const shorten = (str, len) => {
  return str.length > len ? str.slice(0, len) + "..." : str;
};

async function getAverageRGB(src) {
  return new Promise((resolve) => {
    let context = document.createElement("canvas").getContext("2d");
    context.imageSmoothingEnabled = true;
    let img = new Image();
    img.src = src;
    img.crossOrigin = "";
    img.onload = () => {
      context.drawImage(img, 0, 0, 1, 1);
      resolve(context.getImageData(0, 0, 1, 1).data.slice(0, 3));
    };

  });
}

async function fetchDishData() {
  data = await fetch(`/api/dishes/id/${dishid}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchDishRating(did = dishid) {
  data = await fetch(`/api/dishes/id/${did}/rating/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchDishReviews() {
  data = await fetch(`/api/dishes/id/${dishid}/reviews/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchUserInfo(uid) {
  data = await fetch(`/api/users/id/${uid}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchRestaurantData(restaurantid) {
  data = await fetch(`/api/restaurants/id/${restaurantid}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchRestaurantDishes(restaurantid) {
  data = await fetch(
    `/api/restaurants/id/${restaurantid}/dishes/?apiKey=${API_KEY}`
  );
  parsedData = await data.json();
  return parsedData;
}

var dishData, dishRating, restaurantData, restaurantDishes;

async function loadData() {
  dishData = await fetchDishData();
  dishRating = await fetchDishRating();
  restaurantData = await fetchRestaurantData(dishData.restaurant_id);
  restaurantDishes = await fetchRestaurantDishes(dishData.restaurant_id);
}

async function renderData() {
  await loadData();
  document.title = document.getElementById("header-food-name").innerText =
    dishData.name;
  document.getElementById("header-food-image-container").innerHTML = `<img
    src="${dishData.image_url || " /static/assets/placeholder_food.jpg"}"
    alt="dish image"
    onerror="this.style.display='none'"
    id="header-food-image"
    />`;
  // document.getElementById("header-food-image").crossOrigin = "";
  document.getElementById(
    "dishrating-container"
  ).innerHTML = `<span class="stars-container stars-${closestMultiple(
    (dishRating ? dishRating.avg : 0) * (100 / 5),
    5
  )}" id="header-food-stars">★★★★★</span>`;

  document.getElementById("header-food-ratings").innerText =
    (dishRating ? dishRating.count : 0) + " Customer reviews";
  document.getElementById("header-food-orders").innerText =
    "3" + " total orders";
  document.getElementById("header-seller-text").innerHTML =
    "<p>Sold by </p>" +
    `<a href="/user/restaurant/${restaurantData.restaurant_id}">${restaurantData.name}</a>`;
  document.getElementById("description").innerText = dishData.description;
  document.querySelector("#buy-button p").innerText =
    "Add to cart now for " +
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      notation: "compact",
      currency: "INR",
    }).format(dishData.cost);
  document.getElementById("order-modal-buyfor").innerText =
    "Buy this dish now for " +
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(dishData.cost);
  document.getElementById("order-modal-subtotal").innerText =
    "Subtotal = " +
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(dishData.cost);
  document.getElementById("moreby-heading").innerHTML =
    "<p>More by </p>" +
    `<a href="/user/restaurant/${restaurantData.restaurant_id}">${restaurantData.name}</a>` +
    "<p>:</p>";

  let dishDomRGB = await getAverageRGB(dishData.image_url);
  var dr = dishDomRGB[0];
  var dg = dishDomRGB[1];
  var db = dishDomRGB[2];
  let f = 0.38;
  dr *= f;
  dg *= f;
  db *= f;
  document.getElementById(
    "header-container"
  ).style.backgroundColor = `rgb(${dr},${dg},${db})`;
  document.getElementById(
    "buy-button"
  ).style.backgroundColor = `rgb(${dr},${dg},${db})`;
  document.getElementById(
    "order-modal-header"
  ).style.backgroundColor = `rgb(${dr},${dg},${db})`;
}

async function renderReviews() {
  let reviews = await fetchDishReviews();
  let reviewHolder = document.getElementById("reviews-holder");
  if (true) {
    reviewHolder.innerHTML = "<h2>Reviews : </h2>";
    userRev = reviews.find((item) => item.user_id == params.currentUserId);
    if (userRev) {
      reviewHolder.innerHTML += `
      <div class="container review-container user-review">
      <div class="review-left">
        <h3>You</h3>
        <span class="stars-container stars-${closestMultiple(
          (userRev.rating ? userRev.rating : 0) * (100 / 5),
          5
        )}">★★★★★</span>
      </div>
      <p id="review-content">
        ${
          userRev.content ||
          "This review does not have any description of the dish"
        }
      </p>
    </div>
    `;
      const cfindex = reviews.indexOf(userRev);
      if (cfindex > -1) {
        reviews.splice(cfindex, 1);
      }
    } else {
      currusercheck = await fetch(
        `/api/dishes/id/${params.dish_id}/orders/user/${params.currentUserId}/?apiKey=${API_KEY}`
      );
      currusercheckData = await currusercheck.json();
      if (currusercheckData.length > 0) {
        reviewHolder.innerHTML += `
        <div class="container" id="user-reviews-box">
        <div class="container review-container" id="user-reviews">
          <div class="review-left">
            <h3>Leave a review of this dish</h3>
            <div class="user-rating-star" id="user-rates1" onclick="starClick(this)">
              ★
              <div class="user-rating-star" id="user-rates2" onclick="starClick(this)">
                ★
                <div class="user-rating-star" id="user-rates3" onclick="starClick(this)">
                  ★
                  <div class="user-rating-star" id="user-rates4" onclick="starClick(this)">
                    ★
                    <div class="user-rating-star" id="user-rates5" onclick="starClick(this)">
                      ★
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <textarea
            name="user-review-content"
            id="user-review-textarea"
            cols="25"
            rows="8"
            placeholder="Describe your experience (optional)"
            maxlength="512"
          ></textarea>
        </div>
        <button class="user-reviews-button" id="user-review-submit-button" onclick="submitReview()">Submit Review</button>
      </div>
        `;
      }
    }
    reviews.forEach(async (rev) => {
      let user = await fetchUserInfo(rev.user_id);
      reviewHolder.innerHTML += `
      <div class="container review-container">
      <div class="review-left">
        <h3>${user.name}</h3>
        <span class="stars-container stars-${closestMultiple(
          (rev.rating ? rev.rating : 0) * (100 / 5),
          5
        )}">★★★★★</span>
      </div>
      <p id="review-content">
        ${rev.content || "This review does not have a description of the dish"}
      </p>
    </div>
    `;
    });
  }
}

async function renderDishes() {
  document.querySelector("#food-carousel").innerHTML = "";
  restaurantDishes.forEach(async (dish) => {
    let dishItemRating = await fetchDishRating(dish.dish_id)
    newCard = `<div class="food-carousel-card""
    onclick="location.href='/user/dish/${dish.dish_id}'">
    <div class="vegan-and-image-holder">
    <img class="vegan-indicator" src=${
      "/static/assets/" + (dish.nonveg ? "nonveg.png" : "veg.png")
    }>
    <img
      class="food-carousel-card-image"
      src="${dish.image_url || "/static/assets/placeholder_food.jpg"}"
      alt="card-placeholder" onerror="this.style.display='none'"
    />
    </div>
    <h5>${shorten(dish.name, 20)}</h5>
    <h2>${new Intl.NumberFormat("en-IN", {
      style: "currency",
      notation: "compact",
      currency: "INR",
    }).format(dish.cost)}</h2>
    <span class="stars-container stars-${closestMultiple(
       (dishItemRating.avg || 0) * (100 / 5),
      5
    )}">★★★★★</span>
  </div>`;
    document.querySelector("#food-carousel").innerHTML += newCard;
  });
}

async function renderPage() {
  await renderData();
  document.getElementById("order-modal-subtotal").innerText =
    "Subtotal = " +
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(dishData.cost * qty.value);
  await renderDishes();
  await renderReviews();
}

renderPage();

// ORDER MODAL

var ordermodal = document.getElementById("orderModal");
var orderspan = document.getElementsByClassName("close")[0];
var orderbtn = document.getElementById("buy-button");

orderspan.onclick = function () {
  ordermodal.style.display = "none";
};

const showOrderModal = function () {
  ordermodal.style.display = "block";
};

orderbtn.onclick = function () {
  ordermodal.style.display = "block";
};

window.onclick = function (event) {
  if (event.target == ordermodal) {
    ordermodal.style.display = "none";
  }
};

var qty = document.getElementById("qty-input");

qty.addEventListener("input", () => {
  document.getElementById("order-modal-subtotal").innerText =
    "Subtotal = " +
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(dishData.cost * qty.value);
});

async function addToCart() {
  await fetch(`/user/buy/${dishid}/?quantity=${qty.value}`, {
    method: "PUT",
  });
  ordermodal.style.display = "none";
  var x = document.getElementById("snackbar");
  x.innerText = `${dishData.name} x ${qty.value} successfuly added to cart`;
  x.className = "show";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}

var userRates = 0;
var highestClick = 0;

const starClick = (starC) => {
  if (Number(starC.id.slice(-1)) > highestClick) {
    highestClick = Number(starC.id.slice(-1));
    document.querySelectorAll(".user-rating-star").forEach((s) => {
      s.classList.remove("user-rating-star-selected");
    });
    starC.classList.add("user-rating-star-selected");
    userRates = Number(starC.id.slice(-1));
    for (i of Array(Number(starC.id.slice(-1))).keys()) {
      document
        .getElementById("user-rates" + (i + 1))
        .classList.add("user-rating-star-selected");
    }
    // console.log(userRates);
    resetHighestClick();
  }
};

async function resetHighestClick() {
  setTimeout(() => {
    highestClick = 0;
  }, 500);
}

async function submitReview() {
  if (userRates) {
    document.getElementById("user-reviews-box").style.display = "none";
    let b = {
      rating: userRates,
      dish_id: dishid,
      content: document.getElementById("user-review-textarea").value,
    };
    await fetch("/user/dish/review/new", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b),
    });
    setTimeout(() => {
      location.reload();
    }, 1234);
  }
}
