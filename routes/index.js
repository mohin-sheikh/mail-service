var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer'); // to send mail

/* GET home page. */
router.post('/', async function (req, res) {
  const to = req.body.to;
  const subject = req.body.subject;
  const name = req.body.name;
  const otp = req.body.otp;
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
    text: `Hey ${name} this is your OTP ${otp}. Don't share this otp with anyone.`
  };
  await mailTransporter.sendMail(mailDetails, function (err) {
    if (err) {
      console.log(err);
      return res.status(500).send("Error While Sending Mail!")
    } else {
      console.log('Email sent successfully');
      return res.send("Email sent successfully")
    }
  });
});

module.exports = router;