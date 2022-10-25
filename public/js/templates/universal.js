var root = document.querySelector(":root");
let rootStyle = getComputedStyle(root);

async function grabUniversalTheme() {
  let currTheme = await fetch("/services/theme/get");
  let currentTheme = await currTheme.json();
  if (currentTheme.theme == "dark") {
    root.style.setProperty("--primary", "#ec3333");
    root.style.setProperty("--background", "#000000");
    root.style.setProperty("--foreground", "#171924");
    root.style.setProperty("--text-primary", "#ffffff");
    root.style.setProperty("--text-secondary", "#000000");
    root.style.setProperty("--high-contrast-bg", "#ffffff");
    root.style.setProperty("--high-contrast-fg", "#000000");
    root.style.setProperty("--shadow", "#ffffffb8");
    colorPrimary = rootStyle.getPropertyValue("--primary");
    colorTextPrimary = rootStyle.getPropertyValue("--text-primary");
    colorTextSecondary = rootStyle.getPropertyValue("--text-secondary");
    colorForeground = rootStyle.getPropertyValue("--foreground");
    document.querySelectorAll(".navbar-item img").forEach((e) => {
      e.style = getFilter(colorTextPrimary);
    });
    document.querySelector('#body-title-showing img').style = getFilter(colorTextPrimary)
  }
}

grabUniversalTheme();

var colorPrimary = rootStyle.getPropertyValue("--primary");
var colorTextPrimary = rootStyle.getPropertyValue("--text-primary");
var colorTextSecondary = rootStyle.getPropertyValue("--text-secondary");
var colorForeground = rootStyle.getPropertyValue("--foreground");
API_KEY = "";

let parameterDivs = document.querySelectorAll(".template-rendering-parameter");

let params = [];

for (parameter in parameterDivs) {
  if (/^\d+$/.test(parameter)) {
    params[parameterDivs[parameter].id] = parameterDivs[parameter].innerText;
    while (
      document.body.innerHTML.includes(`#%=${parameterDivs[parameter].id}`)
    ) {
      document.body.innerHTML = document.body.innerHTML.replace(
        `#%=${parameterDivs[parameter].id}`,
        parameterDivs[parameter].innerText
      );
    }
  }
}
