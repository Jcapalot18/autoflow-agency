'use strict';

const nodemailer = require('nodemailer');

let _transporter;

function getTransporter() {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return _transporter;
}

async function sendEmail({ to, subject, html }) {
  const from = `"${process.env.SENDER_NAME || 'Jason @ AutoFlow'}" <${process.env.SMTP_USER}>`;
  const info = await getTransporter().sendMail({
    from,
    to,
    subject,
    html,
    replyTo: process.env.REPLY_TO || process.env.SMTP_USER,
  });
  return info;
}

module.exports = { sendEmail };
