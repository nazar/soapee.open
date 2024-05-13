import config from 'config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: config.get('email.address'),
  port: config.get('email.port'),
  secure: false,
  ignoreTLS: true
});

// eslint-disable-next-line import/prefer-default-export
export function sendEmail({ to, subject, body }) {
  return transporter.sendMail({
    to,
    subject,
    from: 'Soapee <noreply@soapee.com>',
    text: body
  });
}
