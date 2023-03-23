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
  let sql =
    "SELECT post.*, users.name FROM post JOIN users ON post.user_id = users.id ORDER BY post.date DESC";
  db.query(sql, function (err, results) {
    if (err) {
      throw err;
    } else {
      obj = { data: results, req: req, formatDate: formatDate };
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
            req.session.user = {
              id: results[0].id, // add the user_id to the session object
              email: email,
              name: results[0].name,
            };
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

app.get("/post", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("post", { req: req });
});

app.post("/post", upload.single("img"), (req, res) => {
  const title = req.body.title;
  const text = req.body.text;
  const img = req.file ? `/uploads/${req.file.filename}` : "";
  const user_id = req.session.user.id; // retrieve the user_id from the session object

  const sqlInsert =
    "INSERT INTO post (title, text, img, user_id) VALUES (?, ?, ?, ?);";
  db.query(sqlInsert, [title, text, img, user_id], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error creating post");
    } else {
      res.redirect("/");
    }
  });
});

// server.js
app.get("/post/:id", function (req, res) {
  const postId = req.params.id;

  let sql =
    "SELECT post.*, users.name FROM post JOIN users ON post.user_id = users.id WHERE post.id = ?";
  db.query(sql, [postId], function (err, results) {
    if (err) {
      throw err;
    } else {
      if (results.length > 0) {
        let post = results[0];
        res.render(path.join(__dirname, "public/routes/posts"), { post: post });
      } else {
        res.status(404).send("Post not found");
      }
    }
  });
});

app.get("/my-posts", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const userId = req.session.user.id;
  const sql =
    "SELECT post.*, users.name FROM post JOIN users ON post.user_id = users.id WHERE users.id = ? ORDER BY post.date DESC";
  db.query(sql, [userId], function (err, results) {
    if (err) {
      throw err;
    } else {
      res.render(path.join(__dirname, "public/routes/my-posts"), {
        data: results,
      });
    }
  });
});

app.get("/my-posts/edit/:id", function (req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const postId = req.params.id;
  const userId = req.session.user.id;

  const sql = "SELECT * FROM post WHERE id = ? AND user_id = ?";
  db.query(sql, [postId, userId], function (err, results) {
    if (err) {
      throw err;
    } else {
      if (results.length > 0) {
        let post = results[0];
        res.render(path.join(__dirname, "public/routes/edit-post"), {
          post: post,
        });
      } else {
        res.status(404).send("Post not found");
      }
    }
  });
});

app.post("/my-posts/edit/:id", upload.single("img"), (req, res) => {
  const postId = req.params.id;
  const userId = req.session.user.id;
  const title = req.body.title;
  const text = req.body.text;
  const newImg = req.file ? `/uploads/${req.file.filename}` : "";

  const sqlSelect = "SELECT img FROM post WHERE id = ? AND user_id = ?";
  db.query(sqlSelect, [postId, userId], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error updating post");
    } else {
      const img = newImg !== "" ? newImg : results[0].img;

      const sqlUpdate =
        "UPDATE post SET title = ?, text = ?, img = ? WHERE id = ? AND user_id = ?";
      db.query(
        sqlUpdate,
        [title, text, img, postId, userId],
        (err, results) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error updating post");
          } else {
            res.redirect("/my-posts");
          }
        }
      );
    }
  });
});

app.post("/my-posts/delete/:id", function (req, res) {
  const postId = req.params.id;
  const userId = req.session.user.id;

  const sqlDelete = "DELETE FROM post WHERE id = ? AND user_id = ?";
  db.query(sqlDelete, [postId, userId], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error deleting post");
    } else {
      res.redirect("/my-posts");
    }
  });
});

function formatDate(dateString) {
  const date = new Date(dateString);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
