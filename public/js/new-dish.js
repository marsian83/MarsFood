let uploadButton = document.querySelector("#upload-input-button");
let costField = document.getElementById("cost-field");
let nameField = document.getElementById("name-field");
let descField = document.getElementById("description-field");
let vegRadio = document.getElementById("isveg-radio");
let nonvegRadio = document.getElementById("isnonveg-radio");

function getNonVegValue() {
  let es = document.getElementsByName("isnonveg");
  var isitreallyveg = 0;
  es.forEach((e) => {
    if (e.checked) {
      isitreallyveg = e.value;
    }
  });
  return parseInt(isitreallyveg)
}

const shorten = (str, len) => {
  return str.length > len ? str.slice(0, len) + "..." : str;
};

costField.defaultValue = 1;
costField.addEventListener("input", () => {
  costField.style.backgroundPosition = `calc(49% - ${
    costField.value.length * 0.6
  }rem) 50%`;
  costField.style.caretColor =
    costField.value.length <= 0 ? "transparent" : "var(--text-primary)";
});

const imageInput = document.querySelector("#image-input");

var uploaded_image = "";

async function getPreview() {
  display_card = await `<div class="container body-card body-card-dish">
<div>
  <img class="vegan-indicator" src=${
    "/static/assets/" + (getNonVegValue() ? "nonveg.png" : "veg.png")
  }>
  <img class="dish-thumbnail" src="${uploaded_image}" alt="Dish Image" onerror="this.style.display='none'">
  <h3>${shorten(nameField.value, 28)}</h3>
  <h2>${new Intl.NumberFormat("en-IN", {
    style: "currency",
    notation: "compact",
    currency: "INR",
  }).format(costField.value)}</h2>
  <p>${shorten(descField.value, 100)}</p>
</div>
<span class="stars-container stars-80"></span>
</div>`;
  return display_card;
}

async function updatePreview() {
  document.querySelector("#display-preview").innerHTML = await getPreview();
}

updatePreview();

imageInput.addEventListener("change", function () {
  const reader = new FileReader();
  reader.addEventListener("loadend", () => {
    uploaded_image = reader.result;
  });
  reader.readAsDataURL(this.files[0]);
  setTimeout(() => {
    updatePreview();
    // upload2fs();
  }, 1234);
});

[costField, nameField, descField, vegRadio, nonvegRadio].forEach((e) => {
  e.addEventListener("input", () => {
    updatePreview();
  });
});

var uploadField = document.getElementById("image-input");

uploadField.onchange = function() {
    if(this.files[0].size > 1024*1024*2.5){
       alert("Please upload an image less than 2.5MB in size");
       this.value = "";
    };
};