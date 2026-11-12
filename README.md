# HopeBridge Donation App

A modern static donation website for collecting support for community assistance, education, healthcare, and emergency relief programs.

## Included files
- `index.html` — Donation landing page and form
- `success.html` — Thank-you page after the donation is submitted
- `style.css` — Responsive donation app styling
- `script.js` — Form validation and form submission handling
- `README.md` — Project overview and instructions

## How it works
1. A donor fills in their name, email, phone, donation amount, and cause.
2. The form validates required fields.
3. Donation details are stored in `localStorage`.
4. The user is redirected to a success page with all submitted details.

## Run locally
Open `index.html` directly in a browser or serve the folder with a simple local web server:

```bash
cd E:\Ananth\projects
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Customization ideas
- Change brand name and colors in `style.css`
- Add a real payment gateway such as Razorpay, Stripe or PayPal
- Save donations to a backend database or email service
- Add a dashboard for tracking donation totals

## Notes
This is a frontend-only donation form and does not process real payments yet. It is ideal for prototypes, fundraising pages, or demonstration apps.