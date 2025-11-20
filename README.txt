
# Multi-language Website with Language-based OTP Verification

This project contains **frontend (React)** and **backend (Node.js + Express)** inside a single main folder.

## Folder structure

- `frontend/` – React app with i18next (English, Hindi, Spanish, Portuguese, Chinese, French)
- `backend/` – Node.js + Express API for language change + OTP verification

---

## 1. Setup & Run Backend

```bash
cd backend
npm install
npm run dev   # or: npm start
```

Backend will start on **http://localhost:5000**

When an OTP is generated, it will be printed in the terminal (console log).

---

## 2. Setup & Run Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm start
```

Frontend will start on **http://localhost:3000**

---

## 3. Language Rules

- **French (fr), Spanish (es), Chinese (zh)** → Require **Email OTP** on switch
- **Hindi (hi), Portuguese (pt)** → Require **Mobile OTP** on switch
- **English (en)** → No OTP required

For now, the demo uses a single in-memory user:

```js
{
  id: "1",
  name: "Demo User",
  email: "demo@example.com",
  mobile: "+911234567890",
  preferred_language: "en"
}
```

You can replace this with your own user + database logic later.

---

## 4. Demo Flow

1. Open `http://localhost:3000`
2. Click on any language button:
   - If it needs OTP, a modal popup will open.
   - Check backend terminal – you will see the generated OTP.
3. Enter the OTP in the popup and click **Verify**.
4. The entire page UI changes to the new language after successful OTP verification.
