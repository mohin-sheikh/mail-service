var express = require('express');
var router = express.Router();
const schedule = require('node-schedule');
const nodemailer = require('nodemailer'); // to send mail


router.post('/mail', async function (req, res) {
  const to = req.body.to;
  const subject = req.body.subject;
  const html = req.body.html;
  let mailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  let mailDetails = {
    from: "noreply@ventures.in",
    to: to,
    subject: subject,
    html: html,
  };
  await mailTransporter.sendMail(mailDetails, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send("Error While Sending Mail!")
    } else {
      console.log('Email sent successfully');
      return res.send(`e-mail sent successfully to ${to}.`)
    }
  });
});

router.post('/mail/time-set', async function (req, res) {
  const to = req.body.to;
  const subject = req.body.subject;
  const html = req.body.html;
  let mailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  let mailDetails = {
    from: "noreply@ventures.in",
    to: to,
    subject: subject,
    html: html,
  };

  const job = schedule.scheduleJob('*/1 * * * *', async function () {
    console.log('The world is going to end today.');
    await mailTransporter.sendMail(mailDetails, function (err) {
      if (err) {
        console.log(err);
        // return res.status(500).send("Error While Sending Mail!")
      } else {
        console.log('Email sent successfully');
      }
    });
    job.cancel();
  });
  return res.send(`e-mail sent successfully to ${to}.`)
});


router.post('/mail/attachment', async (req, res) => {
  let from = "noreply@ventures.in";
  let to = req.body.to;
  let subject = req.body.subject;
  let html = req.body.html;
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
        to,
        subject,
        html,
        attachments,
      };
    } else {
      mailOptions = {
        to,
        subject,
        html,
      };
    }
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, async (error) => {
        if (error) {
          console.log(error);
        } else {
          return res.send(`e-mail sent successfully to ${to}.`)
        }
      });
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

module.exports = router;