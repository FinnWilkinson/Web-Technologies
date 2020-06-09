"use strict"

const sql = require('sqlite3');
const db = new sql.Database('database.db');
const express = require('express');
const router = express.Router();

router.get('/account', checkAuthenticated, (req, res) => getAccount(req, res));
router.post('/update_profile_picture', checkAuthenticated, (req, res) => updateProfilePicture(req, res));
router.get('/load_account_data', checkAuthenticated, (req, res) => loadAccountData(req, res));
router.post('/saveupdates', checkAuthenticated, (req, res) => accountUpdates(req, res));
router.post('/submit_changes', checkAuthenticated, (req, res) => saveChanges(req, res));
router.post('/check_username', checkAuthenticated, (req, res) => checkUniqueUsername(req, res));


function getAccount(req, res){
    let ps = db.prepare("SELECT * FROM users WHERE id=?");
    ps.get(req.user.id, function(err, row){
        if(err) console.log(err);
        let res_obj = row;
        res_obj.page_title = 'My Account';
        res.type('application/xhtml+xml');
        res.render('account', res_obj);
        res.end();
    });
    ps.finalize(); 
}

function updateProfilePicture(req, res){
    let ps = db.prepare("UPDATE users SET profile_picture=? WHERE id=?");
    ps.run(req.body.img, req.user.id, function(err){
        if(err) console.log(err);
        res.end();
    });
    ps.finalize();
}

function loadAccountData(req, res){
    let ps = db.prepare("SELECT * FROM users WHERE id=?");
    ps.get(req.user.id, function(err, row){
        if(err) console.log(err);
        else{
            res.type('application/json');
            res.json({user: row});
            res.end();
        }
    });
    ps.finalize();
}

function accountUpdates(req, res){
    let ps = db.prepare("UPDATE accounts SET squat=?, bench=?, deadlift=? WHERE id=?");
    ps.run(req.body.squat, req.body.bench, req.body.deadlift, req.session.userId, function(err){
        if(err) console.log(err);
        else{
            res.type('application/json');
            res.json({msg: 'Successfully Updated Personal Records!'});
            res.end();
        }
    });
}

function saveChanges(req, res){ 
    let ps = db.prepare("UPDATE users SET username=?, first_name=?, last_name=?, age_class=?, weight_class=? WHERE id=?");
    ps.run(req.body.username, req.body.first_name, req.body.last_name, req.body.age_group, req.body.weight_class, req.user.id, function(err){
        if(err) console.log(err);
        else{
            res.end();
        }
    });
    ps.finalize();
}


function checkUniqueUsername(req, res){
    let ps = db.prepare('SELECT * FROM users WHERE username=? AND id<>?');
    ps.get(req.body.username, req.user.id, function(err, row){
        res.type('application/json');
        if(row === undefined) res.json({'unique': true})
        else res.json({'unique': false, 'username': req.user.username});
        res.end();
    })
    ps.finalize();
}

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;