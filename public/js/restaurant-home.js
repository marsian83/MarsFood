var restaurant = {};

async function getRestaurantObj() {
  let restaurantData = await fetch(
    `/api/restaurants/id/${params.restaurantId}?apiKey=${API_KEY}`
  );
  let restaurantDataParsed = await restaurantData.json()
  return restaurantDataParsed;
}

async function updatePage(){
    restaurant = await getRestaurantObj();
    document.title=restaurant.name;
}

updatePage()