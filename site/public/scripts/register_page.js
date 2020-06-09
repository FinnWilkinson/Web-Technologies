'use strict'
var basic;
var unique_username;
var backgroundIndex = 0;


$(document).ready(function(){
	changeBackground();
	$(function() {
		basic = $('#demo-basic').croppie({
			enableExif: true,
			enableOrientation: true,
			viewport: {
				width: 200,
				height: 200,
				type: 'circle'
			},
			boundary: {
				width: 300,
				height: 300
			}
		});
	});

	$('#username').on('change', function(){
		var username = this.value;
		$.ajax({
			url: '/unique_username',
			type: 'POST',
			data: {'username': this.value},
			success: function(res){
				if(res.unique === false){
					confirm("The username: " + username + " is already taken");
					document.getElementById('username').value = '';
				}
			}
		})
	});

	var modal = document.getElementById('profile_picture_modal');

	$('#upload_profile_picture').on('click', function(){
		event.preventDefault();
		modal.style.display = "block";
		$('#demo-basic').croppie('bind', {
			url: document.getElementById('profile_pic').src,
			point: [77, 469, 280, 739]
		});
	});

	$('#modal-close').on('click', function(){
		modal.style.display = "none";
	})

	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
	
	$('#chosen_file').on('change', function(){
		var reader = new FileReader();
		reader.onload = function (e) {
			$('#demo-basic').croppie('bind', {
				url: e.target.result,
			});
		}
		var file = document.getElementById('chosen_file').files[0];
		reader.readAsDataURL(file);
	});
	
	$('#crop_submit').on('click', function(){
		basic.croppie('result', {
			type: 'base64'
		}).then(function (res){
			document.getElementById('profile_pic').src = res;
			modal.style.display = "none";
		});
		
	});

	$('#register_form').submit(function(event){
		event.preventDefault();
		$.ajax({
			url: '/register',
			type: 'POST',
			data: {
				'username': $(this)[0][0].value,
				'password': $(this)[0][1].value,
				'first_name': $(this)[0][2].value,
				'last_name': $(this)[0][3].value,
				'age_class': $(this)[0][4].value,
				'weight_class': $(this)[0][5].value,
				'img': document.getElementById('profile_pic').src
			},
			success: function(){
				window.location.href = '/login'
			},
			failure: function(){
				window.location.hred = '/register'
			}
		});
	})

	$('#back_btn').on('click', function(){
		event.preventDefault();
		window.location.href = '/login'
	});
});

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