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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILADDRESS,
    pass: process.env.MAILPASS,
  },
});

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Email sent: " + info.response);
  }
});

router.use("/static", express.static(path.join(__dirname, "../public")));
router.use(express.json());

router.get("/forgot-pass/url", (req, res) => {
  let { email } = req.query;
  var mailOptions = {
    from: process.env.MAILADDRESS,
    to: email,
    subject: "Sending using Node.js",
    text: "That was eafefesy!",
  };

  pool.query(
    "SELECT user_id FROM users WHERE email=$1",
    [email],
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        if (results.rows[0].user_id) {
        }
      }
    }
  );
  res
    .status(200)
    .send(renderHtml(path.join(__dirname, "./templates/forgot-password.html")));
});

module.exports = router;
