const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "Artin",
  password: "oJ0opudj957xHq(n",
  database: "fullstack",
});

db.connect(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("connected to mySQL");
  }
});

module.exports = db;
