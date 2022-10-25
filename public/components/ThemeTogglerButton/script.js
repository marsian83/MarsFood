async function setTogglerThemeButtonImage() {
  let rawData = await fetch("/services/theme/get");
  let currTheme = await rawData.json();
  if (currTheme.theme == "dark") {
    document.querySelector("#theme-toggler-holder img").src =
      "/static/assets/light-theme-icon.png";
  } else if (currTheme.theme == "light") {
    document.querySelector("#theme-toggler-holder img").src =
      "/static/assets/dark-theme-icon.png";
  }
}

async function toggleUniversalTheme() {
  let rawData = await fetch("/services/theme/get");
  let currTheme = await rawData.json();
  if (currTheme.theme == "dark") {
    await fetch("/services/theme/set/light", {method:"PUT"});
  } else if (currTheme.theme == "light") {
    await fetch("/services/theme/set/dark", {method:"PUT"});
  }
  location.reload()
}

setTogglerThemeButtonImage()