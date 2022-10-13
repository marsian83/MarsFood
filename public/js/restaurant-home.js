restaurantid = params.restaurantId;

async function fetchRestaurantData(rid=restaurantid) {
  data = await fetch(`/api/restaurants/id/${rid}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function fetchDishes(rid=restaurantid) {
  data = await fetch(`/api/restaurants/id/${rid}/dishes/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData.reverse();
}

async function displayRestaurantData() {
  let data = await fetchRestaurantData();
  document.title = data.name;
  document.getElementById(
    "display-name"
  ).innerHTML = `${data.name}`;
  document.getElementById(
    "display-address"
  ).innerHTML = `<b>Address : </b>${data.address}`;
  document.getElementById(
    "display-email"
  ).innerHTML = `<b>Email : </b>${data.email}`;
}

async function displayDishes(){
  dishes = await fetchDishes()
  dishesHolder = document.getElementById('dishes-holder')
  dishesHolder.innerHTML=""
  dishes.forEach(async(dish)=>{
    newCard=`
    <div class="dish-card">
          <img
            src=${dish.image_url || '/static/assets/placeholder_food.png'}
            alt="food-thumbnail"
          />
          <div class="dish-card-content">
            <div class="delete-dish">
              <h5>${dish.name}</h5>
              <button class="delete-dish-button">
                DELETE DISH <i class="fa fa-trash"></i>
              </button>
            </div>
            <div class="container dish-info">
              <div class="dish-info-list-item-container">
                <h6>Cost :</h6>
                <p>${dish.cost}</p>
              </div>
              <div class="dish-info-list-item-container">
                <h6>Discription :</h6>
                <p>${dish.description}</p>
              </div>
              <div class="dish-info-list-item-container">
                <h6>Quantity sold till now :</h6>
                <p>EXAMPLE</p>
              </div>
            </div>
          </div>
        </div>
    `
    dishesHolder.innerHTML+=newCard
  })
}

async function renderPage() {
  displayRestaurantData();
  displayDishes()
}

renderPage();
