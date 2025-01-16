const nodemailer = require("nodemailer");

module.exports.answersContact = (email, answers) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: email,
    from: '"Support Team"<support@example.com>',
    subject: "Product Management For Ecommerce Services",
    html: answers,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log();
    }
  });
};
