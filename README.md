# Electronic Medical Report System

A comprehensive full-stack healthcare management system that enables seamless interaction between administrators, doctors, and patients. The system provides role-based access control, appointment scheduling, medical record management, and real-time dashboards.

## 🌟 Features

### For Administrators
- **User Management**: Register and manage doctors and patients
- **Dashboard Analytics**
- **User Oversight**: Monitor all registered users


### For Doctors
- **Appointment Management**: View, confirm, and complete appointments
- **Patient Records**: Access comprehensive patient information
- **Medical Records**: Create and manage detailed medical records with prescriptions
- **Dashboard**: View upcoming appointments, patient statistics, and daily schedule
- **Patient History**: Access complete medical history for informed decision-making

### For Patients
- **Doctor Discovery**: Browse and search for doctors by specialization
- **Appointment Booking**: Schedule appointments with availability checking
- **Medical History**: View complete medical records and prescriptions
- **Profile Management**: Update personal and medical information
- **Dashboard**: Track upcoming appointments.

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.5.6 
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: Heroicons
- **Date Handling**: date-fns
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt, helmet, cors
- **Validation**: Zod
- **Rate Limiting**: express-rate-limit
- **Logging**: morgan

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MySQL** (v8.0 or higher)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/aamnaiqbal/electronic-medical-report-system.git
cd electronic-medical-report-system
```

### 2. Database Setup

#### Create Database
```sql
CREATE DATABASE healthcare_db;
USE healthcare_db;
```

#### Import Database Schema
```bash
# Navigate to backend directory
cd backend

# Import the SQL file
mysql -u root -p healthcare_db < database.sql
```

Or manually run the `database.sql` file in your MySQL client.

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
# DATABASE_HOST=localhost
# DATABASE_PORT=3306
# DATABASE_NAME=healthcare_db
# DATABASE_USER=root
# DATABASE_PASSWORD=your_password
# JWT_SECRET=your_secret_key
# JWT_EXPIRES_IN=7d
# PORT=5000
# NODE_ENV=development
# CLIENT_URL=http://localhost:3000

# Start the backend server
npm run dev
```

The backend server will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file (IMPORTANT!)
cp .env.example .env.local

# Edit .env.local file
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

⚠️ **IMPORTANT**: The `.env.local` file is required for the frontend to connect to the backend API. Without it, you'll get HTML error responses instead of JSON.

## 🔐 Environment Variables

### Backend (.env)
```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=healthcare_db
DATABASE_USER=root
DATABASE_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Frontend (if needed)
The frontend uses Next.js API routes as a proxy, so no additional environment variables are required by default.

## 📁 Project Structure

```
electronic-medical-report-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── validators/      # Input validation
│   ├── database.sql         # Database schema
│   ├── server.js           # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/            # Next.js app directory
    │   │   ├── (auth)/     # Authentication pages
    │   │   ├── (dashboard)/ # Dashboard pages
    │   │   │   ├── admin/
    │   │   │   ├── doctor/
    │   │   │   └── patient/
    │   │   └── api/        # API routes
    │   ├── components/     # React components
    │   ├── contexts/       # React contexts
    │   └── lib/           # Utilities and Redux
    │       └── redux/      # Redux store and slices
    └── package.json
```

## 🔑 Default Admin Account

After setting up the database, create an admin account (the query is given in database.sql file) by directly inserting into the database.

**Example Admin Creation (SQL)**:
```sql
-- First, create user
INSERT INTO users (email, password, role) 
VALUES ('admin@healthcare.com', '$2b$10$hashedpasswordhere', 'admin');

-- Then, create profile
INSERT INTO profiles (user_id, first_name, last_name, phone) 
VALUES (1, 'System', 'Admin', '+923456567678');
```

For testing, you can use the registration page to create doctor and patient accounts (Only admin can register patients and doctor).

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - Register new user (admin, doctor, patient)
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Admin Endpoints
- `GET /admin/users` - Get all users
- `GET /admin/stats` - Get system statistics
- `POST /admin/users/:id/role` - Update user role

### Doctor Endpoints
- `GET /doctors/profile` - Get doctor profile
- `PUT /doctors/profile` - Update doctor profile
- `GET /doctors/appointments` - Get doctor's appointments
- `PUT /doctors/appointments/:id/status` - Update appointment status
- `GET /doctors/patients` - Get doctor's patients
- `POST /doctors/medical-records` - Create medical record

### Patient Endpoints
- `GET /patients/profile` - Get patient profile
- `PUT /patients/profile` - Update patient profile
- `GET /patients/appointments` - Get patient appointments
- `POST /patients/appointments` - Book appointment
- `GET /patients/medical-records` - Get medical history
- `GET /patients/doctors` - Search doctors

## 🧪 Testing

### Test User Accounts
Create test accounts for each role:

**Admin**: 
- Email: admin@test.com
- Role: admin

**Doctor**: 
- Email: doctor@test.com
- Role: doctor
- Specialization: Cardiology

**Patient**: 
- Email: patient@test.com
- Role: patient

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for frontend origin
- **Rate Limiting**: Prevents brute force attacks
- **Helmet**: Security headers
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Parameterized queries

## 🐛 Common Issues & Solutions

### Login returns HTML instead of JSON / "Unexpected token '<'" error
**Problem**: Frontend getting HTML error page instead of JSON response when logging in

**Cause**: Missing `.env.local` file in frontend directory (this file is not in git)

**Solution**:
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local and add:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Then restart the frontend server (`npm run dev`)

### Backend won't start
- Check MySQL is running: `mysql --version`
- Verify database credentials in `.env`
- Ensure port 5000 is not in use

### Frontend won't connect to backend
- **Most Common**: Create `.env.local` file in frontend folder (see above)
- Verify backend is running on port 5000
- Check CORS configuration in backend
- Ensure `CLIENT_URL` in backend `.env` matches frontend URL

### Database connection failed
- Verify MySQL service is running
- Check database name exists: `SHOW DATABASES;`
- Verify user credentials (check DATABASE_PASSWORD in .env)
- Check port 3306 is correct
- If using XAMPP/WAMP, password might be empty: `DATABASE_PASSWORD=`

## 📝 Future Enhancements

- [ ] Email notifications for appointments
- [ ] PDF generation for prescriptions
- [ ] Video consultation feature
- [ ] Payment integration
- [ ] Mobile application
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Prescription refill requests
- [ ] Lab test results integration

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👥 Authors

- Aamna Iqbal - Initial work

## 📞 Support

For support, email aamnaiqbal19@gmail.com or create an issue in the repository.

---

**Note**: This is a educational/demonstration project. For production use, additional security measures, testing, and compliance with healthcare regulations (HIPAA, GDPR, etc.) are required.
