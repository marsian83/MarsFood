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

async function fetchAddressData(aid){
    data = await fetch(`/api/addresses/id/${aid}/?apiKey=${API_KEY}`);
    parsedData = await data.json();
    return parsedData;}

// DISPLAY
async function displayUserData() {
  const userData = await fetchUserData(userid);
  document.getElementById("user-email-display").innerText = userData.email;
}

async function displayOrderHistory() {
  const ordersData = await fetchOrderHistory(userid);
  const ordersHolder = document.getElementById("orders-holder");
  ordersHolder.innerHTML = "";
  ordersData.forEach(async (order) => {
    let dish = await fetchDishData(order.dish_id);
    let address = await fetchAddressData(order.address_id)
    let newCard = `
        <div class="order-card" onclick="window.location.href='/user/dish/${order.dish_id}'">
            <img src=${dish.image_url || '/static/assets/placeholder_food.jpg'}
                alt="food-thumbnail">
            <div class="order-card-content">
                <h5>${dish.name}</h5>
                <div class="container order-info">
                    <div class="order-info-list-item-container">
                        <h6>Quantity : </h6>
                        <p>${order.quantity}</p>
                    </div>
                    <div class="order-info-list-item-container">
                        <h6>Ordered on : </h6>
                        <p>${new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(order.order_time)) }</p>
                    </div>
                    <div class="order-info-list-item-container">
                        <h6>Delivered to : </h6>
                        <p><u>${address.name}</u> at ${address.line1}, ${address.line2}</p>
                    </div>

                </div>
            </div>
        </div>`;
        ordersHolder.innerHTML+=newCard
  });
}

async function renderPage() {
  displayUserData();
  displayOrderHistory();
}

renderPage();
