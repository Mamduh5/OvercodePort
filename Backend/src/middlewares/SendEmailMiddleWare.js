const nodemailer = require('nodemailer');
const config = require('config');
const { throwError } = require('../libs/errorService.js')

const sendEmail = () => async (ctx, next) => {
  try {
    const Email = config.get('SenderEmail.email');
    const Host = config.get('SenderEmail.host');
    const Port = config.get('SenderEmail.port');
    const User = config.get('SenderEmail.user');
    const Pass = config.get('SenderEmail.pass');

    const ReceiverEmail = ctx.sendingEmail.to;
    const Subject = ctx.sendingEmail.subject;
    const emailBody = ctx.sendingEmail.body;

    const transporter = nodemailer.createTransport({
      host: Host,
      port: Port,
      secure: false, // Use TLS
      auth: {
        user: User, // Sender's email
        pass: Pass, // Sender's app-specific password
      },
    });

    // Generate the HTML content dynamically


    const mailOptions = {
      from: Email, // Sender's name and email
      to: ReceiverEmail,    // Recipient email
      subject: Subject,     // Email subject
      html: emailBody,      // Rich-text email content
    };

    const info = await transporter.sendMail(mailOptions);
    ctx.result = info; 

    return next();
  } catch (error) {
    throw throwError(error, 'sendEmail');
  }
};




module.exports = {
  sendEmail,
  }