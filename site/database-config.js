const sql = require('sqlite3');
const db = new sql.Database('database.db');

function config(){
    console.log("Dropping tables...");
    db.serialize(dropTables());
    console.log("Creating tables...");
    db.serialize(createTables());
}

function dropTables(){
    db.run("drop table if exists workouts");
    db.run("drop table if exists exercises");
    db.run("drop table if exists user_record_data");
    db.run("drop table if exists users");
}

function createTables(){
    db.run(`CREATE TABLE users( id INTEGER PRIMARY KEY, username TEXT NOT NULL, password TEXT NOT NULL, password_salt TEXT NOT NULL,
                                first_name TEXT NOT_NULL, last_name TEXT NOT NULL, age_class TEXT NOT NULL,
                                weight_class TEXT NOT NULL, profile_picture TEXT NOT NULL, role TEXT NOT NULL)`);
    
    db.run(`CREATE TABLE user_record_data(  id INTEGER PRIMARY KEY, movement TEXT NOT NULL, weight INTEGER NOT NULL, date DATE NOT NULL,
                                            userID INTEGER NOT NULL, FOREIGN KEY (userID) REFERENCES users(id))`);
    
    db.run(`CREATE TABLE exercises( id INTEGER PRIMARY KEY, exercise_name TEXT NOT NULL, body_part TEXT NOT NULL)`);
    
    db.run(`CREATE TABLE workouts (id INTEGER PRIMARY KEY, workout_name TEXT NOT NULL, workout_json TEXT, weight_data_json TEXT, rep_data_json TEXT,
            user_id INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id))`);

}

module.exports = config;