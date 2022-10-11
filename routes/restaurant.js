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

router.use("/static", express.static(path.join(__dirname, "../public")));
router.use(fileupload());
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

router.get("/auth", (req, res) => {
  res
    .status(200)
    .send(
      renderHtml(path.join(__dirname, "../templates/restaurant-auth.html"))
    );
});

router.get("/home", (req, res) => {
  res.status(200).send(
    renderHtml(path.join(__dirname, "../templates/restaurant-home.html"), {
      restaurantId: req.app.locals.restaurant.restaurant_id,
    })
  );
});

router.get("/dish/new", (req, res) => {
  res.status(200).send(
    renderHtml(path.join(__dirname, "../templates/new-dish.html"), {
      restaurantId: req.app.locals.restaurant.restaurant_id,
    })
  );
});

router.get("/orders", (req, res) => {
  return res.redirect("/restaurant/logout");
  res
    .status(200)
    .send(renderHtml(path.join(__dirname, "../templates/dashboard.html")));
});

// POST REQUESTS
router.post("/auth", async (req, res) => {
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
      res.send(
        renderHtml(path.join(__dirname, "../templates/restaurant-auth.html"), {
          errors: errors,
          switchState: 1,
        })
      );
    } else {
      //Entries Validated
      pool.query(
        "SELECT restaurant_id FROM restaurants WHERE email=$1",
        [email],
        (err, results) => {
          if (err) {
            throw err;
          }
          if (results.rows.length > 0) {
            errors.push(4);
            res.send(
              renderHtml(
                path.join(__dirname, "../templates/restaurant-auth.html"),
                {
                  errors: errors,
                  switchState: 1,
                }
              )
            );
          } else {
            pool.query(
              "INSERT INTO restaurants (name,email,address,password) VALUES($1,$2,$3,$4)",
              [name, email, address, sha256(password)],
              (err, results) => {
                if (err) {
                  throw err;
                }
                res.send(
                  renderHtml(
                    path.join(__dirname, "../templates/restaurant-auth.html"),
                    {
                      switchState: 0,
                      loginPrompt: true,
                    }
                  )
                );
              }
            );
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
      res.send(
        renderHtml(path.join(__dirname, "../templates/restaurant-auth.html"), {
          errors: errors,
          switchState: 0,
        })
      );
    } else {
      //Entries Validated
      pool.query(
        "SELECT * FROM restaurants WHERE email=$1",
        [email],
        (err, results) => {
          if (err) {
            throw err;
          }
          if (results.rows.length > 0) {
            let user = results.rows[0];
            if (sha256(password) === user.password) {
              req.session.restaurantId = user.restaurant_id;
              return res.redirect("/restaurant/home");
            }
          }
          res.send(
            renderHtml(
              path.join(__dirname, "../templates/restaurant-auth.html"),
              {
                errors: 5,
                switchState: 0,
              }
            )
          );
        }
      );
    }
  }
});

router.post("/dish/new", async (req, res) => {
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
        if (image) {
          fs.closeSync(
            fs.openSync(
              path.join(
                USERDATA_ABSOLUTE_LOCATION,
                "/images/dishes/",
                `${newId}.jpg`
              ),
              "w"
            )
          );
          image.mv(
            path.join(
              USERDATA_ABSOLUTE_LOCATION,
              "/images/dishes/",
              `${newId}.jpg`
            ),
            (err) => {
              if (err) {
                console.log(err);
              }
            }
          );
          pool.query(
            "UPDATE dishes SET image_url=$1 WHERE dish_id=$2",
            [`/images/dishes/${newId}.jpg`, newId],
            (err, results) => {
              if (err) {
                console.log(err);
              }
            }
          );
        }
        pool.query(
          "INSERT INTO sells(dish_id,restaurant_id) VALUES($1,$2)",
          [newId, req.app.locals.restaurant.restaurant_id],
          (err, results) => {
            if (err) {
              throw err;
            }
            res.redirect("/restaurant/home");
          }
        );
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
