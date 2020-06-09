const sql = require('sqlite3');
const db = new sql.Database('database.db');
const express = require('express');
const router = express.Router();

router.get('/', checkAuthenticated, (req, res) =>  loadHomepage(req, res));
router.get('/fetch_records', checkAuthenticated, (req, res) => fetchRecords(req, res));
router.get('/getSavedWorkouts', checkAuthenticated, (req, res) => getSavedWorkouts(req, res));
router.post('/deleteWorkout', checkAuthenticated, (req, res) => deleteWorkout(req, res));
router.post('/load_workout', checkAuthenticated, (req, res) => loadWorkout(req,res));

function loadHomepage(req, res){
    res.type('application/xhtml+xml');
    res.render('homepage', {page_title: 'My Homepage', profile_picture: req.user.profile_picture, 'role': req.user.role});
    res.end();
}

function fetchRecords(req, res){
    let ps = db.prepare("SELECT * FROM user_record_data WHERE userID=? AND movement=?");
    ps.all(req.user.id, req.query.movement, function(err, results){
        if (err) console.log(err);
        let weights = []; let dates = [];
        for(let i = 0; i < results.length; i++){
            weights.push(results[i].weight);
            dates.push(results[i].date.toString());
        }
        res.type('application/json');
        res.json({weights: weights, dates: dates});
    });
    ps.finalize();
}

function getSavedWorkouts(request, response){
    let query = "SELECT * FROM workouts WHERE user_id = ?";
    let userId = request.user.id;
    let workoutNames = [];
    let workout_ids = []
    let ps = db.prepare(query);
    ps.all(userId, function(err, results, fields){
        for(let i = 0; i < results.length; i++){
            workoutNames[i] = results[i].workout_name;
            workout_ids[i] = results[i].id;
        }
        response.json({
            workoutNames: workoutNames,
            workoutIds: workout_ids
        });
    });
    ps.finalize();
}

function deleteWorkout(req, res){
    let query = "DELETE FROM workouts WHERE id = ?";
    let ps = db.prepare(query);
    ps.run(req.body.workout_id)
    ps.finalize();
    res.end();
}

function loadWorkout(req, res){
    req.session.workout = req.body.id;
    res.end();
}

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;