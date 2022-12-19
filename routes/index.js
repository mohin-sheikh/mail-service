const express = require("express");
const router = express.Router();
const schedule = require("node-schedule");
const nodemailer = require("nodemailer");

router.post("/mail", async function (req, res) {
  let mailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  let mailDetails = {
    from: process.env.FROM_EMAIL,
    to: req.body.to,
    subject: req.body.subject,
    html: req.body.text,
  };
  await mailTransporter.sendMail(mailDetails, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send("Error While Sending Mail!");
    } else {
      console.log("Email sent successfully");
      return res.send(`e-mail sent successfully to ${req.body.to}.`);
    }
  });
});

router.post("/mail/schedule", async function (req, res) {
  let mailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailDetails = {
    from: process.env.FROM_EMAIL,
    to: req.body.to,
    subject: req.body.subject,
    html: req.body.text,
  };
  const minute = req.body.minute === undefined ? "*" : req.body.minute;
  const hour = req.body.hour === undefined ? "*" : req.body.hour;
  const day = req.body.day === undefined ? "*" : req.body.day;
  const month = req.body.month === undefined ? "*" : req.body.month;
  const job = schedule.scheduleJob(
    `${minute} ${hour} ${day} ${month} *`,
    async function () {
      await mailTransporter.sendMail(mailDetails, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Email sent successfully");
        }
      });
      job.cancel();
    }
  );
  return res.send(`e-mail sent successfully to ${req.body.to}.`);
});

router.post("/mail/attachment", async (req, res) => {
  const from = process.env.FROM_EMAIL;
  const to = req.body.to;
  const subject = req.body.subject;
  const html = req.body.html;
  let attachments = null;
  let mailOptions = {};
  try {
    if (req.files) {
      let file = req.files.file;
      if (Array.isArray(file)) {
        attachments = file.map((f, i) => {
          return {
            fileName: "Attachment_" + i,
            content: f.data,
            contentType: f.mimetype,
          };
        });
      } else {
        attachments = {
          fileName: "Attachment_",
          content: file.data,
          contentType: file.mimetype,
        };
      }
      mailOptions = {
        from,
        to,
        subject,
        html,
        attachments,
      };
    } else {
      mailOptions = {
        from,
        to,
        subject,
        html,
      };
    }
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await new Promise(() => {
      transporter.sendMail(mailOptions, async error => {
        if (error) {
          console.log(error);
        } else {
          return res.send(`e-mail sent successfully to ${to}.`);
        }
      });
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

module.exports = router;
