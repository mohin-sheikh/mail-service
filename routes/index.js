var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer'); // to send mail

/* GET home page. */
router.post('/', async function (req, res) {
  const to = req.body.to;
  const subject = req.body.subject;
  const html = req.body.html;
  let mailTransporter = nodemailer.createTransport({
    host: "sg2plcpnl0109.prod.sin2.secureserver.net",
    auth: {
      user: "mohin.s@broadstairs.in",
      pass: "mohin@123"
    }
  });
  let mailDetails = {
    from: "noreply@broadstairs.in",
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

module.exports = router;