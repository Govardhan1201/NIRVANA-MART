# 🤖 NIRVANA MART — n8n Automation Workflows

10 ready-to-import automation workflows for the NIRVANA MART campus marketplace.

---

## 📋 Workflow Index

| # | File | Trigger | Works Without 24/7? | Description |
|---|------|---------|-------------------|-------------|
| 01 | `01_morning_pending_check.json` | ⏰ Schedule (9AM daily) | ✅ Yes | Email admin when products need approval |
| 02 | `02_weekly_sales_report.json` | ⏰ Schedule (Monday 8AM) | ✅ Yes | Weekly stats email + Google Sheets log |
| 03 | `03_bulk_announcement_email.json` | 📝 Form (Manual) | ✅ Yes | Email all users with an announcement |
| 04 | `04_new_user_welcome_sequence.json` | 🔗 Webhook | ⚡ Needs Cloudflare | Welcome email + 3-day seller nudge |
| 05 | `05_order_confirmation.json` | 🔗 Webhook | ⚡ Needs Cloudflare | Buyer + seller emails + review request |
| 06 | `06_product_approval_notification.json` | 🔗 Webhook | ⚡ Needs Cloudflare | Notify seller of approval/rejection |
| 07 | `07_server_keepalive.json` | ⏰ Schedule (Every 14min) | ✅ Yes (when PC on) | Keep Render server awake |
| 08 | `08_inactive_users_reengagement.json` | ⏰ Schedule (Monday 10AM) | ✅ Yes | Re-engage users inactive 14+ days |
| 09 | `09_export_orders_to_sheets.json` | 🖱️ Manual Click | ✅ Yes | Export all orders to Google Sheets |
| 10 | `10_database_cleanup.json` | 🖱️ Manual Click | ✅ Yes | Delete old rejected listings |

---

## ⚙️ Setup — Step by Step

### Step 1: Run n8n with Environment Variables (Docker)

Since self-hosted/Docker instances of n8n do not have the paid **Variables** settings menu, we use **Docker Environment Variables** instead. n8n will automatically read these in the workflows.

To do this, stop your current n8n container and start a new one with the variables configured.

Run this command in PowerShell or Command Prompt (replace the values with your own keys/details):

```bash
docker stop n8n
docker rm n8n
docker run -d --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n -e N8N_BLOCK_ENV_ACCESS_IN_NODE="false" -e NIRVANA_BASE_URL="https://nirvana-mart.onrender.com/api" -e ADMIN_TOKEN="your_jwt_admin_token" -e RESEND_API_KEY="your_resend_api_key" -e ADMIN_EMAIL="nirvanamart0@gmail.com" -e GOOGLE_SHEETS_ID="your_google_sheets_id" n8nio/n8n
```

> **How to get ADMIN_TOKEN:** Log into the admin panel in Chrome → F12 → Application → Local Storage → copy `vm_token`

---

### Step 2: Import Workflows

1. Open n8n: `http://localhost:5678`
2. Click **"+"** to create a new workflow
3. Click the **⋯ menu** (top right) → **Import from file**
4. Select any `.json` file from this folder
5. Save and activate

---

### Step 3: Set Up Google Sheets (Workflows 02, 07, 09)

1. Create a new Google Sheet
2. Add these sheets (tabs):
   - `Weekly Reports`
   - `Uptime Log`
   - `All Orders`
3. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/**THIS_PART**/edit`
4. In n8n, add **Google Sheets OAuth2** credentials
5. Make sure the `GOOGLE_SHEETS_ID` env variable was passed during Docker container startup (Step 1)

---

### Step 4: Set Up Webhook Workflows (04, 05, 06)

These need your local n8n to be reachable from the internet.

**Option A — Cloudflare Tunnel (Free, Permanent)**
```bash
# Run once, saves the tunnel URL permanently
docker run -d --name cloudflared --network host cloudflare/cloudflared tunnel --url http://localhost:5678
```

**Option B — ngrok (Simple)**
```bash
ngrok http 5678
# Gives you: https://abc123.ngrok.io
```

Then add webhook calls to your `server.js` backend at the relevant events:

```javascript
// In your server.js, after user registers:
const n8nBase = process.env.N8N_WEBHOOK_BASE || 'http://localhost:5678/webhook';

// After user registration:
fetch(`${n8nBase}/nirvana-user-registered`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: user.name, email: user.email, token: token })
}).catch(() => {}); // silent fail — never block the main response

// After order placed:
fetch(`${n8nBase}/nirvana-order-placed`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
}).catch(() => {});

// After product approved/rejected:
fetch(`${n8nBase}/nirvana-product-status`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'approved', seller_email: ..., product_title: ... })
}).catch(() => {});
```

---

## 🐳 n8n Docker Commands

```bash
# Start n8n
docker start n8n

# Stop n8n
docker stop n8n

# View logs
docker logs n8n --tail 50

# Access n8n UI
# http://localhost:5678
```

---

## 📅 Recommended Schedule (Keep PC On For These)

| Time | What Runs |
|------|-----------|
| Daily 9:00 AM | Pending products check → admin email |
| Monday 8:00 AM | Weekly sales report |
| Monday 10:00 AM | Inactive user re-engagement |
| Every 14 min (all day) | Server keep-alive ping |

---

## 🔔 Email Templates Used

All emails use the NIRVANA MART brand:
- **From:** `NIRVANA MART <onboarding@resend.dev>`
- **Colors:** Amber `#c8923a` | Dark `#0a0a14` | Green `#10b981`
- **Font:** Segoe UI, system fonts

> Note: With Resend free tier (onboarding@resend.dev), emails only go to verified addresses. To send to any address, verify your domain at resend.com/domains.

---

## 🚀 Quick Start Priority

1. ✅ Import `07_server_keepalive.json` → **Activates immediately, fixes loading screen**
2. ✅ Import `01_morning_pending_check.json` → **Run every morning**
3. ✅ Import `03_bulk_announcement_email.json` → **Use to announce features**
4. ✅ Import `09_export_orders_to_sheets.json` → **Run for records**
5. ✅ Import `02_weekly_sales_report.json` → **Free analytics**

---

*Built for NIRVANA MART — Campus Marketplace | VIIT*
