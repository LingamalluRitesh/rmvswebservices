# RMVS Web Services: Enterprise Digital Engineering & Verified Software Platform

**Official Company Name:** RMVS Web Services  
**Chief Executive Officer & Super Admin:** Ritesh Lingamallu (`riteshlingamallu8@gmail.com`)  
**Tagline:** BUILD • CONNECT • GROW  
**Four Pillars:** Websites • Apps • Software • Digital Solutions  
**Database:** Cloud Neon PostgreSQL (Serverless Pooled)  
**Architecture:** Decoupled Modern SPA (React 18 + TypeScript + Vite + Tailwind CSS + Liquid Glass Design) & High-Performance Asynchronous Engine (Python 3.12 + FastAPI + SQLAlchemy 2.0 + WebSockets)

---

## 🌟 Vision & Platform Highlights

**RMVS Web Services** is a premier web architecture and digital engineering company bridging visionary enterprises with verified software engineers.

1. **Strict Creator & Developer Attribution**:
   Every enterprise project features permanent lead developer and contributor attribution, directly linking to verified developer profiles (`/developers/{username}`).
2. **Neon Cloud PostgreSQL Engine**:
   Connected to high-performance, serverless Neon PostgreSQL with connection pooling, SSL/TLS security, and robust asynchronous ORM mapping.
3. **Four Core Engineering Pillars**:
   - **Websites**: Ultra high-performance responsive web applications, portals, and SaaS frontends.
   - **Apps**: Cross-platform iOS and Android mobile engineering (Flutter / React Native).
   - **Software**: Enterprise microservices, distributed backends, REST APIs, and database architecture.
   - **Digital Solutions**: Autonomous AI agent frameworks, predictive business intelligence, and cloud automation.
4. **Dynamic Centralized Branding**:
   All branding (company name, logo, favicon, tagline, contact information, social links) is centralized in `company_settings` and managed by the CEO via the Control Center (`/ceo`).
5. **Real-time WebSockets & Community Channels**:
   Live developer community channels (`#general`, `#frontend`, `#backend`, `#ai-ml`, `#devops`, etc.) with real-time broadcast and instant messaging.
6. **Executive Control Center (`/ceo`)**:
   CEO Ritesh Lingamallu possesses complete administrative control:
   - Team and developer roster management (verification, role assignment, skills).
   - Project showcase management with live landing page screenshot capturing.
   - Direct client inquiries CRM.
   - Live centralized Brand Settings.
7. **WhatsApp Business Platform Automation (Official Meta Cloud API v21.0)**:
   Enterprise-grade automated customer messaging for real-time order lifecycle updates, invoice alerts, threshold-aware delivery tracking with public milestone tracking pages (`/track/:trackingNumber`), lead capture notifications, and CEO monitoring.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18, TypeScript, Vite
  - Tailwind CSS with bespoke Liquid Glass aesthetic
  - React Router 6, Axios API Client with JWT Interceptors
  - Framer Motion animations & Lucide React icons
  - Dynamic `document.title` and favicon syncing via `SettingsContext`
- **Backend**:
  - Python 3.12+
  - FastAPI (Asynchronous REST API + WebSockets)
  - SQLAlchemy 2.0 (Asyncpg / Asynchronous ORM)
  - Pydantic v2 Settings & Validation
  - Argon2 / Bcrypt cryptographic password hashing & PyJWT tokens
  - Headless Chrome screenshot capture integration for project showcases
- **Messaging & Notifications**:
  - Meta WhatsApp Business Platform Cloud API (v21.0)
  - Bi-directional Webhooks with HMAC-SHA256 signature verification (`X-Hub-Signature-256`)
  - Automated Event Dispatcher with idempotency keys & exponential backoff retry logic
  - Google libphonenumber validation (`phonenumbers` python library)
- **Database**:
  - Neon PostgreSQL (Serverless AWS us-east-2 pooler)

---

## 📱 WhatsApp Business Automation System

RMVS WebServices integrates official Meta WhatsApp Cloud API v21.0 to automate high-priority notifications across core business domains:

### 1. Automation Events Covered
- **Order Lifecycle**: `order_created`, `order_confirmed`, `order_accepted`, `order_rejected`, `order_processing`, `order_packed`, `order_dispatched`, `order_assigned`, `order_out_for_delivery`, `delivery_eta_updated`, `order_delivered`, `order_cancelled`.
- **Billing & Invoices**: `invoice_generated`, `invoice_updated`, `payment_reminder`, `payment_received`, `payment_failed`, `refund_completed`.
- **Delivery & Live Tracking**: Real-time status updates, delivery personnel assignment, and public tracking link (`/track/:trackingNumber`).
- **Website Inquiries**: Instant WhatsApp alert to business phone (`WHATSAPP_BUSINESS_NOTIFICATION_PHONE`) upon public contact form submissions.

### 2. Configuration & Credentials Setup
1. In the **CEO Command Suite** (`/ceo` -> **WhatsApp Automation** tab), or via `backend/.env`:
   ```bash
   WHATSAPP_PHONE_NUMBER_ID="your_meta_phone_number_id"
   WHATSAPP_BUSINESS_ACCOUNT_ID="your_waba_id"
   WHATSAPP_ACCESS_TOKEN="EAA..."
   WHATSAPP_WEBHOOK_VERIFY_TOKEN="rmvs_secure_webhook_token_2026"
   WHATSAPP_APP_SECRET="your_meta_app_secret"
   WHATSAPP_BUSINESS_NOTIFICATION_PHONE="+919876543210"
   WHATSAPP_TEST_MODE=true  # Set to false in production for live Meta API calls
   ```
2. **Meta Webhook Setup**:
   - **Callback URL**: `https://rmvs-backend.onrender.com/api/v1/webhooks/whatsapp`
   - **Verify Token**: Must match `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
   - **Webhook Fields**: Subscribe to `messages`. Status receipts (`sent`, `delivered`, `read`, `failed`) and user replies (`STOP` for opt-out, `START` for opt-in) will update the system automatically.
3. **CEO Dashboard Controls**:
   - **Live Metrics**: Total sent, delivery rate, failures, and active pending queue.
   - **Credentials Management**: Safe key updates with masked token view.
   - **Templates Catalog**: View, enable/disable, and edit parameter mappings.
   - **Message Audit Log**: Paginated, filterable event history with one-click manual retry for failed dispatches.
   - **Live Test Sender**: Send simulated or live test templates to any verified mobile number directly from the dashboard.

## 🚀 Getting Started

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Activate Python virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (Port 8000)
uvicorn app.main:app --reload --port 8000
```

Interactive API documentation will be available at: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (Port 5173)
npm run dev
```

The application will be live at: `http://localhost:5173`

---

## 🔑 Executive & Access Credentials

- **CEO / Super Admin Account**:
  - **Email:** `riteshlingamallu8@gmail.com`
  - **Portal:** `/login` -> Redirects to CEO Command Suite (`/ceo`)
  - **Permissions:** Full system administration, brand settings, project management, and developer approvals.
- **Client & Developer Registration**:
  - Public registration is open for Developers (`/register?type=developer`) and Clients (`/register?type=client`).
  - Admin registration is strictly protected and restricted.

---

## 🏢 Official Branding Assets

- **Company Name:** RMVS Web Services
- **Official Logo:** Circular emblem featuring modern geometric branding, coding brackets `</>`, and subtitle `WEBSITES • APPS • SOFTWARE • DIGITAL SOLUTIONS` (deployed at `/logo.png`).
- **Favicon:** `/logo.png`
- **Copyright:** © 2026 RMVS Web Services. All rights reserved.
