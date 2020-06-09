"use strict"

const sql = require('sqlite3');
const db = new sql.Database('database.db');
const express = require('express');
const router = express.Router();

const ROLE = {
    ADMIN: 'admin',
    BASIC: 'basic'
}

router.get('/admin', checkAuthenticated, checkRole(ROLE.ADMIN), (req, res) => loadAdminPage(req, res));
router.get('/load_exercises', checkAuthenticated, checkRole(ROLE.ADMIN), (req, res) => loadExercises(req, res));
router.post('/load_single_exercise', checkAuthenticated, checkRole(ROLE.ADMIN), (req, res) => loadSingle(req, res));
router.post('/add_exercise', checkAuthenticated, checkRole(ROLE.ADMIN), (req, res) => addExercise(req, res));
router.post('/edit_exercise', checkAuthenticated, checkRole(ROLE.ADMIN), (req, res) => editExercise(req, res));
router.post('/delete_exercise', checkAuthenticated, checkRole(ROLE.ADMIN), (req, res) => deleteExercise(req, res));

function loadAdminPage(req, res){
    res.type('application/xhtml+xml');
    res.render('admin', {page_title: 'Admin Page', profile_picture: req.user.profile_picture, 'role': req.user.role});
    res.end();
}

function addExercise(req, res){
    let ps = db.prepare('INSERT INTO exercises(exercise_name, body_part) VALUES(?, ?)');
    ps.run(req.body.exercise_name, req.body.body_part, function(err){
        if(err) console.log(err);
        else res.end();
    });
    ps.finalize();
}

function loadExercises(req, res){
    let ps = db.prepare('SELECT * FROM exercises');
    ps.all(function(err, results){
        res.type('application/json');
        res.json(results);
        res.end();
    })
    ps.finalize();
}

function loadSingle(req, res){
    let ps = db.prepare('SELECT * FROM exercises WHERE id=?');
    ps.get(req.body.id, function(err, row){
        res.type('application/json');
        res.json(row);
        res.end();
    })
    ps.finalize();

}

function editExercise(req, res){
    let ps = db.prepare('UPDATE exercises SET exercise_name=?, body_part=? WHERE id=?');
    console.log(req.body);
    ps.run(req.body.exercise_name, req.body.body_part, req.body.id, function(err){
        if(err) console.log();
        else res.end();
    });
    ps.finalize();
}

function deleteExercise(req, res){
    let ps = db.prepare('DELETE FROM exercises WHERE id=?');
    ps.run(req.body.id, function(err){
        if(err) console.log(err);
        else res.end();
    })
    ps.finalize();  
}

function checkRole(role) {
    return (req, res, next) => {
        if(req.user.role !== role){
            res.status(401);
            res.redirect('/');
        }
        next()
    } 
}

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;