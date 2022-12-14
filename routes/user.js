const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");

const session = require("express-session");

const { pool } = require("../dbconfig");

const {
  insertComponents,
  renderHtml,
  redirectHome,
  redirectLogin,
  sha256,
} = require("../functions");

router.use("/static", express.static(path.join(__dirname, "../public")));
//redirecting user
router.use("", (req, res, next) => {
  if (req.session.restaurantId) {
    res.redirect("/restaurant/home");
  } else {
    if (req.session.userId || req.path == "/login" || req.path == "/signup") {
      next();
    } else {
      res.redirect("/user/login");
    }
  }
});

// GET REQUESTS
router.get("/", (req, res) => {
  const { userId, restaurantId } = req.session;
  res.redirect(
    userId
      ? "/user/home"
      : restaurantId
      ? "/restaurant/home"
      : "/restaurant/auth"
  );
});

router.get("/signup", redirectHome, (req, res) => {
  res
    .status(200)
    .send(renderHtml(path.join(__dirname, "../templates/signup.html")));
});

router.get("/login", redirectHome, (req, res) => {
  res
    .status(200)
    .send(renderHtml(path.join(__dirname, "../templates/login.html")));
});

router.get("/home", redirectLogin, (req, res) => {
  res.status(200).send(
    renderHtml(path.join(__dirname, "../templates/home.html"), {
      username: req.app.locals.user.name || "Login",
    })
  );
});

router.get("/search", redirectLogin, (req, res) => {
  res.status(200).send(
    renderHtml(path.join(__dirname, "../templates/search.html"), {
      username: req.app.locals.user.name || "Login",
      currentUserId: req.session.userId,
    })
  );
});

router.get("/dish/:id", redirectLogin, (req, res) => {
  res.status(200).send(
    renderHtml(path.join(__dirname, "../templates/dish.html"), {
      username: req.app.locals.user.name || "Login",
      dish_id: req.params.id,
      currentUserId: req.session.userId,
    })
  );
});

router.get("/restaurant/:id", redirectLogin, (req, res) => {
  res.status(200).send(
    renderHtml(path.join(__dirname, "../templates/restaurant.html"), {
      username: req.app.locals.user.name || "Login",
      restaurant_id: req.params.id,
      currentUserId: req.session.userId,
    })
  );
});

router.get("/cart/data", redirectLogin, (req, res) => {
  cartData = req.session.cart;
  res.status(200).send(cartData);
});

router.get("/cart", redirectLogin, async (req, res) => {
  res.status(200).send(
    renderHtml(path.join(__dirname, "../templates/cart.html"), {
      username: req.app.locals.user.name || "Login",
      userid: req.session.userId,
    })
  );
});

router.get("/dashboard", redirectLogin, (req, res) => {
  res.status(200).send(
    renderHtml(path.join(__dirname, "../templates/dashboard.html"), {
      username: req.app.locals.user.name || "Login",
      userid: req.session.userId,
    })
  );
});

router.get("/cart/restaurant", redirectLogin, (req, res) => {
  if (!req.session.cart.length) {
    req.session.cartRestaurant = null;
  }
  res.status(200).send({ restaurant_id: req.session.cartRestaurant });
});

router.get("/confirmation", redirectLogin, (req, res) => {
  res
    .status(200)
    .send(
      renderHtml(path.join(__dirname, "../templates/confirmation.html"), {})
    );
});

// POST REQUESTS
router.post("/signup", redirectHome, async (req, res) => {
  let { name, email, password, passwordConfirm } = req.body;

  let errors = []; //1-> Empty Fields 2-> Password Length 3-> Wrong Confirm 4-> Email exists

  if (!(name && email && password && passwordConfirm)) {
    errors.push(1);
  }
  if (password.length < 6) {
    errors.push(2);
  }
  if (password != passwordConfirm) {
    errors.push(3);
  }

  if (errors.length > 0) {
    res.status(400).send(
      renderHtml(path.join(__dirname, "../templates/signup.html"), {
        errors: errors,
      })
    );
  } else {
    //Entries Validated
    pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email.toLowerCase()],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          if (results.rows.length > 0) {
            errors.push(4);
            res.status(400).send(
              renderHtml(path.join(__dirname, "../templates/signup.html"), {
                errors: errors,
              })
            );
          } else {
            pool.query(
              "INSERT INTO users (name,email,password) VALUES($1,$2,$3) RETURNING user_id",
              [name, email.toLowerCase(), sha256(password)],
              (err, results) => {
                if (err) {
                  console.log(err);
                } else {
                  res.redirect("/user/login");
                }
              }
            );
          }
        }
      }
    );
  }
});

router.post("/login", redirectHome, (req, res) => {
  let { email, password } = req.body;
  let errors = [];

  if (!(email && password)) {
    errors.push(1);
  }

  if (errors.length > 0) {
    res.status(400).send(
      renderHtml(path.join(__dirname, "../templates/login.html"), {
        errors: errors,
      })
    );
  } else {
    //Entries Validated
    pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email.toLowerCase()],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          if (results.rows.length > 0) {
            let user = results.rows[0];
            if (sha256(password) === user.password) {
              req.session.userId = user.user_id;
              req.session.cart = [];
              return res.redirect("/user/home");
            }
          }
          res.status(400).send(
            renderHtml(path.join(__dirname, "../templates/login.html"), {
              errors: 2,
            })
          );
        }
      }
    );
  }
});

router.post("/cart/buy", redirectLogin, (req, res) => {
  if (req.session.userId) {
    let { name, line1, line2, mobile } = req.body;
    pool.query(
      "INSERT INTO addresses(name,user_id,line1,line2,mobile) VALUES($1,$2,$3,$4,$5) RETURNING address_id",
      [name, req.session.userId, line1, line2, Number(mobile)],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          var address_id = results.rows[0]["address_id"];
          for (cartItem of req.session.cart) {
            pool.query(
              "INSERT INTO orders(user_id,dish_id,quantity,address_id) values($1,$2,$3,$4)",
              [
                req.session.userId,
                cartItem.dish_id,
                cartItem.quantity,
                address_id,
              ],
              (err, results) => {
                if (err) {
                  console.log(err);
                } else {
                  req.session.cart = [];
                  res.redirect("/user/confirmation");
                }
              }
            );
          }
        }
      }
    );
  } else {
    res.status(401).send({ error: "Authentication Error" });
  }
});

router.post("/dish/review/new", redirectLogin, (req, res) => {
  if (req.session.userId) {
    let { rating, content, dish_id } = req.body;
    pool.query(
      "INSERT INTO dishreviews(rating,content) VALUES($1,$2) RETURNING review_id",
      [rating, content],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          var review_id = results.rows[0]["review_id"];
          pool.query(
            "INSERT INTO reviewof(dish_id,review_id) values($1,$2)",
            [dish_id, review_id],
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
                pool.query(
                  "INSERT INTO reviews(user_id,review_id) values($1,$2)",
                  [req.session.userId, review_id],
                  (err, results) => {
                    if (err) {
                      console.log(err);
                    } else {
                      res.status(200).send({ message: "Success" });
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } else {
    res.status(401).send({ error: "Authentication Error" });
  }
});

router.post("/dish/review/edit", redirectLogin, (req, res) => {
  if (req.session.userId) {
    let { rating, content, dish_id } = req.body;
    pool.query(
      "SELECT review_id FROM reviews NATURAL JOIN reviewof WHERE user_id=$1 AND dish_id=$2",
      [req.session.userId, dish_id],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          pool.query(
            "UPDATE dishreviews SET rating=$1,content=$2 WHERE review_id=$3",
            [rating, content, results.rows[0].review_id || 0],
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
                res.status(200).send({ message: "Success" });
              }
            }
          );
        }
      }
    );
  } else {
    res.status(401).send({ error: "Authentication Error" });
  }
});

// PUT REQUESTS
router.put("/buy/:id", redirectLogin, (req, res) => {
  if (req.session.userId) {
    pool.query(
      "SELECT restaurant_id FROM sells WHERE dish_id=$1",
      [req.params.id],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          dishRestaurantId = results.rows[0].restaurant_id;
          if (!req.session.cartRestaurant) {
            req.session.cartRestaurant = dishRestaurantId;
          }
          if (
            req.session.cartRestaurant == -1 ||
            req.session.cartRestaurant == dishRestaurantId
          ) {
            var foundIndex = req.session.cart.findIndex(
              (x) => x.dish_id == req.params.id
            );
            if (foundIndex == -1) {
              req.session.cart.push({
                dish_id: req.params.id,
                quantity: Number(req.query.quantity),
              });
            } else {
              req.session.cart[foundIndex].quantity += Number(
                req.query.quantity
              );
            }
            res.status(200).send(req.session.cart);
          }
        }
      }
    );
  } else {
    res.status(401).send({ error: "Authentication Error" });
  }
});

router.put("/cart/set/:id", redirectLogin, (req, res) => {
  if (req.session.userId) {
    var dishRestaurantId = -1;
    pool.query(
      "SELECT restaurant_id FROM sells WHERE dish_id=$1",
      [req.params.id],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          dishRestaurantId = results.rows[0].restaurant_id;
          if (!req.session.cartRestaurant) {
            req.session.cartRestaurant = dishRestaurantId;
          }
          if (
            req.session.cartRestaurant == -1 ||
            req.session.cartRestaurant == dishRestaurantId
          ) {
            var foundIndex = req.session.cart.findIndex(
              (x) => x.dish_id == req.params.id
            );
            if (foundIndex == -1) {
              req.session.cart.push({
                dish_id: req.params.id,
                quantity: Number(req.query.quantity),
              });
            } else {
              req.session.cart[foundIndex].quantity = Number(
                req.query.quantity
              );
            }
            res.status(200).send(req.session.cart);
          }
        }
      }
    );
  } else {
    res.status(401).send({ error: "Authentication Error" });
  }
});

router.put("/cart/restaurant/set", redirectLogin, (req, res) => {
  req.session.cartRestaurant = Number(req.query.id);
  res.status(200).send({ message: "Success" });
});

router.put("/password/change", redirectLogin, (req, res) => {
  const { currPass, newPass } = req.query;
  pool.query(
    "SELECT * FROM users WHERE user_id=$1 AND password=$2",
    [req.session.userId, sha256(currPass)],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        if (results.rows.length <= 0) {
          return res
            .status(401)
            .send({ error: "The current password you entered is incorrect" });
        } else {
          pool.query(
            "UPDATE users SET password=$1 WHERE user_id=$2",
            [sha256(newPass), req.session.userId],
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
                return res.status(200).send({ message: "success" });
              }
            }
          );
        }
      }
    }
  );
});

// DELETE REQUESTS
router.delete("/cart/remove/:id", redirectLogin, (req, res) => {
  if (req.session.userId) {
    var foundIndex = req.session.cart.findIndex(
      (x) => x.dish_id == req.params.id
    );
    if (foundIndex == -1) {
      return res.status(400).send({ error: "Dish does not exist in the cart" });
    } else {
      req.session.cart.splice(foundIndex, 1);
    }
    res.status(200).send(req.session.cart);
  } else {
    res.status(401).send({ error: "Authentication Error" });
  }
});

router.delete("/cart/clear", redirectLogin, (req, res) => {
  if (req.session.userId) {
    req.session.cart = [];
    res.status(200).send(req.session.cart);
  } else {
    res.status(401).send({ error: "Authentication Error" });
  }
});

// OTHER REQUESTS
router.all("/logout", redirectLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/user/home");
    }
    res.clearCookie(process.env.SESSION_NAME);
    res.redirect("/user/login");
  });
});

module.exports = router;
