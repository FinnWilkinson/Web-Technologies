$(document).ready(function(){

	

	updateCharts();
	getWorkouts();
});

async function updateCharts(){
	await $.ajax({ 
		url: '/fetch_records',
		type: 'GET', 
		data: {movement: "Bench Press"},
		success: function(res){showChart('bench_chart', res.weights, res.dates, "Bench Press");}
	});

	await $.ajax({ 
		url: '/fetch_records',
		type: 'GET', 
		data: {movement: "Back Squat"},
		success: function(res){showChart('squat_chart', res.weights, res.dates, "Back Squat");}
	});

	await $.ajax({ 
		url: '/fetch_records',
		type: 'GET', 
		data: {movement: "Deadlift"},
		success: function(res){showChart('deadlift_chart', res.weights, res.dates, "Deadlift");}
	});
}

function showChart(chart, weight_data, date_data, movement){
	if(weight_data.length > 15){
		let temp_data = weight_data;
		let temp_dates = date_data;
		weight_data = [];
		date_data = [];
		for(let i=temp_data.length-15; i<temp_data.length; i++){
			weight_data.push(temp_data[i]);
			date_data.push(temp_dates[i]);
		}
	}
	new Chart(document.getElementById(chart), {
		type: 'line',
		data: {
    		labels: date_data,
    		datasets: [{
        		data: weight_data,
				fill: false,
				backgroundColor:  '#2978A0',
        		borderColor: '#2978A0',
        		borderWidth: 2,
				lineTension: 0.2,
				pointRadius: 6,
				pointStyle: 'crossRot'
    		}]},
		options: {
			title: {display: true, text: movement, fontSize: 20, fontColor: '#2978A0'},
			legend: {display: false},
			scales: {
				yAxes: [{
					scaleLabel: {display: true, labelString: 'Weight / Kg', fontSize: 15, fontStyle: 'bold'}
				}],
				xAxes: [{
					scaleLabel: {display: true, labelString: 'Date', fontSize: 15, fontStyle: 'bold'}
				}]
			}
		}
	});
}

function calc1RM(){
	let weight = document.getElementById("1rm_weight_input").value;
	let reps = document.getElementById("1rm_reps_input").value;
	let output = document.getElementById("1rm_result");
	let epley = document.getElementById("epley_radio").checked;

	if(epley == true){
		if(reps > 0){
			let rep_max = epleyFormula(weight, reps);
			output.innerHTML = " = " + rep_max + "Kg";
		}
		else{
			output.innerHTML = " = N/A";
		}
	}
	else{
		if(reps > 0){
			let rep_max = brzyckiFormula(weight, reps);
			output.innerHTML = " = " + rep_max + "Kg";
		}
		else{
			output.innerHTML = " = N/A";
		}
	}
}

function epleyFormula(weight, reps){
	if(reps > 1) return Math.round(weight * (1 + (reps/30)));
	else return weight;
}

function brzyckiFormula(weight, reps){
	return Math.round(weight * (36/(37 - reps)));
}

function getWorkouts(){
    var req = $.ajax({
		url: '/getSavedWorkouts',
		type: 'GET'
	});

	req.done(function(res){
		addWorkoutsToPage(res.workoutNames.reverse(), res.workoutIds.reverse());
	});
}

function addWorkoutsToPage(workout_names, workout_ids){
	for(let i=0; i<workout_names.length; i++){
		let html_insert = "<div class=\"workout_div\" id=\"" + workout_ids[i] + "\"> <h2>" + workout_names[i] + "</h2> <button class=\"workout_btn\" type=\"button\" id=\"workout_del_btn_" + workout_ids[i] + "\" onclick=\"if(confirm('Are you sure you wish to delete " + workout_names[i] + "?')){deleteWorkout(" + workout_ids[i] + ");}else{return false;};\">Delete</button> <button class=\"workout_btn\" type=\"button\" id=\"workout_view_btn_" + workout_ids[i] + "\" onclick=\"viewWorkout(" + workout_ids[i] + ")\">View</button> </div>";
		document.getElementById("workouts_list").insertAdjacentHTML("beforeend", html_insert);
	}
}

function deleteWorkout(workout_id){
	$('#' + workout_id).remove();
	var req = $.ajax({
		url: '/deleteWorkout',
		type: 'POST',
		data: {
			workout_id: workout_id
		}
	});
}

function viewWorkout(workout_id){
	$.ajax({
		url: '/load_workout',
		type: 'POST',
		data: {id: workout_id},
		success: function(){
			window.location.href = '/planner'
		}
	})
}

