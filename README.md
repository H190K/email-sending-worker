# 📬 Contact Form Worker

> A sleek Cloudflare Worker that handles contact form submissions with Turnstile verification, file attachments, and SMTP2GO email delivery. No backend required—just pure serverless magic.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com/)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/H190K/email-sending-worker.git

# Navigate to the project
cd email-sending-worker

# Install dependencies (if any)
npm install

# Configure your environment variables in wrangler.toml

# Deploy to Cloudflare Workers
wrangler deploy
```

---

## ⚙️ Environment Variables Setup

Before deploying, you **must** configure these environment variables in your Cloudflare Workers dashboard:

### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `SMTP2GO_API_KEY` | Your SMTP2GO API key for sending emails | [SMTP2GO Dashboard](https://www.smtp2go.com/) |
| `RECIPIENT_EMAIL` | Email address where form submissions will be sent | Your email (e.g., `contact@yourdomain.com`) |
| `SENDER_EMAIL` | Email address to send from | Your domain email (e.g., `noreply@yourdomain.com`) |

### Optional Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret key for bot protection | [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) |

### How to Add Environment Variables

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > Select your worker
3. Go to **Settings** > **Variables**
4. Click **Add variable** and enter each key-value pair
5. **Encrypt** sensitive values (like API keys)
6. Click **Save**

---

## 🎯 What It Does

This worker handles contact form submissions with:
- ✅ **Automatic Turnstile verification** for bot protection
- 📎 **File attachment support** via multipart/form-data
- 📧 **SMTP2GO integration** for reliable email delivery
- 🌐 **CORS enabled** for cross-origin requests
- ⚡ **Serverless architecture** with zero maintenance

---

## 📝 How to Use It

This worker supports two submission methods depending on whether you need file uploads or not.

### Method 1: JSON Submission (No Files)

Perfect for simple contact forms without attachments.

#### HTML Form

```html
<form id="json-contact-form">
  <input type="text" name="Name" placeholder="John Doe" required>
  <input type="email" name="Email" placeholder="john@example.com" required>
  <textarea name="Message" placeholder="Your message here..." required></textarea>

  <!-- Cloudflare Turnstile -->
  <div class="cf-turnstile" data-sitekey="YOUR_TURNSTILE_SITE_KEY"></div>

  <button type="submit">Send Message</button>
</form>
```

#### JavaScript Handler

```js
const form = document.getElementById('json-contact-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = document.querySelector('[name="cf-turnstile-response"]').value;
  if (!token) return alert('Complete Turnstile verification');

  const data = {
    Name: form.elements['Name'].value,
    Email: form.elements['Email'].value,
    Message: form.elements['Message'].value,
    'cf-turnstile-response': token
  };

  const res = await fetch('https://YOUR_WORKER_ENDPOINT', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) alert('✨ Message sent successfully!');
  else alert('❌ Error sending message');
});
```

---

### Method 2: Multipart Form-Data (With Files)

Use this when you need to accept file uploads like resumes, documents, or images.

#### HTML Form with File Upload

```html
<form id="file-contact-form" enctype="multipart/form-data">
  <input type="text" name="Name" placeholder="John Doe" required>
  <input type="email" name="Email" placeholder="john@example.com" required>
  <textarea name="Message" placeholder="Your message here..." required></textarea>

  <!-- File inputs -->
  <input type="file" name="Attachment1">
  <input type="file" name="Attachment2">

  <!-- Cloudflare Turnstile -->
  <div class="cf-turnstile" data-sitekey="YOUR_TURNSTILE_SITE_KEY"></div>

  <button type="submit">Send Message</button>
</form>
```

#### JavaScript Handler

```js
const form = document.getElementById('file-contact-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = document.querySelector('[name="cf-turnstile-response"]').value;
  if (!token) return alert('Complete Turnstile verification');

  const formData = new FormData(form);
  formData.append('cf-turnstile-response', token);

  const res = await fetch('https://YOUR_WORKER_ENDPOINT', {
    method: 'POST',
    body: formData
  });

  if (res.ok) alert('✨ Message sent successfully!');
  else alert('❌ Error sending message');
});
```

---

## 🛠️ Developer Notes

- **Field Names:** Use any field names you want—the worker dynamically parses all fields
- **Turnstile Token:** Always include `cf-turnstile-response` for bot verification
- **File Attachments:** Any file input in multipart/form-data becomes an email attachment
- **CORS:** Pre-configured to accept requests from any origin
- **Error Responses:** Returns JSON with `error` and `message` fields on failure
- **License:** MIT (see repo for full license)

---

## 📋 Summary

| Submission Type | Content-Type | Use Case |
|----------------|--------------|----------|
| JSON | `application/json` | Forms without file uploads |
| Multipart | `multipart/form-data` | Forms with file attachments |

Both methods:
1. Include the Turnstile token
2. Are automatically parsed by the worker
3. Trigger Turnstile verification
4. Send emails via SMTP2GO

---

## 💖 Support the Project

Love this worker? Here's how you can help:

- 🍴 **Fork it** and add your own features
- 🐛 **Report bugs** or suggest improvements via [GitHub Issues](https://github.com/H190K/email-sending-worker/issues)
- 📢 **Share it** with developers who need serverless contact forms
- ⭐ **Star the repo** to show your support

If my projects make your life easier, consider buying me a coffee! Your support helps me create more open-source tools for the community.

<div align="center">

[![Support via DeStream](https://img.shields.io/badge/🍕_Feed_the_Developer-DeStream-FF6B6B?style=for-the-badge)](https://destream.net/live/H190K/donate)

[![Crypto Donations](https://img.shields.io/badge/Crypto_Donations-NOWPayments-9B59B6?style=for-the-badge&logo=bitcoin&logoColor=colored)](https://nowpayments.io/donation?api_key=J0QACAH-BTH4F4F-QDXM4ZS-RCA58BH)

</div>

---

<div align="center">

**Built with ❤️ by [H190K](https://github.com/H190K)**

*Making serverless forms simple since 2025*

</div>






