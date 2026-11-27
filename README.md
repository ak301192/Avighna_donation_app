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
- `README.md` — Project overview and instructions

## How it works
1. A donor fills in their name, email, phone, donation amount, donation type, and optional message.
2. The form validates required fields.
3. Donation details are stored in `localStorage`.
4. The user is redirected to a success page with all submitted details.

## Run locally
Run the Node.js server used by Elastic Beanstalk:

```bash
cd E:\Ananth\Projects
npm start
```

Then visit `http://localhost:8080`.

## Customization ideas
- Change brand name and colors in `style.css`
- Add a real payment gateway such as Razorpay, Stripe or PayPal
- Save donations to a backend database or email service
- Add a dashboard for tracking donation totals

## Notes
This is a frontend-only donation form and does not process real payments yet. It is ideal for prototypes, fundraising pages, or demonstration apps.