const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const https = require("https");
const nodemailer = require("nodemailer");

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

var transporter = nodemailer.createTransport({
  host: "smtp.rediffmailpro.com", // hostname
  secureConnection: false,
  secure: false,
  tls: {
    ciphers: "SSLv3",
  },
  auth: {
    user: process.env.MAILADDRESS,
    pass: process.env.MAILPASS,
  },
});

router.use("/static", express.static(path.join(__dirname, "../public")));
router.use(express.json());

//GET REQUESTS

router.get("/password-recovery", (req, res) => {
  res
    .status(200)
    .send(
      renderHtml(path.join(__dirname, "../templates/password-recovery.html"))
    );
});

router.get("/forgot-password", (req, res) => {
  res
    .status(200)
    .send(
      renderHtml(path.join(__dirname, "../templates/forgot-password.html"))
    );
});

router.get("/forgot-pass/url", (req, res) => {
  let { email } = req.query;
  var mailOptions = {
    from: process.env.MAILADDRESS,
    to: email,
    subject: "Sending using Node.js",
    html: "<h1>hoohaa</h1>That was eafefesy!",
  };

  pool.query(
    "SELECT user_id FROM users WHERE email=$1",
    [email],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        if (results.rows[0].user_id) {
          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.log(err);
            } else {
              `Password recovery Email sent to ${email} : ${info.response}`;
            }
          });
        } else {
          pool.query(
            "SELECT restaurant_id FROM restaurants WHERE email=$1",
            [email],
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
                if (results.rows[0].restaurant_id) {
                  transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log(
                        `Password recovery Email sent to ${email} : ${info.response}`
                      );
                    }
                  });
                }
              }
            }
          );
        }
      }
    }
  );

  res
    .status(200)
    .send(
      renderHtml(path.join(__dirname, "../templates/forgot-password.html"))
    );
});

module.exports = router;
