$(document).ready(function(){
	window.onscroll = function() {scrollerFunction()};
	var header = document.getElementById('header');
	var menu = document.getElementById('mySidenav');

	var sticky = header.offsetTop;

	function scrollerFunction(){
		if(window.pageYOffset > sticky) {
			header.classList.add('sticky');

		} else {
			header.classList.remove('sticky');
		}
	}
	

})

function openNav() {
	document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
}

function preventNumberInput(e){
	var keyCode = (e.keyCode ? e.keyCode : e.which);
	if(keyCode > 47 && keyCode < 58 || keyCode > 96 && keyCode < 107){
		e.preventDefault();
	}
}