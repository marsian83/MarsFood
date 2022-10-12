const restaurantid = Number(params.restaurantId);

async function fetchOrders(rid = restaurantid) {
  data = await fetch(`/api/restaurants/id/${rid}/orders/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData.reverse();
}
async function fetchAddressData(aid) {
  data = await fetch(`/api/addresses/id/${aid}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}
async function fetchDishData(did) {
  data = await fetch(`/api/dishes/id/${did}/?apiKey=${API_KEY}`);
  parsedData = await data.json();
  return parsedData;
}

async function displayOrders() {
  let ordersData = await fetchOrders();
  const pendingHolder = document.getElementById("pending-orders-holder");
  const ordersHolder = document.getElementById("past-orders-holder");
  pendingHolder.innerHTML = "";
  ordersHolder.innerHTML = "";
  for (order of ordersData) {
    dish = await fetchDishData(order.dish_id);
    address = await fetchAddressData(order.address_id);
    if (order.completed) {
      newCard = `
      <div class="orders-card pending">
              <img
                src="${dish.image_url || "/static/assets/placeholder_food.jpg"}"
                alt="food-thumbnail"
              />
              <div class="orders-card-content">
                <div class="delivery-orders">
                  <h5>${dish.name}</h5>
                  <button class="past-orders-button">OUT FOR DELIVERY</button>
                </div>
                <div class="container orders-info">
                <div class="orders-info-list-item-container">
                  <h6>Quantity:</h6>
                  <p>${order.quantity}</p>
                </div>
                  <div class="orders-info-list-item-container">
                    <h6>Was Ordered On : </h6>
                    <p>${new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "long",
                        timeStyle: "short",
                      }).format(new Date(order.order_time))}</p>
                  </div>
                  <div class="orders-info-list-item-container">
                    <h6>Was delivered to : </h6>
                    <p>${address.name}</p>
                  </div>
                  <div class="orders-info-list-item-container">
                    <h6>Description:</h6>
                    <p>Khaana aache se banana This thing sucks over big para</p>
                  </div>
                </div>
              </div>
            </div>
      `;
      ordersHolder.innerHTML += newCard;
    } else {
      pendingCard = `<div class="orders-card pending">
        <img
          src="https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F44%2F2022%2F03%2F29%2Fpasta-power-tout.jpg"
          alt="food-thumbnail"
        />
        <div class="orders-card-content">
          <div class="delivery-orders">
            <h5>Dish Name</h5>
            <button class="delivery-orders-button">OUT FOR DELIVERY</button>
          </div>
          <div class="container orders-info">
            <div class="orders-info-list-item-container">
              <h6>Customer Name:</h6>
              <p>Riu</p>
            </div>
            <div class="orders-info-list-item-container">
              <h6>Customer Email:</h6>
              <p>Riu@gmail.com</p>
            </div>
            <div class="orders-info-list-item-container">
              <h6>Delivery-Address:</h6>
              <p>145 GH ABV-IIITM</p>
            </div>
            <div class="orders-info-list-item-container">
              <h6>Cost :</h6>
              <p>100</p>
            </div>
            <div class="orders-info-list-item-container">
              <h6>Quantity:</h6>
              <p>10</p>
            </div>
            <div class="orders-info-list-item-container">
              <h6>Description:</h6>
              <p>Khaana aache se banana This thing sucks over big para</p>
            </div>
          </div>
        </div>
      </div>`;

      pendingHolder.innerHTML += pendingCard;
    }
  }
}

displayOrders()