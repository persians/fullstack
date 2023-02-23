const express = require("express");
const db = require("./connection");
const session = require("express-session");
const app = express();
app.set("view engine", "ejs");

const path = require("path");
const upload = require("./upload");
app.use(express.static(path.resolve("./public")));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
const bcrypt = require("bcrypt");

// Use express-session middleware to handle sessions
app.use(
  session({
    secret: "secret-key", // use a secure random string for the secret key
    resave: false,
    saveUninitialized: false,
  })
);

var obj = {};

app.get("/", function (req, res) {
  if (!req.session.user) {
    // If the user is not logged in, redirect them to the login page
    return res.redirect("/login");
  }
  let sql = "SELECT * FROM post ORDER BY date DESC";
  db.query(sql, function (err, results) {
    if (err) {
      throw err;
    } else {
      obj = { data: results, req: req };
      console.log(obj);
      res.render("index", obj);
    }
  });
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      throw err;
    } else {
      const sqlInsert =
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?);";
      db.query(sqlInsert, [name, email, hash], (err, result) => {
        if (err) {
          throw err;
        } else {
          res.render("registered");
        }
      });
    }
  });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], function (err, results) {
    if (err) {
      throw err;
    } else {
      if (results.length > 0) {
        bcrypt.compare(password, results[0].password, function (err, result) {
          if (err) {
            throw err;
          }
          if (result) {
            req.session.user = { email: email, name: results[0].name };
            return res.redirect("/");
          } else {
            res.render("login", { error: "Incorrect password" });
          }
        });
      } else {
        res.render("login", { error: "User not found" });
      }
    }
  });
});

app.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      throw err;
    } else {
      res.redirect("/login");
    }
  });
});

app.get("/create-post", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("create-post");
});

app.post("/create-post", upload.single("image"), function (req, res) {
  const title = req.body.title;
  const description = req.body.description;
  const image = req.file.filename;

  const sqlInsert =
    "INSERT INTO post (title, description, image) VALUES (?, ?, ?);";
  db.query(sqlInsert, [title, description, image], function (err, result) {
    if (err) {
      throw err;
    } else {
      res.redirect("/");
    }
  });
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
