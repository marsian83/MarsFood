restaurantid = params.restaurant_id;

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

// FETCH
async function fetchRestaurantData(rid = restaurantid) {
  data = await fetch(`/api/restaurants/id/${rid}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchRestaurantThumbnail(rid = restaurantid) {
  data = await fetch(
    `/api/restaurants/id/${rid}/dishes/top/?apiKey=${API_KEY}`
  );
  parsedData = await data.json();
  return parsedData.image_url;
}

async function fetchRestaurantRating(rid = restaurantid) {
  data = await fetch(`/api/restaurants/id/${rid}/rating/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData.restaurant_rating;
}

async function fetchRestaurantDishes(rid = restaurantid) {
  data = await fetch(`/api/restaurants/id/${rid}/dishes/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchRestaurantOrders(rid = restaurantid) {
  data = await fetch(
    `/api/restaurants/id/${rid}/orders/count/?apiKey=${API_KEY}`
  );
  parsedData = await data.json();
  return parsedData.count;
}

// DISPLAY
async function displayRestaurantThumbnail() {
  restaurantThumbnailUrl = await fetchRestaurantThumbnail();
  document.getElementById("header-holder").style.background = `
    linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6)),
    url("${restaurantThumbnailUrl || "/static/assets/placeholder_food.jpg"}") center center / cover fixed
    `;
}

async function displayHeaderInfo() {
  let restaurantData = await fetchRestaurantData();
  let restaurantRating = await fetchRestaurantRating();
  let restaurantOrders = await fetchRestaurantOrders();
  document.title = restaurantData.name;
  document.getElementById("header-restaurant-name").innerText =
    restaurantData.name;
  document.getElementById(
    "header-restaurant-address"
  ).innerHTML = `<b>Address : </b> ${restaurantData.address}`;
  document.getElementById(
    "header-food-orders"
  ).innerHTML = `<b>${restaurantOrders}</b> dishes sold so far`;
  document.getElementById("header-restaurant-name").innerText =
    restaurantData.name;
  document.getElementById(
    "restaurant-rating-container"
  ).innerHTML = `<span class="stars-container stars-${closestMultiple(
    (restaurantRating || 0) * (100 / 5),
    5
  )}" id="header-restaurant-stars">★★★★★</span>`;
}

async function displayDishes() {
  let restaurantDishes = await fetchRestaurantDishes();
  bodyContentHolder = document.getElementById("body-content-holder");
  bodyContentHolder.innerHTML = "";
  restaurantDishes.forEach(async (dish) => {
    newCard = `
        <div class="dish-card">
          <img src=${
            dish.image_url || "/static/assets/placeholder_food.jpg"
          } alt="food" />
          <div class="dish-info">
            <h5 class="dish-card-name">${dish.name}</h5>
          </div>
        </div>
        `;
    bodyContentHolder.innerHTML += newCard;
  });
}

async function displayHeader() {
  displayRestaurantThumbnail();
  displayHeaderInfo();
}

async function renderPage() {
  displayHeader();
  displayDishes();
}

renderPage();
