# HopeBridge Donation App

A modern static donation website for collecting support for community assistance, education, healthcare, and emergency relief programs.

## Included files
- `index.html` — Donation landing page and form
- `success.html` — Thank-you page after the donation is submitted
- `style.css` — Responsive donation app styling
- `script.js` — Form validation and form submission handling
- `server.js` — Node.js server used by Elastic Beanstalk to serve the static files
- `ganesh-chaturthi-background.jpeg` — Background image supplied for the celebration page
- `package.json` — Defines the Node.js start command
- `package-lock.json` — Locks the Node.js dependency versions
- `README.md` — Project overview and instructions

## How it works
1. A donor fills in their name, email, phone, optional address, donation amount, donation type, and optional message.
2. The form validates required fields.
3. The server emails a form-submission confirmation to the donor.
4. Donation details are stored in `localStorage`.
5. The user is redirected to a success page with the submitted details.

## Run locally
Run the Node.js server used by Elastic Beanstalk:

```bash
cd E:\Ananth\Projects
npm start
```

Then visit `http://localhost:8080`.

## Gmail confirmation email
Email confirmations are sent by the Node.js server using Gmail SMTP. Before enabling them:
1. Enable 2-Step Verification for the Gmail account.
2. Create a Google App Password for this application (remove spaces when entering it).
3. Set `GMAIL_USER` to `avighnacharaja@gmail.com` and `GMAIL_APP_PASSWORD` to the generated App Password in the Elastic Beanstalk environment properties.

Never put the App Password in the source files or commit it to Git. The email confirms that the form was submitted; this app does not process online payments.

## Customization ideas
- Change brand name and colors in `style.css`
- Add a real payment gateway such as Razorpay, Stripe or PayPal
- Save donations to a backend database or email service
- Add a dashboard for tracking donation totals

## Notes
This donation form does not process real payments yet. It is ideal for prototypes, fundraising pages, or demonstration apps.