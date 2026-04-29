# 🔧 Configuration Guide

This guide will walk you through setting up all required services for the Harmony Homeopathy Clinic application.

---

## 📋 Table of Contents
1. [Firebase Setup](#firebase-setup)
2. [EmailJS Setup](#emailjs-setup)
3. [Initial Data Setup](#initial-data-setup)
4. [Testing the Application](#testing-the-application)

---

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Enter project name: `harmony-homeopathy` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click **"Create Project"**

### Step 2: Register Web App

1. In your Firebase project, click the **Web icon (</>) **
2. Enter app nickname: `Harmony Homeopathy Web App`
3. **DO NOT** check "Also set up Firebase Hosting"
4. Click **"Register app"**
5. Copy the Firebase configuration object

### Step 3: Update Firebase Config

Open `src/firebase.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxX",
  authDomain: "harmony-homeopathy.firebaseapp.com",
  projectId: "harmony-homeopathy",
  storageBucket: "harmony-homeopathy.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Step 4: Enable Firestore Database

1. In Firebase Console, go to **"Firestore Database"** (left sidebar)
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select your preferred Cloud Firestore location
5. Click **"Enable"**

### Step 5: Set Up Firestore Collections

#### Create "slots" Collection

1. In Firestore, click **"Start collection"**
2. Collection ID: `slots`
3. Add first document:
   - Document ID: (Auto-ID)
   - Fields:
     ```
     date (string): "2024-02-15"
     time (string): "10:00"
     available (boolean): true
     ```
4. Click **"Save"**

#### Add More Sample Slots

Click **"Add document"** and create multiple slots:

```
Slot 1:
  date: "2024-02-15", time: "10:00", available: true

Slot 2:
  date: "2024-02-15", time: "11:00", available: true

Slot 3:
  date: "2024-02-15", time: "14:00", available: true

Slot 4:
  date: "2024-02-15", time: "15:00", available: true

Slot 5:
  date: "2024-02-16", time: "10:00", available: true

Slot 6:
  date: "2024-02-16", time: "11:00", available: true
```

**Note**: The "appointments" collection will be created automatically when the first appointment is booked.

### Step 6: Enable Authentication

1. In Firebase Console, go to **"Authentication"** (left sidebar)
2. Click **"Get started"**
3. Click on **"Email/Password"** in Sign-in providers
4. **Enable** the "Email/Password" option
5. Click **"Save"**

### Step 7: Create Admin User

1. In Authentication, go to the **"Users"** tab
2. Click **"Add user"**
3. Enter admin credentials:
   - Email: `admin@harmonyhomeopathy.com`
   - Password: `Admin@123` (or your secure password)
4. Click **"Add user"**

**Important**: Save these credentials - you'll need them to log into the admin dashboard!

### Step 8: Update Firestore Security Rules (Optional - Production)

For production, update security rules in Firestore:

1. Go to **"Firestore Database"** > **"Rules"** tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Appointments: Public can create, authenticated can read/update/delete
    match /appointments/{document} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    
    // Slots: Public can read, authenticated can write
    match /slots/{document} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

---

## 📧 EmailJS Setup

### Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click **"Sign Up"** (Free account is sufficient)
3. Verify your email address

### Step 2: Add Email Service

1. In EmailJS Dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended for testing)
   - Outlook
   - Yahoo
   - Or any custom SMTP

#### For Gmail:
1. Select **"Gmail"**
2. Click **"Connect Account"**
3. Sign in with your Gmail account
4. Allow EmailJS access
5. Service Name: `Harmony Clinic Notifications`
6. Click **"Create Service"**
7. **Copy the Service ID** (e.g., `service_abc1234`)

### Step 3: Create Email Template

1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Template Name: `Appointment Notification`

#### Template Setup:

**Subject:**
```
  New Appointment Booked - {{patient_name}}
```

**Content:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 20px; border-radius: 8px; }
    .content { background: #f9fafb; padding: 20px; margin-top: 20px; border-radius: 8px; }
    .info { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 New Appointment Booked</h1>
      <p>Harmony Homeopathy Clinic</p>
    </div>
    
    <div class="content">
      <p>Hello {{to_name}},</p>
      <p>A new appointment has been scheduled through your website.</p>
      
      <div class="info">
        <h3>📋 Patient Details</h3>
        <p><strong>Name:</strong> {{patient_name}}</p>
        <p><strong>Phone:</strong> {{patient_phone}}</p>
        <p><strong>Symptoms:</strong> {{symptoms}}</p>
      </div>
      
      <div class="info">
        <h3>📅 Appointment Details</h3>
        <p><strong>Date:</strong> {{appointment_date}}</p>
        <p><strong>Time:</strong> {{appointment_time}}</p>
      </div>
      
      <p>Please contact the patient to confirm the appointment.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated notification from your appointment booking system.</p>
      <p>© 2024 Harmony Homeopathy Clinic</p>
    </div>
  </div>
</body>
</html>
```

4. Click **"Save"**
5. **Copy the Template ID** (e.g., `template_xyz5678`)

### Step 4: Get Public Key

1. Go to **"Account"** in the left sidebar
2. Scroll to **"General"** section
3. **Copy the Public Key** (e.g., `user_AbCdEfGhIjKlMnOp`)

### Step 5: Update AppointmentForm.jsx

Open `src/components/AppointmentForm.jsx` and update lines 10-12:

```javascript
const EMAILJS_SERVICE_ID = 'service_abc1234';  // Your Service ID
const EMAILJS_TEMPLATE_ID = 'template_xyz5678'; // Your Template ID
const EMAILJS_PUBLIC_KEY = 'user_AbCdEfGhIjKlMnOp'; // Your Public Key
```

### Step 6: Test Email (Optional)

EmailJS provides a test feature:
1. Go to your template in EmailJS
2. Click **"Test"**
3. Fill in sample values
4. Check if you receive the email

---

## 📊 Initial Data Setup

### Creating Time Slots for Multiple Days

You can add slots via the Admin Dashboard, but here's how to add them directly in Firestore:

1. Go to Firestore Console
2. Select `slots` collection
3. Add documents with this pattern:

#### Week 1 Example:
```
Monday (2024-02-19):
  - 09:00, 10:00, 11:00, 14:00, 15:00, 16:00

Tuesday (2024-02-20):
  - 09:00, 10:00, 11:00, 14:00, 15:00, 16:00

Wednesday (2024-02-21):
  - 09:00, 10:00, 11:00, 14:00, 15:00, 16:00

Thursday (2024-02-22):
  - 09:00, 10:00, 11:00, 14:00, 15:00, 16:00

Friday (2024-02-23):
  - 09:00, 10:00, 11:00, 14:00, 15:00, 16:00

Saturday (2024-02-24):
  - 10:00, 11:00, 12:00, 14:00, 15:00
```

All slots should have `available: true` initially.

### Bulk Import Script (Optional)

If you want to add many slots quickly, you can use the Firebase console's import feature or create a simple script.

---

## 🧪 Testing the Application

### Test 1: Patient Booking Flow

1. Open the application
2. Click **"Book Appointment"**
3. Fill in the form:
   - Name: Test Patient
   - Age: 30
   - Phone: +1234567890
   - Symptoms: Test booking
   - Date: Select a date with available slots
   - Time: Select an available slot
4. Click **"Confirm Appointment"**
5. Verify:
   - ✅ Success message appears
   - ✅ Email received (check spam folder)
   - ✅ Appointment created in Firestore
   - ✅ Slot marked as unavailable

### Test 2: Admin Login

1. Navigate to `/login` directly in browser
2. Enter admin credentials:
   - Email: `admin@harmonyhomeopathy.com`
   - Password: Your admin password
3. Click **"Sign In"**
4. Verify:
   - ✅ Redirected to `/admin`
   - ✅ Dashboard loads successfully
   - ✅ Test appointment visible

### Test 3: Admin Features

**Appointments Management:**
1. View the test appointment
2. Click **"Mark as Completed"**
3. Verify status changes to "Completed"
4. Click **"Delete"** and confirm
5. Verify appointment is removed

**Slot Management:**
1. Switch to **"Manage Slots"** tab
2. Add a new slot:
   - Date: Tomorrow
   - Time: 16:00
3. Click **"Add Slot"**
4. Verify slot appears in the list
5. Toggle availability on/off
6. Delete the test slot

### Test 4: Slot Availability

1. Log out from admin
2. Go to booking page
3. Select a date
4. Verify only available slots show up
5. Book a slot
6. Try to book the same slot again
7. Verify it's no longer available

---

## 🔍 Troubleshooting

### Firebase Issues

**Problem**: "Firebase: Error (auth/invalid-api-key)"
- **Solution**: Double-check your API key in `firebase.js`

**Problem**: "Missing or insufficient permissions"
- **Solution**: Update Firestore security rules (see Step 8 above)

**Problem**: Slots not showing
- **Solution**: 
  - Check if slots exist in Firestore
  - Verify date format is "YYYY-MM-DD"
  - Ensure `available` is boolean, not string

### EmailJS Issues

**Problem**: Email not sending
- **Solution**: 
  - Verify all three credentials (Service ID, Template ID, Public Key)
  - Check EmailJS dashboard for quota limits (free: 200/month)
  - Test email directly in EmailJS dashboard

**Problem**: "Failed to send email" in console
- **Solution**:
  - Check browser console for specific error
  - Verify template variables match (case-sensitive)
  - Ensure email service is connected

### Admin Access Issues

**Problem**: Can't access `/admin` route
- **Solution**:
  - Make sure you're logged in
  - Check if admin user exists in Firebase Auth
  - Try logging out and in again

**Problem**: "Invalid email or password"
- **Solution**:
  - Verify credentials in Firebase Auth console
  - Reset password if needed
  - Check if email/password auth is enabled

---

## 📝 Quick Reference

### Admin Credentials
```
Email: admin@harmonyhomeopathy.com
Password: [Your chosen password]
Access URL: http://localhost:5173/login
```

### Date Format
```
Firestore slots: "YYYY-MM-DD" (e.g., "2024-02-15")
Display format: Automatically formatted by browser
```

### Time Format
```
24-hour format: "HH:MM" (e.g., "14:30")
Display: Automatically formatted by browser
```

---

## ✅ Configuration Checklist

Before deploying to production:

- [ ] Firebase configuration updated
- [ ] Firestore database created
- [ ] Initial slots added
- [ ] Admin user created
- [ ] EmailJS service connected
- [ ] Email template created
- [ ] EmailJS credentials updated
- [ ] Security rules configured
- [ ] Test booking completed successfully
- [ ] Admin dashboard tested
- [ ] Email notification received

---

## 🚀 Next Steps

After configuration:

1. **Customize Content**: Update clinic info, doctor details, services
2. **Add Real Slots**: Create slots for the next 2-4 weeks
3. **Test Thoroughly**: Go through all workflows
4. **Deploy**: Consider Firebase Hosting or Vercel for deployment
5. **Monitor**: Check Firebase console regularly for appointments

---

**Need Help?** 

- Check the main README.md for troubleshooting
- Review Firebase documentation
- Visit EmailJS support

---

🌿 Happy Healing!
