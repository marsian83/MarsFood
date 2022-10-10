const express = require("express");
const path = require("path");
const fs = require("fs");

const session = require("express-session");

const { pool } = require("/dbConfig");

const {
  insertComponents,
  renderHtml,
  redirectHome,
  redirectLogin,
  sha256,
} = require("./functions");

const restaurantRouter = require(path.join(__dirname, "/routes/restaurant.js"));
const userRouter = require(path.join(__dirname, "/routes/user.js"));
const apiRouter = require(path.join(__dirname, "/routes/api.js"));

const app = express();

PORT = process.env.PORT || 8000;
HOSTNAME = process.env.HOSTNAME || "127.0.0.1";
STATIC = "public";
COMPONENTS_LOCATION = "public/components";
UNIVERSAL_CSS_LOCATION = "public/styles/templates/universal.css";
UNIVERSAL_JS_LOCATION = "public/js/templates/universal.js";
USERDATA_RELATIVE_LOCATION = "userdata";
USERDATA_ABSOLUTE_LOCATION = path.join(__dirname, USERDATA_RELATIVE_LOCATION);

// MIDDLEWARE
app.use("/static", express.static(path.join(__dirname, STATIC)));
app.use(
  "/userdata",
  express.static(path.join(__dirname, USERDATA_RELATIVE_LOCATION))
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.use(
  session({
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: Number(process.env.SESSION_LIFETIME),
      sameSite: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use((req, res, next) => {
  let { userId, restaurantId } = req.session;
  if (userId) {
    pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [userId],
      (err, results) => {
        if (err) {
          console.log(err);
        } else {
          if (results.rows.length > 0) {
            app.locals.user = results.rows[0];
          }
          next();
        }
      }
    );
  } else if (restaurantId) {
    pool.query(
      "SELECT * FROM restaurants WHERE restaurant_id=$1",
      [restaurantId],
      (err, results) => {
        if (err) {
          throw err;
        }
        if (results.rows.length > 0) {
          app.locals.restaurant = results.rows[0];
        }
        next();
      }
    );
  } else {
    next();
  }
});

app.use("/restaurant", restaurantRouter);
app.use("/user", userRouter);
app.use("/api", apiRouter);

// GET FUNCTIONS
app.get("/", (req, res) => {
  const { userId } = req.session;
  res.redirect(userId ? "/user/home" : "/user/login");
});

app.get("/help", (req, res) => {
  res
    .status(200)
  .send(
    renderHtml(path.join(__dirname, "./templates/help.html"))
  );
})

app.listen(PORT, HOSTNAME);
