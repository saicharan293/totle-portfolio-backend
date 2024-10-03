const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const app = express();
const sqlConnect = require('./db/mysql_tp');
require('dotenv').config();


app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.send("hey");
});

app.post("/feedback/contact",async (req, res) => {
    
  const { name, email, message } = req.body;

  // Set up nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' service
    auth: {
      user: process.env.ADMIN_EMAIL, // your Gmail email
      pass: process.env.ADMIN_PASSWORD, // your app password
    },
  });

  // Set up email data
  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: email, // Your email
    replyTo: process.env.ADMIN_EMAIL,
    subject: `Contact Form Submission from ${name}`,
    text: message,
    html: `<p>${message}</p>`,
  };

  try {
      await transporter.sendMail(mailOptions);
      const inputData = await sqlConnect.query(
        "INSERT INTO CONTACT_US (name, email, message) VALUES (?, ?, ?)",[name,email,message]
      );
      res.status(200).send("Email sent and data saved.");
  } catch (error) {
    console.error("Error sending email or saving data:", error);
    res.status(500).send("Error sending email or saving data.");
  }

});
// const PORT = 4000;
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`server shuru ${PORT}`));
