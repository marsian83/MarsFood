var root = document.querySelector(":root");
let rootStyle = getComputedStyle(root);
var colorPrimary = rootStyle.getPropertyValue("--primary");
var colorTextPrimary = rootStyle.getPropertyValue("--text-primary");
var colorTextSecondary = rootStyle.getPropertyValue("--text-secondary");
var colorForeground = rootStyle.getPropertyValue("--foreground");
API_KEY=""

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
