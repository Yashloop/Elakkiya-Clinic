# ⚡ Quick Start Guide

Get your Homeopathy Clinic website up and running in 5 minutes!

---

## 🎯 Prerequisites

- Node.js (v16 or higher)
- A Gmail account (for EmailJS)
- Basic understanding of Firebase

---

## 📦 Installation

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The app will open at `http://localhost:5173`

---

## 🔥 Minimal Firebase Setup (2 minutes)

### 1. Create Firebase Project
- Go to https://console.firebase.google.com/
- Click "Add Project" → Name it → Create

### 2. Get Config
- Click Web icon (</>) → Register app
- Copy the config object

### 3. Update `src/firebase.js`
```javascript
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};
```

### 4. Enable Firestore
- Firebase Console → Firestore Database → Create → Test mode → Enable

### 5. Add Sample Slots
In Firestore, create collection `slots`:
```
Document 1:
  date: "2024-02-20"
  time: "10:00"
  available: true

Document 2:
  date: "2024-02-20"
  time: "11:00"
  available: true

Document 3:
  date: "2024-02-20"
  time: "14:00"
  available: true
```

### 6. Create Admin User
- Firebase Console → Authentication → Get Started
- Enable "Email/Password"
- Add user:
  - Email: `admin@test.com`
  - Password: `Test@123`

---

## 📧 Minimal EmailJS Setup (2 minutes)

### 1. Create Account
- Go to https://www.emailjs.com/
- Sign up (free)

### 2. Add Gmail Service
- Email Services → Add New Service → Gmail
- Connect your Gmail account
- Copy **Service ID**

### 3. Create Template
- Email Templates → Create New Template
- Use default template
- Copy **Template ID**

### 4. Get Public Key
- Account → General → Copy **Public Key**

### 5. Update `src/components/AppointmentForm.jsx`
Lines 10-12:
```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
```

---

## 🧪 Test It!

### Test Booking:
1. Go to http://localhost:5173
2. Click "Book Appointment"
3. Fill form and select a slot
4. Submit → Should see success message

### Test Admin:
1. Go to http://localhost:5173/login
2. Login with admin credentials
3. Should see appointment in dashboard

---

## 🎨 Customize (Optional)

### Update Clinic Info:
Edit `src/pages/Home.jsx`:
- Line 169: Clinic name and tagline
- Line 257: Doctor name and credentials
- Line 456: Services
- Line 525: Contact info

### Update Contact Details:
Edit `src/components/Footer.jsx`:
- Lines 40-60: Address, phone, email

---

## 🚀 Production Build

```bash
npm run build
```

Output will be in `dist/` folder.

---

## 📱 Key URLs

| URL | Purpose |
|-----|---------|
| `/` | Home page |
| `/appointment` | Book appointment |
| `/login` | Admin login (hidden) |
| `/admin` | Admin dashboard (protected) |

---

## 🆘 Common Issues

**Slots not showing?**
- Make sure date format is "YYYY-MM-DD"
- Ensure `available: true` (boolean, not string)

**Can't login?**
- Check Firebase Auth is enabled
- Verify admin user exists
- Use correct credentials

**Email not sending?**
- Check EmailJS credentials
- Verify service is connected
- Check monthly quota (free: 200)

---

## 📚 Full Documentation

- **README.md** - Complete feature documentation
- **CONFIGURATION_GUIDE.md** - Detailed setup instructions

---

## ✅ Quick Checklist

- [ ] `npm install` completed
- [ ] Firebase config updated
- [ ] Firestore created
- [ ] Sample slots added
- [ ] Admin user created
- [ ] EmailJS credentials added
- [ ] App running on localhost
- [ ] Test booking successful
- [ ] Admin dashboard accessible

---

**That's it!** 🎉

Your homeopathy clinic website is now ready to use!

---

## 🌟 What You Get

✅ Beautiful, modern clinic website
✅ Online appointment booking
✅ Real-time slot management
✅ Email notifications
✅ Secure admin dashboard
✅ Fully responsive design
✅ Professional medical theme

---

Need more help? Check **CONFIGURATION_GUIDE.md** for detailed instructions.

🌿 Happy Healing!
