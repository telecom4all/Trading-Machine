const data = require('../modules/config')
const config_secret = require('../modules/config_secret')
const logger = require('../modules/logger')

const nodemailer = require('nodemailer');

async function sendEmail(message, sujet) {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config_secret.twoFA.user_gmail,
          pass: config_secret.twoFA.pass_gmail_app
        }
      });
      
      const mailOptions = {
        from: config_secret.twoFA.user_gmail,
        to: config_secret.twoFA.mail_destinataire,
        subject: sujet,
        text: message
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
       console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          // do something useful
        }
      });

}

module.exports = { sendEmail };