async function fetchDishes(query) {
  data = await fetch(`/api/search/dishes/?apiKey=${API_KEY}&keyword=${query}`);
  parsedData = await data.json();
  return parsedData;
}

async function renderResults() {
  let searchInput = document.getElementById("searchbar").value;
  let resultsHolder = document.getElementById("results-holder");
  if (searchInput) {
    resultsHolder.innerHTML = `<div class="sk-circle">
    <div class="sk-circle1 sk-child"></div>
    <div class="sk-circle2 sk-child"></div>
    <div class="sk-circle3 sk-child"></div>
    <div class="sk-circle4 sk-child"></div>
    <div class="sk-circle5 sk-child"></div>
    <div class="sk-circle6 sk-child"></div>
    <div class="sk-circle7 sk-child"></div>
    <div class="sk-circle8 sk-child"></div>
    <div class="sk-circle9 sk-child"></div>
    <div class="sk-circle10 sk-child"></div>
    <div class="sk-circle11 sk-child"></div>
    <div class="sk-circle12 sk-child"></div>
  </div>`;
    let results = await fetchDishes(searchInput);
    resultsHolder.innerHTML=""
    results.forEach((result) => {
      resultsHolder.innerHTML += `<div class="container card" onclick="location.href='/user/dish/${result.dish_id}'">
      <img src="${result.image_url}" alt="dish-thumbnail" loading="lazy"></img> 
      <h5>${result.name}</h5>
      </div>`;
    });
  }
  else{
    resultsHolder.innerHTML=""
  }
}

var prevState=""

var searchbar  = document.getElementById('searchbar');
var timer  = setTimeout(function(){renderResults()}, 0);

searchbar.addEventListener('keypress', function(){
  clearTimeout(timer); 
  timer = setTimeout(function() 
    { renderResults() }, 800 
)}
)