var backgroundIndex = 0;

$(document).ready(function(){

    $('#register_btn').on('click', function(event){
        event.preventDefault();
        window.location.href = '/register'
    })

    changeBackground();
})

function changeBackground() {
    var i;
    var slides = document.getElementsByClassName("backgrounds");
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
    }
    backgroundIndex++;
    if (backgroundIndex > slides.length) backgroundIndex = 1;
    slides[backgroundIndex-1].style.display = "block";  
    setTimeout(changeBackground, 15000); // Change image every 15 seconds
}