const sql = require('sqlite3');
const crypto = require('crypto');
const LocalStrategy = require('passport-local').Strategy;

function initialize(passport, getUserByUsername, getUserById) {

    const authenticateUser =  async (username, password, done) => {
        getUserByUsername(username, async function(user){
            if (user == null) {
                return done(null, false, {message: 'Username Incorrect'});
            }
            try {
                var db = new sql.Database('database.db');
                let ps = db.prepare("SELECT * FROM users WHERE username=?");
                ps.get(username, function(err, row){
                    if(err) return done(null, false, {message: 'Server Error'});
                    if(verifyHashPassword(password, row.password_salt, row.password)){
                        return done(null, user);
                    } else {
                        return done(null, false, {message: "Password Incorrect"});
                    }
                });
                ps.finalize();
            } catch (e) {
                return done(e);
            }
        });
    }

    passport.use(new LocalStrategy({}, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        getUserById(id, function(user){
            return done(null, user);
        })
     });
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

function verifyHashPassword(passwordAttempt, salt, dbPassword){
    var attempt = sha512(passwordAttempt, salt).hash;
    if(attempt === dbPassword) return true;
    else return false;
}

module.exports = initialize