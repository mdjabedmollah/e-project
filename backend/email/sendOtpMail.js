import nodemailer from "nodemailer";
import dotecnv from "dotenv";

dotecnv.config();

export const sendOtpEmail = async(otp, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailConfigurations = {
    from: process.env.MAIL_USER,

    to: email,

    subject: "password Reset OTP",

    // This would be the text of email body
   html:`<P>Your OTP for password reset is : <b>${otp}</b></P>`
  };
  transporter.sendMail(mailConfigurations, function (error, info) {
    if (error) throw Error(error);
    console.log("OTP  Sent Successfully");
    console.log(info);
  });
};

