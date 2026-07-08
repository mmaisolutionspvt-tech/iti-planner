# n8n Production Workflow Setup

This file describes the exact workflow for launching n8n from Docker, logging in, and filling credentials for Twilio, Resend, and Google Sheets.

## 1) Prerequisites

- Docker installed on your machine.
- Your project repo is open at `c:\Users\HP\OneDrive\Desktop\flight_repo\firstflight-travels`.
- Production credentials ready:
  - `RESEND_API_KEY`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_NUMBER`
  - `WHATSAPP_PHONE_NUMBER_ID` (if using Meta Cloud API)
  - `WHATSAPP_ACCESS_TOKEN` (if using Meta Cloud API)
  - `GOOGLE_SHEETS_SPREADSHEET_ID`
  - `GOOGLE_SHEETS_SHEET_NAME`

## 2) Start n8n in Docker

1. Open a terminal in the project root:
   ```powershell
   cd "c:\Users\HP\OneDrive\Desktop\flight_repo\firstflight-travels"
   ```

2. Create a `.env` file in the project root with your environment values:
   ```env
   # n8n credentials
   N8N_BASIC_AUTH_ACTIVE=true
   N8N_BASIC_AUTH_USER=admin
   N8N_BASIC_AUTH_PASSWORD=admin

   # Service credentials
   RESEND_API_KEY=your_resend_api_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_FROM_NUMBER=+1234567890
   WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
   GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
   GOOGLE_SHEETS_SHEET_NAME=Bookings
   ```

3. Run n8n with Docker:
   ```powershell
   docker run -it --rm --name n8n \
     -p 5678:5678 \
     --env-file .env \
     -v "%USERPROFILE%\.n8n:/home/node/.n8n" \
     n8nio/n8n:latest
   ```

4. Open n8n in your browser:
   - `http://localhost:5678`

5. Log in using the credentials from `.env`:
   - Username: `admin`
   - Password: `admin`

## 3) Import the existing workflow

1. In n8n, go to the top-right menu and choose `Import`.
2. Select `n8n_workflow_draft.json` from this repository.
3. Confirm the workflow import.

## 4) Create required credentials in n8n

### 4.1 Resend API credential

1. Go to `Credentials` in n8n.
2. Click `New Credential` and choose `HTTP Header Auth`.
3. Name it `Resend API Auth`.
4. Add one header:
   - Header name: `Authorization`
   - Header value: `Bearer {{ $env.RESEND_API_KEY }}`
5. Save.

### 4.2 Twilio credential

1. Go to `Credentials`.
2. Click `New Credential` and choose `HTTP Basic Auth`.
3. Name it `Twilio Credentials`.
4. Set:
   - Username: `{{ $env.TWILIO_ACCOUNT_SID }}`
   - Password: `{{ $env.TWILIO_AUTH_TOKEN }}`
5. Save.

### 4.3 Google Sheets credential

1. Go to `Credentials`.
2. Click `New Credential` and choose `Google Auth`.
3. Name it `Google Sheets OAuth`.
4. Follow the OAuth flow and sign in with the Google account that owns the target sheet.
5. Grant access to Google Sheets.
6. Save.

### 4.4 Meta Cloud API credential (optional)

If you are using Meta WhatsApp Cloud API:

1. Go to `Credentials`.
2. Click `New Credential` and choose `HTTP Header Auth`.
3. Name it `Meta Cloud API Auth`.
4. Add one header:
   - Header name: `Authorization`
   - Header value: `Bearer {{ $env.WHATSAPP_ACCESS_TOKEN }}`
5. Save.

## 5) Configure the workflow nodes

### 5.1 Webhook node

- Path: `firstflight-booking`
- Method: `POST`

This node receives booking data from the app.

### 5.2 If node

- Condition: check that `{{ $json.email }}` is not empty.

This ensures email exists before sending notifications.

### 5.3 Send Email (Resend)

- Node name: `Send Email (Resend)`
- Credential: `Resend API Auth`
- Request body should already use booking JSON values such as `{{ $json.name }}` and `{{ $json.itemData.name }}`.

### 5.4 SMS (Twilio)

- Node name: `SMS (Twilio)`
- Credential: `Twilio Credentials`
- URL format: `https://api.twilio.com/2010-04-01/Accounts/{{ $env.TWILIO_ACCOUNT_SID }}/Messages.json`
- Body values:
  - `From`: `{{ $env.TWILIO_FROM_NUMBER }}`
  - `To`: `{{ $json.phone }}`
  - `Body`: booking confirmation text

### 5.5 WhatsApp / Meta API node

If you use Meta Cloud API for WhatsApp:

- Node name: `WhatsApp (Meta API)`
- Credential: `Meta Cloud API Auth`
- URL: `https://graph.facebook.com/v20.0/{{ $env.WHATSAPP_PHONE_NUMBER_ID }}/messages`
- Body: JSON notification text.

### 5.6 Log to Google Sheets

- Node name: `Log to Google Sheets`
- Credential: `Google Sheets OAuth`
- Spreadsheet ID: `{{ $env.GOOGLE_SHEETS_SPREADSHEET_ID }}`
- Sheet name: `{{ $env.GOOGLE_SHEETS_SHEET_NAME }}`
- Columns:
  - Timestamp
  - Name
  - Email
  - Phone
  - Item Type
  - Provider
  - Amount
  - PDF URL

## 6) Save and activate workflow

1. Click `Save` in the top-right corner.
2. Set the workflow to `Active`.
3. Test by sending a POST request to:
   - `http://localhost:5678/webhook/firstflight-booking`

## 7) Example command to test the webhook

Use `curl` from the terminal:

```powershell
curl -X POST http://localhost:5678/webhook/firstflight-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+919876543210",
    "itemType": "flight",
    "itemData": {"name": "Mumbai to Delhi", "price_inr": "4500", "fromDate": "2026-08-01", "toDate": "2026-08-03", "pdf_url": "https://example.com/ticket.pdf"}
  }'
```

## 8) Notes

- If you are using a cloud n8n instance, replace `http://localhost:5678` with your deployed URL.
- If you add a new credential name in n8n, update the workflow node reference to match.
- Keep your `.env` secure and do not commit it to source control.
