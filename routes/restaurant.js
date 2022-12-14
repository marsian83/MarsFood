const express = require("express");
const path = require("path");
const router = express.Router();
const fileupload = require("express-fileupload");
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

const { cloudinary } = require("../cloudinaryconfig");

router.use("/static", express.static(path.join(__dirname, "../public")));
router.use(fileupload({ useTempFiles: true }));
//redirecting user
router.use("", (req, res, next) => {
  if (req.session.userId) {
    res.redirect("/user/home");
  } else {
    if (req.session.restaurantId || req.path == "/auth") {
      next();
    } else {
      res.redirect("/restaurant/auth");
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

router.get("/auth", redirectHome, (req, res) => {
  pool.query(
    "SELECT (SELECT COUNT(restaurant_id) FROM restaurants) AS total_restaurants,(SELECT SUM(quantity) FROM orders) AS dishes_sold;",
    [],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(
          renderHtml(
            path.join(__dirname, "../templates/restaurant-auth.html"),
            {
              totalRestaurants: results.rows[0].total_restaurants,
              dishesSold: results.rows[0].dishes_sold,
            }
          )
        );
      }
    }
  );
});

router.get("/home", redirectLogin, (req, res) => {
  res.status(200).send(
    renderHtml(path.join(__dirname, "../templates/restaurant-home.html"), {
      restaurantId: req.app.locals.restaurant.restaurant_id,
    })
  );
});

router.get("/dish/new", redirectLogin, (req, res) => {
  res.status(200).send(
    renderHtml(path.join(__dirname, "../templates/new-dish.html"), {
      restaurantId: req.app.locals.restaurant.restaurant_id,
    })
  );
});

router.get("/orders", redirectLogin, (req, res) => {
  res.status(200).send(
    renderHtml(path.join(__dirname, "../templates/orders.html"), {
      restaurantId: req.app.locals.restaurant.restaurant_id,
    })
  );
});

// POST REQUESTS
router.post("/auth", redirectHome, async (req, res) => {
  let { name, email, address, password, passwordConfirm } = req.body;
  if (passwordConfirm) {
    let errors = []; //1-> Empty Fields 2-> Password Length 3-> Wrong Confirm 4-> Email exists

    if (!(name && email && address && password && passwordConfirm)) {
      errors.push(1);
    }
    if (password.length < 6) {
      errors.push(2);
    }
    if (password != passwordConfirm) {
      errors.push(3);
    }

    if (errors.length > 0) {
      pool.query(
        "SELECT (SELECT COUNT(restaurant_id) FROM restaurants) AS total_restaurants,(SELECT SUM(quantity) FROM orders) AS dishes_sold;",
        [],
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            res.status(200).send(
              renderHtml(
                path.join(__dirname, "../templates/restaurant-auth.html"),
                {
                  errors: errors,
                  switchState: 1,
                  totalRestaurants: results.rows[0].total_restaurants,
                  dishesSold: results.rows[0].dishes_sold,
                }
              )
            );
          }
        }
      );
    } else {
      //Entries Validated
      pool.query(
        "SELECT restaurant_id FROM restaurants WHERE email=$1",
        [email],
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            if (results.rows.length > 0) {
              errors.push(4);
              pool.query(
                "SELECT (SELECT COUNT(restaurant_id) FROM restaurants) AS total_restaurants,(SELECT SUM(quantity) FROM orders) AS dishes_sold;",
                [],
                (err, results) => {
                  if (err) {
                    console.log(err);
                  } else {
                    res.status(200).send(
                      renderHtml(
                        path.join(
                          __dirname,
                          "../templates/restaurant-auth.html"
                        ),
                        {
                          errors: errors,
                          switchState: 1,
                          totalRestaurants: results.rows[0].total_restaurants,
                          dishesSold: results.rows[0].dishes_sold,
                        }
                      )
                    );
                  }
                }
              );
            } else {
              pool.query(
                "INSERT INTO restaurants (name,email,address,password) VALUES($1,$2,$3,$4)",
                [name, email, address, sha256(password)],
                (err, results) => {
                  if (err) {
                    console.log(err);
                  } else {
                    pool.query(
                      "SELECT (SELECT COUNT(restaurant_id) FROM restaurants) AS total_restaurants,(SELECT SUM(quantity) FROM orders) AS dishes_sold;",
                      [],
                      (err, results) => {
                        if (err) {
                          console.log(err);
                        } else {
                          res.status(200).send(
                            renderHtml(
                              path.join(
                                __dirname,
                                "../templates/restaurant-auth.html"
                              ),
                              {
                                switchState: 0,
                                loginPrompt: true,
                                totalRestaurants:
                                  results.rows[0].total_restaurants,
                                dishesSold: results.rows[0].dishes_sold,
                              }
                            )
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        }
      );
    }
  } else {
    let errors = [];

    if (!(email && password)) {
      errors.push(1);
    }

    if (errors.length > 0) {
      pool.query(
        "SELECT (SELECT COUNT(restaurant_id) FROM restaurants) AS total_restaurants,(SELECT SUM(quantity) FROM orders) AS dishes_sold;",
        [],
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            res.status(200).send(
              renderHtml(
                path.join(__dirname, "../templates/restaurant-auth.html"),
                {
                  errors: errors,
                  switchState: 0,
                  totalRestaurants: results.rows[0].total_restaurants,
                  dishesSold: results.rows[0].dishes_sold,
                }
              )
            );
          }
        }
      );
    } else {
      //Entries Validated
      pool.query(
        "SELECT * FROM restaurants WHERE email=$1",
        [email],
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            if (results.rows.length > 0) {
              let user = results.rows[0];
              if (sha256(password) === user.password) {
                req.session.restaurantId = user.restaurant_id;
                return res.redirect("/restaurant/home");
              }
            }
            pool.query(
              "SELECT (SELECT COUNT(restaurant_id) FROM restaurants) AS total_restaurants,(SELECT SUM(quantity) FROM orders) AS dishes_sold;",
              [],
              (err, results) => {
                if (err) {
                  console.log(err);
                } else {
                  res.status(200).send(
                    renderHtml(
                      path.join(__dirname, "../templates/restaurant-auth.html"),
                      {
                        errors: 5,
                        switchState: 0,
                        totalRestaurants: results.rows[0].total_restaurants,
                        dishesSold: results.rows[0].dishes_sold,
                      }
                    )
                  );
                }
              }
            );
          }
        }
      );
    }
  }
});

router.post("/dish/new", redirectLogin, async (req, res) => {
  let { name, description, cost, isnonveg } = req.body;
  let image = req.files.thumbnail || null;

  pool.query(
    "INSERT INTO dishes(name,description,cost,nonveg) VALUES($1,$2,$3,$4) RETURNING dish_id",
    [name, description, cost, isnonveg],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        let newId = results.rows[0].dish_id;
        pool.query(
          "INSERT INTO sells(dish_id,restaurant_id) VALUES($1,$2)",
          [newId, req.app.locals.restaurant.restaurant_id],
          (err, results) => {
            if (err) {
              console.log(err);
            } else {
              if (image && image.data) {
                cloudinary.uploader
                  .upload(image.tempFilePath, {
                    folder: "userdata/images/dishes",
                    public_id: `dish${newId}-thumbnail`,
                    format: "jpg",
                  })
                  .then((results) => {
                    let downloadURL = results.url;
                    pool.query(
                      "UPDATE dishes SET image_url=$1 WHERE dish_id=$2",
                      [downloadURL, newId],
                      (err, results) => {
                        if (err) {
                          console.log(err);
                        } else {
                          res.redirect("/restaurant/home");
                        }
                      }
                    );
                  });
              } else {
                res.redirect("/restaurant/home");
              }
            }
          }
        );
      }
    }
  );
});

router.post("/orders/mark", redirectLogin, (req, res) => {
  pool.query(
    "SELECT * FROM orders NATURAL JOIN sells WHERE order_id=$1 AND restaurant_id=$2",
    [req.body.order_id, req.app.locals.restaurant.restaurant_id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        if (results.rows.length > 0) {
          pool.query(
            "UPDATE orders SET completed=1 WHERE order_id=$1",
            [results.rows[0].order_id],
            (err, resuls) => {
              if (err) {
                console.log(err);
              } else {
                return res.redirect("/restaurant/orders");
              }
            }
          );
        }
      }
    }
  );
});

// PUT REQUESTS
router.put("/orders/mark", redirectLogin, (req, res) => {
  pool.query(
    "SELECT * FROM orders NATURAL JOIN sells WHERE order_id=$1 AND restaurant_id=$2",
    [req.body.order_id, req.app.locals.restaurant.restaurant_id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        if (results.rows.length > 0) {
          pool.query(
            "UPDATE orders SET completed=1 WHERE order_id=$1",
            [results.rows[0].order_id],
            (err, resuls) => {
              if (err) {
                console.log(err);
              } else {
                return res.redirect("/restaurant/orders");
              }
            }
          );
        }
      }
    }
  );
  res.redirect("/");
});

router.put("/password/change", redirectLogin, (req, res) => {
  const { currPass, newPass } = req.query;
  pool.query(
    "SELECT * FROM restaurants WHERE restaurant_id=$1 AND password=$2",
    [req.session.restaurantId, sha256(currPass)],
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
            "UPDATE restaurants SET password=$1 WHERE restaurant_id=$2",
            [sha256(newPass), req.session.restaurantId],
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

//DELETE REQUESTS
router.delete("/dish/delete", redirectLogin, (req, res) => {
  pool.query(
    "DELETE FROM sells WHERE dish_id=$1 AND restaurant_id=$2 RETURNING dish_id",
    [req.query.dish_id, req.app.locals.restaurant.restaurant_id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        if (results.rows.length > 0) {
          pool.query(
            "DELETE FROM dishes WHERE dish_id=$1 RETURNING dish_id,image_url",
            [results.rows[0].dish_id],
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
                cloudinary.uploader.destroy(
                  `userdata/images/dishes/dish${results.rows[0].dish_id}-thumbnail`,
                  {},
                  (err, results) => {
                    if (err) {
                      console.log(err);
                    } else {
                      return res.redirect("/restaurant/home");
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
});

// OTHER REQUESTS
router.all("/logout", redirectLogin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/user/home");
    }
    res.clearCookie(process.env.SESSION_NAME);
    res.redirect("/restaurant/auth");
  });
});

module.exports = router;
