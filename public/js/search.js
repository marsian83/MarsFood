
async function fetchDishes() {
    data = await fetch(`/api/dishes/?apiKey=${API_KEY}`);
    parsedData = await data.json();
    return parsedData;
  }
  

