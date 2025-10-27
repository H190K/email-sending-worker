# 📬 Contact Form Worker

> A secure, domain-restricted Cloudflare Worker that handles contact form submissions with Turnstile verification, file attachments, and SMTP2GO email delivery. Features automatic subdomain support and dynamic form field parsing—no backend required, just pure serverless magic.

[![GitHub](https://img.shields.io/badge/GitHub-H190K-181717?style=for-the-badge&logo=github)](https://github.com/H190K)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🔒 **Domain Whitelist** - Restrict access to your specified domains only
- 🌐 **Automatic Subdomain Support** - Add one domain, all subdomains work automatically
- 🔌 **Automatic Port Handling** - Works with any port (localhost:3000, localhost:8080, etc.)
- 🌍 **Wildcard Support** - Use `["*"]` to allow all domains during development
- ✅ **Turnstile CAPTCHA** - Bot protection with Cloudflare Turnstile
- 📎 **File Attachments** - Upload and receive files via email
- 🎯 **Dynamic Form Fields** - Works with any form structure automatically
- 📧 **SMTP2GO Integration** - Reliable email delivery
- 🎨 **Custom Email Templates** - HTML and plain text support
- ⚡ **Zero Maintenance** - Serverless architecture

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/H190K/email-sending-worker.git

# Navigate to the project
cd email-sending-worker

# Install dependencies (if using wrangler CLI)
npm install -g wrangler

# Configure your environment variables (see below)

# Deploy to Cloudflare Workers
wrangler deploy
```

---

## 🔐 Domain Configuration

**IMPORTANT:** This worker includes domain restrictions for security. You must configure allowed domains before deployment.

### Edit `index.js` (Lines 14-20)

```javascript
const ALLOWED_DOMAINS = [
  "yourdomain.com",      // Replace with your actual domain
  "localhost",           // Remove this in production (ports handled automatically)
  "127.0.0.1"            // Remove this in production (ports handled automatically)
  // Or use ["*"] to allow ALL domains (not recommended for production)
];
```

### How Domain Restrictions Work

When you add a domain like `"example.com"`, these are **automatically allowed**:
- ✅ `example.com`
- ✅ `example.com:3000` (any port)
- ✅ `example.com:8080` (any port)
- ✅ `www.example.com`
- ✅ `blog.example.com`
- ✅ `shop.example.com`
- ✅ `any.subdomain.example.com`

**Blocked by default:**
- ❌ Any domain not in your list
- ❌ Direct API calls without proper origin
- ❌ Unauthorized domains

### Advanced Configuration

**Allow all domains (for testing only):**
```javascript
const ALLOWED_DOMAINS = ["*"];  // ⚠️ Not recommended for production
```

**Automatic port handling:**

All ports are automatically supported! Just add the base domain:
- Add `"localhost"` → Works with `localhost:3000`, `localhost:8080`, `localhost:5173`, etc.
- Add `"example.com"` → Works with `example.com:3000`, `example.com:8080`, etc.

No need to specify ports explicitly anymore! 🎉

### Adding Multiple Domains

```javascript
const ALLOWED_DOMAINS = [
  "example.com",         // Main site + all subdomains + all ports
  "partner.com",         // Partner site + all subdomains + all ports
  "another-site.com",    // Another domain + all subdomains + all ports
];
```

---

## ⚙️ Environment Variables Setup

Before deploying, you **must** configure these environment variables in your Cloudflare Workers dashboard.

### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `SMTP2GO_API_KEY` | Your SMTP2GO API key for sending emails | [SMTP2GO Dashboard](https://www.smtp2go.com/) → Settings → API Keys |
| `RECIPIENT_EMAIL` | Email address where form submissions will be sent | Your email (e.g., `contact@yourdomain.com`) |
| `SENDER_EMAIL` | Email address to send from (must be verified in SMTP2GO) | Your domain email (e.g., `noreply@yourdomain.com`) |

### Optional Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret key for bot protection | [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) |

### How to Add Environment Variables

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → Select your worker
3. Go to **Settings** → **Variables**
4. Click **Add variable** and enter each key-value pair
5. **Encrypt** sensitive values (like API keys)
6. Click **Save** and redeploy if necessary

---

## 🎯 What It Does

This worker provides a complete contact form solution with:

### Security
- 🔒 Domain whitelist with automatic subdomain support
- 🔌 Automatic port handling for all environments
- 🛡️ Turnstile CAPTCHA verification
- 🚫 Blocks unauthorized domains (403 Forbidden)
- 🔑 Origin/Referer header validation

### Functionality
- 📎 File attachment support (any format)
- 🎨 Custom HTML email templates
- 📋 Dynamic form field parsing (works with ANY form)
- 📧 Reliable email delivery via SMTP2GO
- 🌐 CORS handling for allowed origins

### Developer Experience
- ⚡ Serverless architecture (zero maintenance)
- 🔄 Works with any form structure
- 🌍 Wildcard support for development
- 📝 Comprehensive error handling
- 🚀 Easy deployment with Wrangler CLI

---

## 📝 How to Use It

This worker supports multiple submission methods and dynamically parses all form fields.

### Method 1: Simple Form (No Files)

Perfect for basic contact forms without attachments.

#### HTML Form

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</head>
<body>
  <form id="contact-form">
    <!-- Any field names you want! -->
    <input type="text" name="name" placeholder="Your Name" required>
    <input type="email" name="email" placeholder="Your Email" required>
    <input type="tel" name="phone" placeholder="Phone Number">
    <textarea name="message" placeholder="Your message..." required></textarea>

    <!-- Cloudflare Turnstile -->
    <div class="cf-turnstile" data-sitekey="YOUR_TURNSTILE_SITE_KEY"></div>

    <button type="submit">Send Message</button>
  </form>

  <script>
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const token = document.querySelector('[name="cf-turnstile-response"]').value;
      
      if (!token) {
        alert('Please complete the CAPTCHA');
        return;
      }

      formData.append('cf-turnstile-response', token);

      const response = await fetch('https://YOUR_WORKER_URL.workers.dev/', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('✅ Message sent successfully!');
        form.reset();
      } else {
        alert('❌ Error: ' + (data.message || data.error));
      }
    });
  </script>
</body>
</html>
```

---

### Method 2: Form with File Attachments

Use this when you need to accept file uploads like resumes, documents, or images.

#### HTML Form with File Upload

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</head>
<body>
  <form id="file-form" enctype="multipart/form-data">
    <input type="text" name="fullName" placeholder="Full Name" required>
    <input type="email" name="emailAddress" placeholder="Email" required>
    <input type="text" name="company" placeholder="Company Name">
    <textarea name="projectDetails" placeholder="Project Details..." required></textarea>

    <!-- Multiple file inputs -->
    <label>Upload Resume:</label>
    <input type="file" name="resume" accept=".pdf,.doc,.docx">
    
    <label>Upload Portfolio:</label>
    <input type="file" name="portfolio" accept=".pdf,.zip">

    <!-- Cloudflare Turnstile -->
    <div class="cf-turnstile" data-sitekey="YOUR_TURNSTILE_SITE_KEY"></div>

    <button type="submit">Submit Application</button>
  </form>

  <script>
    const form = document.getElementById('file-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const token = document.querySelector('[name="cf-turnstile-response"]').value;
      
      if (!token) {
        alert('Please complete the CAPTCHA');
        return;
      }

      formData.append('cf-turnstile-response', token);

      const response = await fetch('https://YOUR_WORKER_URL.workers.dev/', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('✅ Application sent successfully!');
        form.reset();
      } else {
        alert('❌ Error: ' + (data.message || data.error));
      }
    });
  </script>
</body>
</html>
```

---

## 🎨 Email Customization

You can customize the email templates in `index.js`:

### Brand Configuration (Lines 182-217)

```javascript
// Customize email header
let bodyText = "New Form Submission\n\n";  // Plain text header

// Customize HTML template
let htmlBody = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333; border-bottom: 2px solid #1e3a8a;">
      New Form Submission
    </h2>
    <!-- Form fields appear here automatically -->
  </div>
`;

// Customize email subject (Line 228)
subject: "📩 New Form Submission",
```

### Advanced: Custom Email Template

For a more branded experience, replace the HTML body with your own design:

```javascript
let htmlBody = `
  <!DOCTYPE html>
  <html>
  <body style="font-family: Arial; background: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
      <img src="https://yourdomain.com/logo.png" alt="Logo" style="max-width: 200px;">
      <h1 style="color: #333;">New Contact Form Submission</h1>
      <table style="width: 100%; border-collapse: collapse;">
        <!-- Form fields will be inserted here automatically -->
      </table>
      <p style="color: #999; font-size: 12px;">Sent from Your Company Contact Form</p>
    </div>
  </body>
  </html>
`;
```

---

## 🛠️ Developer Notes

### Dynamic Form Field Support

The worker automatically parses **any** form field names you use. No configuration needed!

**Example:** This form structure:
```html
<input name="firstName">
<input name="lastName">
<input name="phoneNumber">
<textarea name="detailedMessage"></textarea>
<select name="serviceType"></select>
```

**Automatically becomes this email:**
```
firstName: John
lastName: Doe
phoneNumber: +1-555-0123
detailedMessage: I need help with...
serviceType: Web Development
```

### Important Field Names

- **Required:** `cf-turnstile-response` (for CAPTCHA verification)
- **Everything else:** Use any names you want!

### File Attachments

- Supported in `multipart/form-data` requests
- Any `<input type="file">` becomes an email attachment
- Files are automatically base64-encoded
- Multiple files supported

### Error Handling

The worker returns JSON responses:

**Success:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "attachments_count": 2
}
```

**Error:**
```json
{
  "error": "Forbidden",
  "message": "Access denied. This form is only accessible from authorized domains."
}
```

### Security Best Practices

1. **Always use HTTPS** for your forms
2. **Remove localhost entries** from `ALLOWED_DOMAINS` in production
3. **Never use `["*"]` wildcard** in production environments
4. **Enable Turnstile** for all public forms
5. **Verify sender email** in SMTP2GO before deploying
6. **Encrypt environment variables** in Cloudflare dashboard

---

## 🧪 Testing Your Worker

### Test Domain Restrictions

1. **Deploy the worker** with your domain in `ALLOWED_DOMAINS`
2. **Create a test form** on an unauthorized domain
3. **Submit the form** - should receive `403 Forbidden`
4. **Host on authorized domain** - should work! ✅

### Test Port Handling

1. **Add `"localhost"`** to `ALLOWED_DOMAINS`
2. **Test from different ports:** `localhost:3000`, `localhost:8080`, `localhost:5173`
3. **All ports should work** without adding them explicitly! ✅

### Test Wildcard Support

1. **Set `ALLOWED_DOMAINS = ["*"]`** for testing
2. **Submit from any domain** - should work! ✅
3. **Remember to restrict domains** before production deployment

### Test Turnstile

1. Add Turnstile widget to your form
2. Submit without completing CAPTCHA
3. Should show error: "Please complete the CAPTCHA"
4. Complete CAPTCHA and submit - should work! ✅

### Test File Attachments

1. Add `<input type="file">` to your form
2. Upload a file and submit
3. Check your email - file should be attached! 📎

---

## 📋 API Reference

### Request Format

**Endpoint:** `https://YOUR_WORKER_URL.workers.dev/`

**Method:** `POST`

**Content-Type:** 
- `application/x-www-form-urlencoded` (simple forms)
- `multipart/form-data` (with files)
- `application/json` (JSON data)

**Required Fields:**
- `cf-turnstile-response` (if using Turnstile)

**Optional:**
- Any form fields you want
- File attachments (in multipart requests)

### Response Format

**Success (200):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "attachments_count": 0
}
```

**Domain Blocked (403):**
```json
{
  "error": "Forbidden",
  "message": "Access denied. This form is only accessible from authorized domains."
}
```

**Turnstile Failed (400):**
```json
{
  "error": "Turnstile verification failed"
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error",
  "message": "Error details...",
  "stack": "Stack trace (only in development)"
}
```

---

## 🔧 Troubleshooting

### "Access denied" Error

**Problem:** Getting 403 Forbidden
**Solution:** 
1. Check if your domain is in `ALLOWED_DOMAINS` array
2. Verify you're using the correct protocol (http/https)
3. Check browser console for Origin/Referer headers
4. Make sure you're not using explicit ports in the array (they're automatic now!)

### Turnstile Verification Failed

**Problem:** CAPTCHA not working
**Solution:**
1. Verify `TURNSTILE_SECRET` is set in environment variables
2. Check that site key matches your domain
3. Ensure token is being sent as `cf-turnstile-response`

### Email Not Sending

**Problem:** Form submits but no email received
**Solution:**
1. Verify all environment variables are set correctly
2. Check SMTP2GO dashboard for delivery logs
3. Ensure sender email is verified in SMTP2GO
4. Check spam/junk folder

### CORS Errors

**Problem:** CORS policy blocking requests
**Solution:**
1. Verify your domain is in `ALLOWED_DOMAINS`
2. Check that worker is returning proper CORS headers
3. Ensure you're making requests from the correct origin
4. Try using wildcard `["*"]` temporarily to test

### Port-Related Issues

**Problem:** Form works on one port but not another
**Solution:**
1. **Remove explicit ports** from `ALLOWED_DOMAINS` (e.g., use `"localhost"` not `"localhost:3000"`)
2. Ports are now handled automatically - no need to specify them!
3. Redeploy the worker after updating the domain array

---

## 📊 Comparison Table

| Feature | This Worker | Traditional Backend |
|---------|-------------|---------------------|
| **Setup Time** | 5 minutes | Hours/Days |
| **Cost** | Free tier available | Server costs |
| **Maintenance** | Zero | Regular updates |
| **Scalability** | Auto-scales | Manual scaling |
| **Security** | Built-in domain restrictions | Manual implementation |
| **Port Handling** | ✅ Automatic | ❌ Manual config |
| **File Uploads** | ✅ Supported | ✅ Supported |
| **CAPTCHA** | ✅ Turnstile | Needs integration |
| **Email** | ✅ SMTP2GO | Needs setup |

---

## 💖 Support the Project

Love this worker? Here's how you can help:

- 🍴 **Fork it** and add your own features
- 🐛 **Report bugs** or suggest improvements via [GitHub Issues](https://github.com/H190K/email-sending-worker/issues)
- 📢 **Share it** with developers who need serverless contact forms
- ⭐ **Star the repo** to show your support
- 📝 **Write a tutorial** or blog post about using it

If my projects make your life easier, consider buying me a coffee! Your support helps me create more open-source tools for the community.

<div align="center">

[![Support via DeStream](https://img.shields.io/badge/🍕_Feed_the_Developer-DeStream-FF6B6B?style=for-the-badge)](https://destream.net/live/H190K/donate)

[![Crypto Donations](https://img.shields.io/badge/Crypto_Donations-NOWPayments-9B59B6?style=for-the-badge&logo=bitcoin&logoColor=colored)](https://nowpayments.io/donation?api_key=J0QACAH-BTH4F4F-QDXM4ZS-RCA58BH)

</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [H190K](https://github.com/H190K)**

*Making serverless forms simple and secure since 2025*

</div>