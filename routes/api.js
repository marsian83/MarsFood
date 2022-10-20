const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const https = require("https");

const session = require("express-session");

const { pool } = require("../dbconfig");

const {
  insertComponents,
  renderHtml,
  redirectHome,
  redirectLogin,
  sha256,
  indexOfNth,
} = require("../functions");

router.use("/static", express.static(path.join(__dirname, "../public")));
router.use(express.json());

// AUTHENTICATE API KEY
router.use((req, res, next) => {
  apiKey = req.query.apiKey;
  pool.query("SELECT * FROM apikeys WHERE key=$1", [apiKey], (err, results) => {
    if (err) {
      console.log(err);
    } else {
      if (results.rows.length > 0) {
        next();
      } else {
        res.status(401).send({ error: "Invalid Api Key" });
      }
    }
  });
});

// GET REQUESTS

// users
router.get("/users/id/:id", (req, res) => {
  pool.query(
    "SELECT user_id,name,email FROM users WHERE user_id=$1",
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(results.rows[0]);
      }
    }
  );
});

router.get("/users/id/:id/orders", (req, res) => {
  pool.query(
    "SELECT * FROM orders WHERE user_id=$1 ORDER BY order_time",
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(results.rows);
      }
    }
  );
});

router.get("/orders/quantity/total", (req, res) => {
  pool.query("SELECT SUM(quantity) FROM orders", (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results.rows[0]);
    }
  });
});

router.get("/addresses/id/:id", (req, res) => {
  pool.query(
    "SELECT * FROM addresses WHERE address_id=$1",
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(results.rows[0]);
      }
    }
  );
});

// restaurants
router.get("/restaurants", (req, res) => {
  pool.query(
    "SELECT restaurant_id,name,address FROM restaurants",
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.send(results.rows);
      }
    }
  );
});

router.get("/restaurants/id/:id", (req, res) => {
  const { id } = req.params;
  pool.query(
    "SELECT restaurant_id,name,address,email FROM restaurants WHERE restaurant_id=$1",
    [id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.send(results.rows[0]);
      }
    }
  );
});

router.get("/restaurants/count", (req, res) => {
  pool.query("SELECT COUNT(*) FROM restaurants", (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results.rows[0]);
    }
  });
});

router.get("/restaurants/id/:id/dishes", (req, res) => {
  pool.query(
    "SELECT * FROM (SELECT * FROM sells WHERE restaurant_id=$1) AS s NATURAL JOIN dishes",
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.send(results.rows);
      }
    }
  );
});

router.get("/restaurants/id/:id/dishes/top", (req, res) => {
  pool.query(
    "select s.dish_id from sells as s natural join reviewof as r natural join dishreviews as k where restaurant_id =$1 group by s.dish_id order by avg(k.rating) desc;",
    [req.params.id],
    async (err, results) => {
      if (err) {
        console.log(err);
      } else {
        if (results.rows.length > 0) {
          pool.query(
            "SELECT * FROM dishes WHERE dish_id=$1",
            [results.rows[0].dish_id],
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
                res.send(results.rows[0]);
              }
            }
          );
        } else {
          pool.query(
            "SELECT * FROM (SELECT * FROM sells WHERE restaurant_id=$1) AS s NATURAL JOIN dishes",
            [req.params.id],
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
                results.rows.forEach((d) => {
                  if (d.image_url) {
                    return d;
                  }
                });
                res.send(results.rows[0]);
              }
            }
          );
        }
      }
    }
  );
});

router.get("/restaurants/ratings", (req, res) => {
  pool.query(
    "SELECT AVG(rating) AS restaurant_rating,restaurant_id FROM dishes NATURAL JOIN reviewof NATURAL JOIN dishreviews NATURAL JOIN sells GROUP BY restaurant_id ORDER BY restaurant_rating DESC;",
    [],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(results.rows);
      }
    }
  );
});

router.get("/restaurants/id/:id/rating", (req, res) => {
  pool.query(
    "SELECT AVG(rating) AS restaurant_rating FROM dishes NATURAL JOIN reviewof NATURAL JOIN dishreviews NATURAL JOIN sells WHERE restaurant_id=$1;",
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(results.rows[0]);
      }
    }
  );
});

router.get("/restaurants/id/:id/orders", (req, res) => {
  pool.query(
    "SELECT * FROM sells NATURAL JOIN orders WHERE restaurant_id=$1 ORDER BY order_time",
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(results.rows);
      }
    }
  );
});

router.get("/restaurants/id/:id/orders/count", (req, res) => {
  pool.query(
    "SELECT COUNT(restaurant_id) FROM sells NATURAL JOIN orders WHERE restaurant_id=$1",
    [req.params.id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(results.rows[0]);
      }
    }
  );
});

// /dishes
router.get("/dishes", (req, res) => {
  pool.query("SELECT * FROM dishes natural join sells", (err, results) => {
    if (err) {
      console.log(err);
    } else {
      res.send(results.rows);
    }
  });
});

router.get("/dishes/id/:id", (req, res) => {
  const { id } = req.params;
  pool.query(
    "SELECT * FROM dishes NATURAL JOIN sells WHERE dish_id = $1",
    [id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.send(results.rows[0]);
      }
    }
  );
});

router.get("/dishes/id/:id/reviews", (req, res) => {
  const { id } = req.params;
  pool.query(
    "SELECT user_id,review_id,rating,content FROM reviews NATURAL JOIN dishreviews NATURAL JOIN reviewof WHERE dish_id=$1",
    [id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.send(results.rows);
      }
    }
  );
});

router.get("/dishes/ratings", (req, res) => {
  pool.query(
    "SELECT d.dish_id,COUNT(r.rating) AS ratings,AVG(r.rating) AS rating FROM dishreviews AS r NATURAL JOIN reviewof NATURAL JOIN dishes as d group by dish_id",
    [],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.send(results.rows);
      }
    }
  );
});

router.get("/dishes/id/:id/rating", (req, res) => {
  const { id } = req.params;
  pool.query(
    "select count(r.rating),avg(r.rating) from dishreviews as r natural join reviewof natural join dishes as d where dish_id = $1;",
    [id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.send(results.rows[0]);
      }
    }
  );
});

router.get("/dishes/id/:id/sold", (req, res) => {
  const { id } = req.params;
  pool.query(
    "SELECT SUM(quantity) FROM orders WHERE dish_id = $1;",
    [id],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.send(results.rows[0]);
      }
    }
  );
});

router.get("/dishes/id/:id/orders/user/:user", (req, res) => {
  pool.query(
    "SELECT order_id FROM orders WHERE dish_id=$1 and user_id=$2",
    [req.params.id, req.params.user],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(results.rows);
      }
    }
  );
});

//others
router.get("/location", async (req, res) => {
  const { latitude, longitude } = req.query;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`;
  https
    .get(url, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        data = JSON.parse(data);
        address = data ? (data.results[0] ? data.results[0].formatted : "") : "";
        let splitAt = indexOfNth(
          address,
          ",",
          Math.ceil(("str1,str2,str3,str4".match(/,/g) || []).length / 2)
        );
        let results = {
          line1: address.slice(0, splitAt),
          line2:
            address.slice(splitAt + 1, -1) + address.charAt(address.length - 1),
        };
        res.status(200).send(results);
      });
    })
    .on("error", (err) => {
      console.log(err.message);
    });
});


router.get("/search/dishes/", (req, res) => {
  const queryRegex = req.query.keyword.replace(/.{1}/g, '$&%');
  pool.query(
    "SELECT dish_id,name,image_url FROM dishes WHERE LOWER(name) LIKE LOWER($1)",
    ['%'+queryRegex],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send(results.rows);
      }
    }
  );
});

module.exports = router;
