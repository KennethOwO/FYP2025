require("dotenv").config();
const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
      },
    });
    const mailOption = {
      from: process.env.EMAIL_USER,
      to: option.email,
      subject: option.subject,
      html: option.message,
    };
    await transporter.sendMail(mailOption, (err, info) => {
      if (err) console.log(err);
    });
  } catch (err) {
    console.log(err);
  }
};

const mailTemplate = (content, buttonUrl, buttonText) => {
  return `<!DOCTYPE html>
    <html>
    <body style="text-align: center; font-family: 'Verdana', serif; color: black;">
      <div
        style="
          max-width: 400px;
          margin: 10px;
          background-color: #fafafa;
          padding: 25px;
          border-radius: 20px;
        "
      >
        <p style="text-align: left;">
          ${content}
        </p>
        <a href="${buttonUrl}" target="_blank">
          <button
            style="
              background-color: #1C2E4A;
              border: 0;
              width: 200px;
              height: 30px;
              border-radius: 6px;
              color: #fff;
              cursor: pointer;
            "
          >
            ${buttonText}
          </button>
        </a>
        <p style="text-align: left;">
          If you are unable to click the above button, copy paste the below URL into your address bar
        </p>
        <a href="${buttonUrl}" target="_blank">
            <p style="margin: 0px; text-align: left; font-size: 10px; text-decoration: none;">
              ${buttonUrl}
            </p>
        </a>
      </div>
    </body>
  </html>`;
};

const datasetTemplate = (message1, message2, message3) => {
  return `<!DOCTYPE html>
  <html>
  
  <body style="text-align: center; font-family: 'Verdana', serif; color: black;">
      <div style="
              max-width: 400px;
              margin: 10px auto;
              background-color: #fafafa;
              padding: 25px;
              border-radius: 20px;
            ">
          <p style="text-align: left; margin-bottom: 30px;">
              ${message1}
          </p>
          <p style="text-align: left; margin-bottom: 30px;">
              ${message2}
          </p>
          <p style="text-align: left; margin-bottom: 30px;">
              ${message3}
          </p>
          <p style="text-align: left; margin-bottom: 30px;">
              Thank you,<br>
              @SignBridge2024 Management Team
          </p>
      </div>
  </body>
  
  </html>`;
}


module.exports = { sendEmail, mailTemplate, datasetTemplate };
