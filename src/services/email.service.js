require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});



// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to Backend Ledger!';
  const text = `Hi ${name},\n\nThank you for registering with Backend Ledger! We're excited to have you on board.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hi ${name},</p><p>Thank you for registering with Backend Ledger! We're excited to have you on board.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
  
  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name,amount, toAccount) {
  const subject = "transaction is successfull";
  const text = `Hi ${name},\n\nYour transaction of amount ${amount} to account ${toAccount} was successful.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hi ${name},</p><p>Your transaction of amount ${amount} to account ${toAccount} was successful.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "transaction failed";
  const text = `Hi ${name},\n\nUnfortunately, your transaction of amount ${amount} to account ${toAccount} has failed. Please try again later or contact support for assistance.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hi ${name},</p><p>Unfortunately, your transaction of amount ${amount} to account ${toAccount} has failed. Please try again later or contact support for assistance.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}
module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail
};