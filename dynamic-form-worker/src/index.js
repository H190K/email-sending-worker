export default {
  async fetch(request, env) {
    // Handle OPTIONS preflight request for CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      // ---------------------------
      // 1️⃣ Parse incoming form data
      // ---------------------------
      let data = {};
      let attachments = [];
      const contentType = request.headers.get("Content-Type") || "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            const buffer = await value.arrayBuffer();
            attachments.push({
              filename: value.name,
              mimetype: value.type || "application/octet-stream",
              fileblob: btoa(String.fromCharCode(...new Uint8Array(buffer)))
            });
          } else {
            data[key] = value;
          }
        }
      } else if (contentType.includes("application/json")) {
        data = await request.json();
      } else {
        const formText = await request.text();
        data = Object.fromEntries(new URLSearchParams(formText));
      }

      console.log(`Form parsed. Fields: ${Object.keys(data).length}, Attachments: ${attachments.length}`);

      // ---------------------------
      // 2️⃣ Verify Turnstile if present
      // ---------------------------
      // TODO: Add your Cloudflare Turnstile secret key to env.TURNSTILE_SECRET
      // Get your Turnstile keys from: https://dash.cloudflare.com/?to=/:account/turnstile
      const turnstileToken = data["cf-turnstile-response"];
      if (turnstileToken) {
        const ip = request.headers.get("CF-Connecting-IP");
        const turnstileForm = new FormData();
        turnstileForm.append("secret", env.TURNSTILE_SECRET);
        turnstileForm.append("response", turnstileToken);
        turnstileForm.append("remoteip", ip);

        const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          body: turnstileForm
        });

        const result = await verify.json();
        if (!result.success) {
          return new Response(JSON.stringify({
            error: "Turnstile verification failed"
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      }

      // ---------------------------
      // 3️⃣ Build email content
      // ---------------------------
      // TODO: Customize the text below to match your brand/website name
      let bodyText = "New Form Submission\n\n";
      let htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">New Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
      `;

      for (const key in data) {
        if (key !== "cf-turnstile-response") {
          bodyText += `${key}: ${data[key]}\n`;
          htmlBody += `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">${key}:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${data[key]}</td>
            </tr>
          `;
        }
      }

      if (attachments.length > 0) {
        bodyText += `\n📎 Attachments: ${attachments.length} file(s)\n`;
        htmlBody += `
          <tr>
            <td colspan="2" style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">
              📎 Attachments: ${attachments.length} file(s)
            </td>
          </tr>
        `;
        attachments.forEach(att => {
          bodyText += `  - ${att.filename}\n`;
          htmlBody += `
            <tr>
              <td colspan="2" style="padding: 10px; padding-left: 30px; border-bottom: 1px solid #eee; color: #777;">
                ${att.filename}
              </td>
            </tr>
          `;
        });
      }

      // TODO: Customize the footer text below
      htmlBody += `
          </table>
          <p style="margin-top: 20px; color: #999; font-size: 12px;">Sent from Contact Form</p>
        </div>
      `;

      // ---------------------------
      // 4️⃣ Send email via SMTP2GO
      // ---------------------------
      // TODO: Set these environment variables in your Cloudflare Worker:
      // - SMTP2GO_API_KEY: Your SMTP2GO API key (get it from https://www.smtp2go.com/)
      // - RECIPIENT_EMAIL: The email address where you want to receive form submissions (e.g., "your-email@example.com")
      // - SENDER_EMAIL: The email address to send from (e.g., "noreply@yourdomain.com")
      const emailPayload = {
        api_key: env.SMTP2GO_API_KEY,
        to: [env.RECIPIENT_EMAIL],
        sender: env.SENDER_EMAIL,
        subject: "📩 New Form Submission",
        text_body: bodyText,
        html_body: htmlBody
      };

      if (attachments.length > 0) {
        emailPayload.attachments = attachments;
      }

      const smtp2goResponse = await fetch("https://api.smtp2go.com/v3/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload)
      });

      const responseData = await smtp2goResponse.json();
      if (!smtp2goResponse.ok || responseData.data?.error) {
        return new Response(JSON.stringify({
          error: "Failed to send email",
          details: responseData
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        message: "Email sent successfully",
        attachments_count: attachments.length
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: "Internal server error",
        message: err.message,
        stack: err.stack
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};