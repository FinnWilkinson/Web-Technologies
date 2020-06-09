const sql = require('sqlite3');
const db = new sql.Database('database.db');
const express = require('express');
const router = express.Router();

router.get('/planner', checkAuthenticated, (req, res) => loadWorkoutPlanner(req, res));
router.get('/loadExerciseForm', checkAuthenticated, (req, res) => loadExerciseForm(req, res));
router.get('/loadFilterOptions', checkAuthenticated, (req, res) => loadFilterOptions(req, res));
router.get('/getSearchResults', checkAuthenticated, (req, res) => getSearchResults(req, res));
router.post('/saveWorkout', checkAuthenticated, (req, res) =>  saveWorkout(req, res));
router.get('/loadSavedWorkout', checkAuthenticated, checkWorkout, (req, res) => loadSavedWorkout(req, res));
router.get('/unload_workout', checkAuthenticated, (req, res) => unloadWorkout(req, res));
router.post('/save_rep_max', checkAuthenticated, (req, res) => save1rm(req, res));

function loadWorkoutPlanner(req, res){
    res.type('application/xhtml+xml');
    res.render('planner', {page_title: 'Workout Planner', profile_picture: req.user.profile_picture, workout:req.session.workout, 'role': req.user.role});
    res.end();    
}

function loadExerciseForm(req, res){
    let body_Part = "%" + req.query.body_Part + "%";
    let ps = db.prepare("SELECT exercise_name FROM exercises WHERE body_part LIKE ?");
    ps.all(body_Part, function(err, results){
        if(err) console.log(err);
        res.json({names: results});
    });
    ps.finalize();
}

function getSearchResults(req, res){
    let exercise = "%" + req.query.exercise + "%";
    let ps = db.prepare("SELECT exercise_name FROM exercises WHERE exercise_name LIKE ?");
    ps.all(exercise, function(err, results){
        if(err) console.log(err);
        res.json({names: results});
    });
    ps.finalize();
}

function saveWorkout(request, res){
    let workoutId = request.session.workout;
    let userId = request.user.id;
    let name = request.body.name;
    let workout = request.body.workout;
    let weights = request.body.weight;
    let reps = request.body.rep;

    if(workoutId == undefined){
        let query = "INSERT INTO workouts(user_id, workout_name, workout_json, weight_data_json, rep_data_json) VALUES (?, ?, ?, ?, ?)";
        let ps = db.prepare(query);
        ps.run(userId, name, workout, weights, reps);
        ps.finalize();
    }
    else{
        let query = "UPDATE workouts SET workout_name = ?, workout_json = ?, weight_data_json = ?, rep_data_json = ? WHERE id = ? AND user_id = ?";
        let ps = db.prepare(query);
        ps.run(name, workout, weights, reps, workoutId, userId);
        ps.finalize();
    }

    res.end();
    
}

function loadSavedWorkout(req, res){
    let user_id = req.user.id;
    let workout_id = req.session.workout;
    let ps = db.prepare("SELECT * FROM workouts WHERE id = ? AND user_id = ?");
    ps.all(workout_id, user_id, function(err, results){
        if(err) console.log(err);
        let workout_names = results[0].workout_name;
        let workoutJson = results[0].workout_json;
        let workout_weight = results[0].weight_data_json;
        let workout_rep = results[0].rep_data_json;
        res.json({
            workout_name: workout_names,
            workoutJson: workoutJson,
            weights: workout_weight,
            reps: workout_rep
        });
    });
    ps.finalize();
}

function save1rm(req, res){
    let workout_id = req.session.workout;
    if(workout_id != undefined) return;
    let user_id = req.user.id;
    let date = new Date().toLocaleDateString();
    let query = "INSERT INTO user_record_data(movement, weight, date, userID) VALUES (?, ?, ?, ?)";
    let ps = db.prepare(query);
    if(req.body.bench != 0){
        ps.run("Bench Press", req.body.bench, date, user_id);
    }
    if(req.body.squat != 0){
        ps.run("Back Squat", req.body.squat, date, user_id);
    }
    if(req.body.deadlift != 0){
        ps.run("Deadlift", req.body.deadlift, date, user_id);
    } 
    ps.finalize();   
    res.end();
}

function unloadWorkout(req, res){
    req.session.workout = undefined;
    res.end();
}

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkWorkout(req, res, next){
    if(req.session.workout !== undefined){
        next();
    }
}

module.exports = router;