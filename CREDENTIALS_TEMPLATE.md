# 🔑 Credentials Template

Use this template to keep track of your credentials during setup.

---

## 🔥 Firebase Configuration

### Project Information
```
Project Name: _____________________
Project ID: _______________________
Region: ___________________________
```

### Firebase Config (for src/firebase.js)
```javascript
const firebaseConfig = {
  apiKey: "__________________________________",
  authDomain: "_____________________________",
  projectId: "_____________________________",
  storageBucket: "_____________________",
  messagingSenderId: "__________________",
  appId: "_________________________________"
};
```

### Admin Account
```
Email: _________________________________
Password: ______________________________
```

**⚠️ Important**: Keep this password secure and never commit to version control!

---

## 📧 EmailJS Configuration

### Account Information
```
EmailJS Email: _________________________
Account Status: Free / Paid
Monthly Quota: 200 (Free) / Custom
```

### Service Details
```
Service Name: __________________________
Service Provider: Gmail / Outlook / Other
Service ID: ____________________________
```

### Template Details
```
Template Name: _________________________
Template ID: ___________________________
```

### API Credentials
```
Public Key: ____________________________
```

### Email Receiving
```
Notification Email: ____________________
```

---

## 🗄️ Database Information

### Firestore Collections Created
- [ ] `appointments`
- [ ] `slots`

### Initial Slots Added
```
Total Slots Created: _______
Date Range: From __________ To __________
Time Slots Per Day: _______
```

---

## 🌐 Deployment Information (Optional)

### Hosting Platform
```
Platform: Firebase / Vercel / Netlify / Other
Domain: _______________________________
Deployment Date: ______________________
```

### URLs
```
Production URL: ________________________
Admin Login URL: _______________________
```

---

## 📱 Contact Information

### Clinic Details (Update in code)
```
Clinic Name: ___________________________
Doctor Name: ___________________________
Qualification: _________________________

Address: _______________________________
City: __________________________________
Phone: _________________________________
Email: _________________________________
WhatsApp: ______________________________

Working Hours:
Mon-Fri: _______________________________
Saturday: ______________________________
Sunday: ________________________________
```

---

## 🔒 Security Checklist

- [ ] Firebase config added to src/firebase.js
- [ ] Admin account created in Firebase Auth
- [ ] Admin password is strong (8+ chars, mixed case, numbers, symbols)
- [ ] EmailJS credentials added to AppointmentForm.jsx
- [ ] Firestore security rules configured
- [ ] `.env` file in `.gitignore` (if using env variables)
- [ ] Admin login URL not publicly shared
- [ ] Regular backups enabled in Firestore

---

## 📊 Setup Progress Tracker

### Phase 1: Firebase Setup
- [ ] Firebase project created
- [ ] Web app registered
- [ ] Config copied to src/firebase.js
- [ ] Firestore database enabled
- [ ] Authentication enabled
- [ ] Admin user created
- [ ] Initial slots added

### Phase 2: EmailJS Setup
- [ ] EmailJS account created
- [ ] Email service connected
- [ ] Email template created
- [ ] Public key obtained
- [ ] Credentials added to code
- [ ] Test email sent successfully

### Phase 3: Application Testing
- [ ] Development server started
- [ ] Home page loads
- [ ] Appointment booking works
- [ ] Slot selection works
- [ ] Email notification received
- [ ] Admin login successful
- [ ] Admin dashboard accessible
- [ ] Mark completed works
- [ ] Delete appointment works
- [ ] Add slot works
- [ ] Toggle availability works

### Phase 4: Customization
- [ ] Clinic name updated
- [ ] Doctor details updated
- [ ] Services customized
- [ ] Contact info updated
- [ ] Google Maps location set
- [ ] Colors/theme adjusted (optional)

### Phase 5: Production
- [ ] All tests passed
- [ ] Production build successful
- [ ] Security rules configured
- [ ] Real slots added (2-4 weeks)
- [ ] Documentation reviewed
- [ ] Backup plan in place

---

## 🔄 Quick Copy-Paste Sections

### For Firebase Console
When creating admin user:
```
Email: admin@harmonyhomeopathy.com
Password: [Generate strong password]
```

### For Initial Slot Creation
Copy-paste this structure into Firestore:
```
Collection: slots
Document ID: [Auto-ID]

Field 1:
  Name: date
  Type: string
  Value: 2024-02-20

Field 2:
  Name: time
  Type: string
  Value: 10:00

Field 3:
  Name: available
  Type: boolean
  Value: true
```

---

## 📝 Notes & Reminders

### Setup Notes
```
Date Started: __________________________
Issues Encountered: ____________________
_______________________________________
_______________________________________

Resolved By: ___________________________
_______________________________________
_______________________________________
```

### Important Reminders
```
- EmailJS free tier: 200 emails/month
- Firebase free tier: 50K reads, 20K writes per day
- Update slots weekly
- Check appointments daily
- Monitor email quota
```

---

## 🆘 Support Contacts

### Firebase Support
- Documentation: https://firebase.google.com/docs
- Status: https://status.firebase.google.com/
- Community: https://stackoverflow.com/questions/tagged/firebase

### EmailJS Support
- Documentation: https://www.emailjs.com/docs/
- Support: support@emailjs.com
- Dashboard: https://dashboard.emailjs.com/

---

## 🗂️ File Locations Reference

Update these files with your credentials:

1. **Firebase Config**
   - File: `src/firebase.js`
   - Lines: 6-13

2. **EmailJS Config**
   - File: `src/components/AppointmentForm.jsx`
   - Lines: 10-12

3. **Clinic Info**
   - Home page: `src/pages/Home.jsx`
   - Footer: `src/components/Footer.jsx`

---

## ✅ Final Checklist Before Launch

- [ ] All credentials filled in this template
- [ ] All credentials added to code
- [ ] Test booking completed successfully
- [ ] Admin login tested
- [ ] Email received and verified
- [ ] Security rules set
- [ ] Slots for next 2 weeks added
- [ ] Production build created
- [ ] Documentation read
- [ ] Backup plan ready

---

**🔐 Security Reminder**: Never share this file publicly or commit it to version control!

**💾 Backup**: Keep a secure copy of this file in a safe location.

---

Template Version: 1.0
Last Updated: 2024
