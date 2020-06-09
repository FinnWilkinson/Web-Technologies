var basic;
var username_on_load;

$(document).ready(function(){
	username_on_load = $('#username').value;

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

		$.ajax({
			url: '/load_account_data',
			type: 'GET',
			success: function(res){
				$('#age_group_select').val(res.user.age_class);
				$('#weight_class_select').val(res.user.weight_class);
			}
		})

	});

	$('#username').on('change', function(){
		var username = this.value;
		$.ajax({
			url: '/check_username',
			type: 'POST',
			data: {'username': this.value},
			success: function(res){
				if(res.unique === false){
					confirm("The username: " + username + " is already taken");
					document.getElementById('username').value = res.username;
				}
			}
		})
	});

	var modal = document.getElementById('profile_picture_modal');

	$('#upload_profile_picture').on('click', function(){
		event.preventDefault();
		$('#demo-basic').croppie('bind', {
			url: document.getElementById('profile_pic').src,
			point: [77, 469, 280, 739]
		});
		$('#profile_picture_modal').fadeToggle();
	});

	$('#modal-close').on('click', function(){
		$('#profile_picture_modal').fadeToggle();
	})

	window.onclick = function(event) {
		if (event.target == modal) {
			$('#profile_picture_modal').fadeToggle();
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
		event.preventDefault();
		basic.croppie('result', {
			type: 'base64'
		}).then(function (res){
			$.ajax({
				url: '/update_profile_picture',
				type: 'POST',
				data: {img: res},
				success: function(){
					document.getElementById('profile_pic').src = res;
					document.getElementById('header_profile_pic').src = res;
					$('#profile_picture_modal').fadeToggle();
				}
			});
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
				'gender': $(this)[0][5].value,
				'weight_class': $(this)[0][7].value,
				'img': document.getElementById('profile_pic').src
			},
			success: function(){
				window.location.href = '/login'
			},
			failure: function(){
				window.location.href = '/register'
			}
		});
	})

	$('#make_changes_btn').on('click', function(event){
		event.preventDefault()
		document.getElementById('make_changes_btn').style.display = "none";
		$('#submit_changes').fadeToggle();

		document.getElementById('username').disabled = false;
		document.getElementById('first_name').disabled = false;
		document.getElementById('last_name').disabled = false;
		document.getElementById('age_group_select').disabled = false;
		document.getElementById('weight_class_select').disabled = false;

	})

	$('#submit_changes').on('click', function(event){
		event.preventDefault();
		$.ajax({
			url: '/submit_changes',
			type: 'POST',
			data: {
				'username': $('#username').val(),
				'first_name': $('#first_name').val(),
				'last_name': $('#last_name').val(),
				'age_group': $('#age_group_select').val(),
				'weight_class': $('#weight_class_select').val()
			},
			success: function(){
				document.getElementById('submit_changes').style.display = "none";
				$('#make_changes_btn').fadeToggle();
				document.getElementById('username').disabled = true;
				document.getElementById('first_name').disabled = true;
				document.getElementById('last_name').disabled = true;
				document.getElementById('age_group_select').disabled = true;
				document.getElementById('weight_class_select').disabled = true;
			}
		})
	});

});