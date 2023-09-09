document.addEventListener("scroll", function(){
    let distance = document.getElementsByTagName("html")[0].scrollTop;
    if(distance > window.innerHeight * 0.67)
        document.getElementById("small-header").classList.add("visible");
    else
        document.getElementById("small-header").classList.remove("visible");
});