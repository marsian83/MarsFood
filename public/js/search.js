async function fetchDishes(query) {
  data = await fetch(`/api/search/dishes/?apiKey=${API_KEY}&keyword=${query}`);
  parsedData = await data.json();
  return parsedData;
}

async function renderResults() {
  let searchInput = document.getElementById("searchbar").value;
  let resultsHolder = document.getElementById("results-holder");
  resultsHolder.innerHTML = "";
  if (searchInput) {
    let results = await fetchDishes(searchInput);
    results.forEach((result) => {
      resultsHolder.innerHTML += `<div class="container card">${result.name}</div>`;
    });
  }
}

var timer = setTimeout(() => {
  renderResults();
}, 800);

document.getElementById("searchbar").addEventListener("input", () => {
  window.clearTimeout(timer);
  timer = setTimeout(renderResults(), 800);
});
