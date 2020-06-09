var workoutTiles;
var dragSrcEl = null;

$(document).ready(function(){
	getAllWorkoutTiles();
	filterExercises("");
	document.getElementById("workout_name").value = new Date().toLocaleDateString() + " Workout";
	loadWorkout();

	window.onbeforeunload = function(e) {
		$.ajax({
			url: '/unload_workout',
			type: 'GET'
		});
	}

});

function addExercise(exercise_name){
	getAllWorkoutTiles();
	let newDiv = $(`<div class="workout-input" draggable="true">
						<button class="remove_exercise_btn">Remove</button>
						<h2>` + exercise_name + `</h2>
						<div class="set-input" id="sets_` + (workoutTiles.length).toString() + `">
							<input type="number" class="weight" min="0" placeholder="Weight / Kg"/>
							<input type="number" class="reps" min="0" placeholder="Reps"/>
							<button class="remove_set_btn">X</button>						
						</div>
						<button class="add_set_btn">Add Set</button>
					</div>`);
	$('#planner').append(newDiv);
	addBtnListeners();
	getAllWorkoutTiles();
	closeForm();
}

function addBtnListeners(){
	let add_set_buttons = document.getElementsByClassName('add_set_btn');
	let remove_set_buttons = document.getElementsByClassName('remove_set_btn');
	let remove_exercise_buttons = document.getElementsByClassName('remove_exercise_btn');

	for(i=0; i<add_set_buttons.length; i++){
		add_set_buttons[i].addEventListener('click', addSet);
	}
	for(i=0; i<remove_set_buttons.length; i++){
		remove_set_buttons[i].addEventListener('click', removeSet);
	}
	for(i=0; i<remove_exercise_buttons.length; i++){
		remove_exercise_buttons[i].addEventListener('click', removeExercise);
	}
}

function addSet(){
	let newSet = '<input type="number" class="weight" min="0" placeholder="Weight / Kg"/> <input type="number" class="reps" min="0" placeholder="Reps"/> <button class="remove_set_btn">X</button>';
	$(this).prev().last().append(newSet);	
	addBtnListeners()
}

function removeSet(){
	$(this).prev().remove();
	$(this).prev().remove();
	$(this).remove();
}

function removeExercise(){
	$(this).parent().remove();
	addBtnListeners()
}

function getAllWorkoutTiles(){
	workoutTiles = document.getElementsByClassName("workout-input");
	for(let i = 0; i < workoutTiles.length; i++){
		workoutTiles[i].addEventListener('dragstart', handleDragStart);
		workoutTiles[i].addEventListener('dragenter', handleDragEnter);
		workoutTiles[i].addEventListener('dragover', handleDragOver);
		workoutTiles[i].addEventListener('dragleave', handleDragLeave);
		workoutTiles[i].addEventListener('drop', handleDrop);
		workoutTiles[i].addEventListener('dragend', handleDragEnd);
	}
}

function handleDragStart(ev) {
	var weights = [];
	var reps = [];
	var tempWeight = this.getElementsByClassName("weight");
	var tempRep = this.getElementsByClassName("reps");
	for(i=0; i<tempWeight.length; i++){
		weights[i] = (tempWeight[i].value);
		reps[i] = (tempRep[i].value);
	}

	this.style.opacity = '0.4';
	dragSrcEl = this;
	ev.dataTransfer.effectAllowed = 'move';
	ev.dataTransfer.setData('text', this.innerHTML);
	ev.dataTransfer.setData('weights', JSON.stringify(weights));
	ev.dataTransfer.setData('reps', JSON.stringify(reps));
}

function handleDragOver(ev){
	if(ev.preventDefault){
		ev.preventDefault();
	}
	ev.dataTransfer.dropEffect = 'move';
	return false;
}

function handleDragEnter(ev){
	this.classList.add('over');
}

function handleDragLeave(ev){
	this.classList.remove('over');
}

function handleDrop(ev){
	if(ev.stopPropagation){
		ev.stopPropagation();
	}
	if(dragSrcEl != this){
		var thisWeights = [];
		var thisReps = [];
		var tempWeight = this.getElementsByClassName("weight");
		var tempRep = this.getElementsByClassName("reps");
		for(i=0; i<tempWeight.length; i++){
			thisWeights[i] = (tempWeight[i].value);
			thisReps[i] = (tempRep[i].value);
		}

		dragSrcEl.innerHTML = this.innerHTML;
		tempWeight = dragSrcEl.getElementsByClassName("weight");
		tempRep = dragSrcEl.getElementsByClassName("reps");
		for(i=0; i<tempWeight.length; i++){
			tempWeight[i].value = thisWeights[i];
			tempRep[i].value = thisReps[i];
		}

		this.innerHTML = ev.dataTransfer.getData('text');
		tempWeight = this.getElementsByClassName("weight");
		tempRep = this.getElementsByClassName("reps")
		var recievedWeights = JSON.parse(ev.dataTransfer.getData('weights'));
		var recievedReps = JSON.parse(ev.dataTransfer.getData('reps'));
		for(i=0; i<tempWeight.length; i++){
			tempWeight[i].value = recievedWeights[i];
			tempRep[i].value = recievedReps[i];
		}
	}
	return false;
}

function handleDragEnd(ev){
	for (var i = 0; i < workoutTiles.length; i++) {
		workoutTiles[i].classList.remove('over');
	}
	this.style.opacity = '1.0';	
	addBtnListeners();
}

function openForm() {
	filterExercises("");
	document.getElementById("exercise_search").value = '';
	document.getElementById("workout_popup_form").scrollTop;
	$('#workout_popup_form').fadeToggle();
}

function closeForm() {
	$('#workout_popup_form').fadeToggle();
}

function addExerciseBtns(bodyPart_filter){
	$.ajax({
		url: '/loadExerciseForm',
		type: 'GET',	
		data: {body_Part: bodyPart_filter},
		success: function(res){
			let all_exercises = res.names.sort();
			all_exercises.reverse();
			for(let i = 0; i < all_exercises.length; i++){
				document.getElementById("exit_btn").insertAdjacentHTML("afterend", "<button name=\"" + all_exercises[i].exercise_name + "\" id=\"" + all_exercises[i].exercise_name + "_btn\" type=\"button\" class=\"popup_btn\" onclick=\"addExercise(this.name)\">" + all_exercises[i].exercise_name + "</button>");	
			}
		}	
	});
}

function filterExercises(filter_selected){
	$('.popup_btn').remove();
	addExerciseBtns(filter_selected);
	document.getElementById("exercise_search").value = '';
}

function searchExercises(search_text){
	$('.popup_btn').remove();
	var req = $.ajax({
		url: '/getSearchResults',
		type: 'GET',	
		data: {
			exercise: search_text
		}	
	});

	req.done(function(res){
		var all_exercises = res.names.sort();
		all_exercises.reverse();
		for(let i = 0; i < all_exercises.length; i++){
			document.getElementById("exit_btn").insertAdjacentHTML("afterend", "<button name=\"" + all_exercises[i].exercise_name + "\" id=\"" + all_exercises[i].exercise_name + "_btn\" type=\"button\" class=\"popup_btn\" onclick=\"addExercise(this.name)\">" + all_exercises[i].exercise_name + "</button>");	
		}
	});
}

function saveWorkout() {
	save1rmEstimates();
	let tempWeight = document.getElementsByClassName("weight");
	let tempRep = document.getElementsByClassName("reps");
	var weights = [];
	var reps = [];
	for(i=0; i<tempWeight.length; i++){
		weights[i] = tempWeight[i].value;
		reps[i] = tempRep[i].value;
	}

	let workoutJSON = JSON.stringify(document.getElementById("planner").innerHTML);
	let weightsJSON = JSON.stringify(weights);
	let repsJSON = JSON.stringify(reps);
	let workoutName = document.getElementById("workout_name").value;

	$.ajax({
		url: '/saveWorkout',
		type: 'POST',	
		data: {
			name: workoutName,
			workout: workoutJSON,
			weight: weightsJSON,
			rep: repsJSON
		},
		success: function(){
			window.location.href = "/";
		}	
	});
}

function loadWorkout(){
	$.ajax({
		url: '/loadSavedWorkout',
		type: 'GET',
		success: function(res){
			document.getElementById("workout_name").value = new String(res.workout_name);
			$('#planner').append(JSON.parse(res.workoutJson));
			
			let weights = JSON.parse(res.weights);
			let reps = JSON.parse(res.reps);
			let weightFields = document.getElementById('planner').getElementsByClassName("weight");
			let repFields = document.getElementById('planner').getElementsByClassName("reps");
			for(i=0; i<weightFields.length; i++){
				weightFields[i].value = (weights[i]);
				repFields[i].value = (reps[i]);
			}
			addBtnListeners();
			getAllWorkoutTiles();
		}
	});
}

function epleyFormula(weight, reps){
	if(reps > 1) return Math.round(weight * (1 + (reps/30)));
	else return weight;
}

function save1rmEstimates(){
	var bench_1rm = 0;
	var squat_1rm = 0;
	var deadlift_1rm = 0;

	let bench_workouts = [];
	let squat_workouts = [];
	let deadlift_workouts = [];

	let bench_weights = [];
	let bench_reps = [];
	let squat_weights = [];
	let squat_reps = [];
	let deadlift_weights = [];
	let deadlift_reps = [];

	let headers = document.getElementsByTagName("h2");
	for(let i=0; i<headers.length; i++){
		if(headers[i].innerText == "Bench Press"){
			bench_workouts.push(headers[i].parentElement);
		}
		else if(headers[i].innerText == "Back Squat"){
			squat_workouts.push(headers[i].parentElement);
		}
		else if(headers[i].innerText == "Deadlift"){
			deadlift_workouts.push(headers[i].parentElement);
		}
	}

	for(let i=0; i<bench_workouts.length; i++){
		bench_weights.push(bench_workouts[i].getElementsByClassName("weight"));
		bench_reps.push(bench_workouts[i].getElementsByClassName("reps"));
	}
	for(let i=0; i<squat_workouts.length; i++){
		squat_weights.push(squat_workouts[i].getElementsByClassName("weight"));
		squat_reps.push(squat_workouts[i].getElementsByClassName("reps"));
	}
	for(let i=0; i<deadlift_workouts.length; i++){
		deadlift_weights.push(deadlift_workouts[i].getElementsByClassName("weight"));
		deadlift_reps.push(deadlift_workouts[i].getElementsByClassName("reps"));
	}	

	for(let i=0; i<bench_weights.length; i++){
		for(let j=0; j<bench_weights[i].length; j++){
			let temp = epleyFormula(bench_weights[i][j].value, bench_reps[i][j].value);
			if(temp > bench_1rm) bench_1rm = temp;
		}
	}
	for(let i=0; i<squat_weights.length; i++){
		for(let j=0; j<squat_weights[i].length; j++){
			let temp = epleyFormula(squat_weights[i][j].value, squat_reps[i][j].value);
			if(temp > squat_1rm) squat_1rm = temp;
		}
	}
	for(let i=0; i<deadlift_weights.length; i++){
		for(let j=0; j<deadlift_weights[i].length; j++){
			let temp = epleyFormula(deadlift_weights[i][j].value, deadlift_reps[i][j].value);
			if(temp > deadlift_1rm) deadlift_1rm = temp;
		}
	}
	
	$.ajax({
		url: '/save_rep_max',
		type: 'POST',	
		data: {
			bench: bench_1rm,
			squat: squat_1rm,
			deadlift: deadlift_1rm
		}
	});	
}