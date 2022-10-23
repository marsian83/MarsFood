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
const { env } = require("process");

router.use("/static", express.static(path.join(__dirname, "../public")));
router.use(express.json());

const sendMail = async (mail) => {
  //   let testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.rediffmail.com",
    port: 25,
    secureConnection: false,
    secure: false,
    tls: {
        rejectUnauthorized: false,
        ciphers: "SSLv3",
    },
    auth: {
      user: process.env.MAILADDRESS,
      pass: process.env.MAILPASS,
    },
  });
  var mailOptions = {
    from: process.env.MAILADDRESS,
    to: mail,
    subject: "Kisi na kisi din ye mail jaega",
    html: "<h1>yayayayayayayayayy</h1> <p>Achha Acchaa</p>",
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      `Password recovery Email sent to ${mail} : ${info.response}`;
    }
  });
};

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

  pool.query(
    "SELECT user_id FROM users WHERE email=$1",
    [email],
    async (err, results) => {
      if (err) {
        console.log(err);
      } else {
        if (results.rows[0] && results.rows[0].user_id) {
          sendMail(email);
        } else {
          pool.query(
            "SELECT restaurant_id FROM restaurants WHERE email=$1",
            [email],
            async (err, results) => {
              if (err) {
                console.log(err);
              } else {
                if (results.rows[0] && results.rows[0].restaurant_id) {
                  sendMail();
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
