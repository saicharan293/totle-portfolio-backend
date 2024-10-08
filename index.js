const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const multer = require("multer");
const app = express();
const sqlConnect = require("./db/mysql_tp");

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2
const OAuth2_client = new OAuth2(process.env.CLIENT_ID,process.env.CLIENT_SECRET)
OAuth2_client.setCredentials({refresh_token: process.env.REFRESH_TOKEN })

require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.send("hey");
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: 'OAuth2',
    user: process.env.ADMIN_EMAIL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken:null,
  },
});


app.post("/feedback/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Set up email data
  try {
    const { token: accessToken} = await OAuth2_client.getAccessToken()
    transporter.options.auth.accessToken = accessToken;

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: [email, process.env.ADMIN_EMAIL],
      replyTo: process.env.ADMIN_EMAIL,
      subject: `Contact Form Submission from ${name}`,
      text: message,
      html: `<p>${message}</p>`,
    };

    await transporter.sendMail(mailOptions);
    await sqlConnect.query(
      "INSERT INTO CONTACT_US (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );

    res.status(200).send("Email sent and data saved.");
  } catch (error) {
    console.error("Error sending email or saving data:", error);
    res.status(500).send("Error sending email or saving data.");
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/career/apply", upload.single("resume"), async (req, res) => {
  const { name, email, reason } = req.body;
  const resume = req.file;
  if (!resume) {
    return res.status(400).json({ message: "No file is uploaded" });
  }

  const mailOptions = {
    from: email,
    to: process.env.ADMIN_EMAIL,
    replyTo: [email, process.env.ADMIN_EMAIL],
    subject: "Application for Developer role",
    text: `A new application has been submitted by ${name}.\n\nEmail: ${email}\nReason for applying:\n${reason}`,
    attachments: [
      {
        filename: resume.originalname,
        content: resume.buffer,
      },
    ],
  };

  try {
    const { token: accessToken } = await OAuth2_client.getAccessToken();
    transporter.options.auth.accessToken = accessToken;
    await transporter.sendMail(mailOptions);
    await sqlConnect.query(
      "INSERT INTO CAREERS(name, email, reason) VALUES (?, ?, ?)",
      [name, email, reason]
    );
    res.status(200).send("Application sent successfully.");
  } catch (error) {
    console.error("Error submitting application", error);
    res.status(500).send("Error submitting application.");
  }
});
// const PORT = 4000;
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`server shuru ${PORT}`));
