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
      obj = {
        data: results,
        req: req,
        isAdmin: req.session.user.isAdmin,
        formatDate: formatDate,
      };
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
              isAdmin: results[0].admin,
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
        user: req.session.user, // Pass the user object from the session
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

  const sql = "SELECT * FROM post WHERE id = ? AND (user_id = ? OR ?)";
  db.query(
    sql,
    [postId, userId, req.session.user.isAdmin],
    function (err, results) {
      if (err) {
        throw err;
      } else {
        if (results.length > 0) {
          let post = results[0];
          res.render(path.join(__dirname, "public/routes/edit-post"), {
            post: results[0],
            isAdmin: req.session.user.isAdmin, // pass the isAdmin variable to the template
          });
        } else {
          res.status(404).send("Post not found");
        }
      }
    }
  );
});

app.post("/my-posts/edit/:id", upload.single("img"), (req, res) => {
  const postId = req.params.id;
  const userId = req.session.user.id;
  const title = req.body.title;
  const text = req.body.text;
  const newImg = req.file ? `/uploads/${req.file.filename}` : "";

  console.log("postId:", postId);
  console.log("userId:", userId);

  const sqlSelect = "SELECT img FROM post WHERE id = ? AND (user_id = ? OR ?)";
  db.query(
    sqlSelect,
    [postId, userId, req.session.user.isAdmin],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error updating post");
      } else {
        console.log("SELECT query results:", results); // Add this line to print the query results

        if (results.length > 0) {
          const img = newImg !== "" ? newImg : results[0].img;

          const sqlUpdate =
            "UPDATE post SET title = ?, text = ?, img = ? WHERE id = ? AND (user_id = ? OR ?)";
          db.query(
            sqlUpdate,
            [title, text, img, postId, userId, req.session.user.isAdmin],
            (err, results) => {
              if (err) {
                console.log(err);
                res.status(500).send("Error updating post");
              } else {
                // Check if user is admin and redirect to main page
                if (req.session.user.isAdmin) {
                  res.redirect("/admin-panel");
                } else {
                  res.redirect("/my-posts");
                }
              }
            }
          );
        } else {
          res.status(404).send("Post not found");
        }
      }
    }
  );
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

function checkAdmin(req, res, next) {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).send("Forbidden");
  }
  next();
}

app.get("/admin-panel", checkAdmin, function (req, res) {
  let usersPromise = new Promise((resolve, reject) => {
    db.query("SELECT id, name, email, admin FROM users", (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });

  let postsPromise = new Promise((resolve, reject) => {
    db.query("SELECT id, title, text, user_id FROM post", (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });

  Promise.all([usersPromise, postsPromise])
    .then((results) => {
      res.render("admin_panel", {
        users: results[0],
        posts: results[1],
        isAdmin: req.session.user.isAdmin, // add isAdmin to the object
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error loading admin panel");
    });
});

app.post("/delete-user/:id", checkAdmin, function (req, res) {
  const userId = req.params.id;
  db.query("DELETE FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error deleting user");
    } else {
      res.redirect("/admin-panel");
    }
  });
});

app.get("/edit-post/:id", checkAdmin, function (req, res) {
  const postId = req.params.id;
  db.query("SELECT * FROM post WHERE id = ?", [postId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error loading post data");
    } else if (results.length === 0) {
      // Check if there are no results
      res.status(404).send("Post not found");
    } else {
      res.render(path.join(__dirname, "public/routes/edit-post"), {
        post: results[0],
        isAdmin: req.session.user.isAdmin,
      });
    }
  });
});

app.post("/edit-post/:id", checkAdmin, function (req, res) {
  const postId = req.params.id;
  const { title, text } = req.body;
  db.query(
    "UPDATE post SET title = ?, text = ? WHERE id = ?",
    [title, text, postId],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error updating post data");
      } else {
        res.redirect("/admin-panel");
      }
    }
  );
});

app.get("/delete-post/:id", checkAdmin, function (req, res) {
  const postId = req.params.id;
  db.query("DELETE FROM post WHERE id = ?", [postId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error deleting post");
    } else {
      res.redirect("/admin-panel");
    }
  });
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
