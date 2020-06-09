"use strict"
// ---  NODE MODULES ETC. --- ///

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const crypto = require('crypto');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

const sql = require('sqlite3');
const db = new sql.Database('database.db');

const port = 8080;
const https_port = 3000;

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert-pem'))
}

const ROLE = {
    ADMIN: 'admin',
    BASIC: 'basic'
}


const initialisePassport = require('./passport-config.js');
initialisePassport(passport,
    function(username, callback){
        let ps = db.prepare("SELECT * FROM users WHERE username=?");
        ps.get(username, function(err, row) {
            if(err) console.log(err);
            return callback(row);
        });
        ps.finalize();
    },
    function(id, callback){
        let ps = db.prepare("SELECT * FROM users WHERE id=?");
        ps.get(id, function(err, row) {
            if(err) console.log(err);
            return callback(row);
        });
        ps.finalize();
    }
);

//const configDatabase = require('./database-config.js');
//configDatabase();


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public/'));
app.set('views', __dirname + '/public/');
app.use(bodyParser.urlencoded({extended:true, limit: '50mb'}));
app.use(bodyParser.json());
app.use(flash());
app.use(session({
    secret : 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.type('application/xhtml+xml');
    res.render('login');
    res.end();
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.type('application/xhtml+xml');
    res.render('register');
    res.end();
});

app.post('/register', checkNotAuthenticated, (req, res) => {
    let ps = db.prepare("INSERT INTO users(username, password, password_salt, first_name, last_name, age_class, weight_class, profile_picture, role) VALUES(?,?,?,?,?,?,?,?, ?)");
    let pwd_data = saltHashPassword(req.body.password);
    ps.run(req.body.username, pwd_data.hash, pwd_data.salt, req.body.first_name, req.body.last_name, req.body.age_class, req.body.weight_class, req.body.img, ROLE.BASIC,
        function(err){if(err) console.log(err)});
    ps.finalize();
    res.end();
});

app.post('/unique_username', checkNotAuthenticated, (req, res) => {
    let ps = db.prepare('SELECT * FROM users WHERE username=?');
    ps.get(req.body.username, function(err, row){
        res.type('application/json');
        if(row === undefined) res.json({'unique': true})
        else res.json({'unique': false})
        res.end();
    })
    ps.finalize();
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    req.logOut();
    res.redirect('/login');
});

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/');
    }
    return next();
}

function genRandomString(length) {
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0, length);
}

function sha512(password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        hash: value
    };
}

function saltHashPassword(userPassword) {
    var salt = genRandomString(64);
    var passwordData = sha512(userPassword, salt);
    return passwordData;
}

// Routers
const homepage_router = require('./routes/homepage.js');
const planner_router = require('./routes/planner.js');
const accounts_router = require('./routes/account.js');
const admin_router = require('./routes/admin.js');

app.use(homepage_router);
app.use(planner_router);
app.use(accounts_router); 
app.use(admin_router);

app.use(function(req, res, next){
    res.status(404);
    res.redirect('/');
})

// Create the server and listen
http.createServer(app).listen(port, function() {
    console.log('Server listening on port:', port);
});

https.createServer(httpsOptions, app).listen(https_port, function() {
    console.log('HTTPS Server listening on port:', https_port);
});