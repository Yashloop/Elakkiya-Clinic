# 🌿 Harmony Homeopathy Clinic

A modern, full-featured React web application for managing a homeopathy clinic with Firebase backend, featuring appointment booking, admin dashboard, and email notifications.

## ✨ Features

### 🏠 Public Features
- **Beautiful Home Page** with hero section, services, testimonials, and contact info
- **Online Appointment Booking** with dynamic time slot selection
- **Real-time Slot Availability** - prevents double booking
- **Email Notifications** via EmailJS after successful booking
- **Responsive Design** - works perfectly on mobile, tablet, and desktop
- **Quick Contact Options** - Call and WhatsApp buttons
- **Google Maps Integration** for clinic location

### 🔐 Admin Features
- **Secure Login** with Firebase Authentication
- **Protected Admin Routes** - accessible only to authenticated users
- **Appointment Management**:
  - View all appointments in a clean table
  - Mark appointments as completed
  - Delete appointments (automatically frees up the slot)
- **Slot Management**:
  - Add new time slots
  - Toggle slot availability (enable/disable)
  - Delete slots
  - View all slots with status indicators
- **Real-time Dashboard** with statistics
- **Responsive Admin Panel** for management on-the-go

## 🛠️ Tech Stack

- **Frontend**: React 18 with functional components and hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom medical theme
- **Backend**: Firebase Firestore (NoSQL database)
- **Authentication**: Firebase Authentication
- **Email Service**: EmailJS
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx              # Navigation bar with auth detection
│   ├── Footer.jsx              # Footer with contact info
│   ├── AppointmentForm.jsx     # Booking form with slot selection
│   ├── SlotSelector.jsx        # Dynamic time slot selector
│   └── ProtectedRoute.jsx      # Route protection wrapper
├── pages/
│   ├── Home.jsx                # Landing page
│   ├── Appointment.jsx         # Appointment booking page
│   ├── Login.jsx               # Admin login page
│   └── Admin.jsx               # Admin dashboard
├── firebase.js                 # Firebase configuration
├── App.jsx                     # Main app component with routing
├── main.tsx                    # App entry point
└── index.css                   # Global styles and animations
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" and follow the setup wizard
3. Once created, click on "Web" (</>) to add a web app

#### Get Firebase Configuration
1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Copy the Firebase configuration object

#### Update `src/firebase.js`
Replace the placeholder values with your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

#### Setup Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Choose "Start in test mode" (for development) or set up security rules
4. Create two collections:
   - `appointments` (will be auto-created when first booking is made)
   - `slots` (create manually and add initial slots)

#### Sample Slot Document Structure
```json
{
  "date": "2024-01-15",
  "time": "10:00",
  "available": true
}
```

#### Setup Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. Go to "Users" tab and click "Add User"
5. Create admin account with email and password

### 3. EmailJS Setup

#### Create EmailJS Account
1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account
3. Add an email service (Gmail, Outlook, etc.)

#### Create Email Template
1. Go to "Email Templates"
2. Create a new template with these parameters:
   - `{{to_name}}` - Clinic name
   - `{{patient_name}}` - Patient's name
   - `{{patient_phone}}` - Patient's phone
   - `{{appointment_date}}` - Appointment date
   - `{{appointment_time}}` - Appointment time
   - `{{symptoms}}` - Patient's symptoms

#### Get EmailJS Credentials
1. Service ID: Found in "Email Services"
2. Template ID: Found in "Email Templates"
3. Public Key: Found in "Account" > "General"

#### Update `src/components/AppointmentForm.jsx`
Replace the placeholder values (lines 10-12):
```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
```

### 4. Run the Application

#### Development Mode
```bash
npm run dev
```

#### Build for Production
```bash
npm run build
```

#### Preview Production Build
```bash
npm run preview
```

## 🔒 Security Notes

### Firestore Security Rules
For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to appointments for authenticated users only
    match /appointments/{document} {
      allow read: if request.auth != null;
      allow write: if true; // Public can create appointments
      allow update, delete: if request.auth != null;
    }
    
    // Allow read access to slots for everyone (needed for booking)
    match /slots/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Environment Variables (Optional)
For better security, use environment variables:

Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Then update the config files to use `import.meta.env.VITE_*`

## 📱 Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home page with clinic info |
| `/appointment` | Public | Book an appointment |
| `/login` | Public | Admin login (direct URL only) |
| `/admin` | Protected | Admin dashboard (requires login) |

## 🎨 Design Features

- **Medical Theme**: Calming green, blue, and white color palette
- **Professional UI**: Clean cards, smooth animations, and modern design
- **Responsive**: Mobile-first design that works on all devices
- **Accessibility**: Proper focus states and semantic HTML
- **Loading States**: Spinners and skeleton screens for better UX
- **Error Handling**: User-friendly error messages

## 📝 Usage Guide

### For Patients
1. Visit the website
2. Click "Book Appointment" or navigate to `/appointment`
3. Fill in personal details (name, age, phone, symptoms)
4. Select preferred date
5. Choose from available time slots
6. Submit the form
7. Receive confirmation message

### For Admin
1. Navigate to `/login` (not visible on navbar)
2. Enter admin email and password
3. Access the admin dashboard
4. **Manage Appointments**:
   - View all bookings
   - Mark as completed
   - Delete appointments
5. **Manage Slots**:
   - Add new time slots
   - Enable/disable slots
   - Delete slots

## 🔄 Key Workflows

### Appointment Booking Flow
1. User selects date
2. System fetches available slots from Firestore
3. User selects time slot
4. On submit:
   - Creates appointment document
   - Updates slot availability to `false`
   - Sends email notification via EmailJS
   - Shows success message

### Admin Slot Management
1. Admin adds new slot with date and time
2. Slot is created with `available: true`
3. When appointment is booked, slot becomes unavailable
4. Admin can manually toggle availability
5. Deleting appointment frees up the slot

## 🐛 Troubleshooting

### Common Issues

**Firebase connection error**
- Verify Firebase config in `src/firebase.js`
- Check Firebase project status
- Ensure Firestore is enabled

**Email not sending**
- Verify EmailJS credentials
- Check EmailJS service status
- Ensure email template is published

**Admin can't login**
- Verify admin user exists in Firebase Auth
- Check credentials
- Ensure Authentication is enabled

**Slots not showing**
- Verify slots exist in Firestore
- Check date format (YYYY-MM-DD)
- Ensure `available: true`

## 📦 Dependencies

```json
{
  "firebase": "^10.x",
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "@emailjs/browser": "^4.x",
  "lucide-react": "^0.x"
}
```

## 🌟 Future Enhancements

- [ ] Patient dashboard with appointment history
- [ ] SMS notifications
- [ ] Payment integration
- [ ] Multi-doctor support
- [ ] Appointment reminders
- [ ] Prescription management
- [ ] Video consultation integration
- [ ] Analytics dashboard

## 📄 License

This project is open source and available under the MIT License.

## 👥 Support

For issues or questions:
- Check the troubleshooting section
- Review Firebase and EmailJS documentation
- Verify all configuration values

---

Built with ❤️ for natural healing and wellness
