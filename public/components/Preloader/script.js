
var stopScroll = true;


document.addEventListener("scroll", () => {
    if(stopScroll && window.scrollY>1){
        window.scrollTo(0,0);
    }
  });
  

Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))).then(() => {
    // console.log('images finished loading');
    document.querySelector(".preloader-wrapper").style.display="none"
    stopScroll =false;
});