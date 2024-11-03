const nodemailer = require("nodemailer");

module.exports.sendMail = (email, otp) => {
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
    subject: "Mã xác thực OTP",
    html: `
      Mã OTP xác minh: <b>${otp}</b>. Lưu ý không để lộ. Thời hạn 3 phút.
    `,
    // template: "mail",
    // context: {
    //   otp,
    // },
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log();
    }
  });
};
