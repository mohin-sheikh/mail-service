var express = require('express');
var router = express.Router();
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const axios = require("axios").default;
const { v4: uuid4 } = require('uuid'); // uuid.v4() gives uuids


router.post('/mail', async function (req, res) {
  const to = req.body.to;
  const subject = req.body.subject;
  const html = req.body.html;
  let mailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  let mailDetails = {
    from: 'TEST USER <noreply@ventures.com>',
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

router.post('/mail/schedule', async function (req, res) {
  const to = req.body.to;
  const subject = req.body.subject;
  const html = req.body.html;
  let mailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
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
  let minute = req.body.minute === undefined ? "*" : req.body.minute;
  let hour = req.body.hour === undefined ? "*" : req.body.hour;
  let day = req.body.day === undefined ? "*" : req.body.day;
  let month = req.body.month === undefined ? "*" : req.body.month;
  const job = schedule.scheduleJob(`${minute} ${hour} ${day} ${month} *`, async function () {
    await mailTransporter.sendMail(mailDetails, function (err) {
      if (err) {
        console.log(err);
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
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
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


router.post('/text-message', async (req, res) => {
  try {
    const notif = {
      type: req.body.type,
      body: {
        to: req.body.to,
        payload: {
          text: req.body.text,
        },
      },
    };
    const url = `${process.env.NOTIFICATION_PIPELINE_URL}/jobs/${notif.type}`;
    return await axios({
      method: 'post',
      url,
      data: notif.body,
      headers: {
        'x-notif-auth': process.env.NOTIFICATION_PIPELINE_TOKEN,
        'x-notif-request-id': uuid4(),
      },
    })
      .then(() => {
        return res.send("Success")
      })
      .catch((err) => {
        console.log(err.message);
        return res.send(err);
      })
  } catch (err) {
    console.log(err);
    return null;
  }
});

module.exports = router;