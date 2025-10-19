# Healthcare Management System - Backend API

A comprehensive Node.js + Express.js backend API for a healthcare management system with MySQL database integration.

> **Note**: This is the backend API. The frontend dashboard is located in the `healthcare-frontend` directory.

## 🏗️ Project Structure

```
healthcare-backend/
├── src/
│   ├── controllers/     # Business logic controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Authentication, error handling
│   ├── services/       # Reusable services
│   ├── config/         # Configuration files
│   ├── utils/          # Helper functions
│   └── validators/     # Input validation
├── tests/              # API tests
├── server.js           # Entry point
├── package.json        # Dependencies and scripts
├── env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── database.sql        # MySQL database schema
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16.0.0 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd healthcare-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   DATABASE_HOST=localhost
   DATABASE_USER=root
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=healthcare_db
   DATABASE_PORT=3306
   JWT_SECRET=your-secret-key
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Connect to MySQL and run the schema
   mysql -u root -p < database.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

## 📊 Database Schema

The system includes the following tables:

- **users** - User authentication and roles
- **profiles** - User profile information
- **doctors** - Doctor-specific information
- **patients** - Patient-specific information
- **appointments** - Appointment scheduling
- **medical_records** - Medical history and records
- **prescriptions** - Medication prescriptions

## 🔧 API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication (Coming Soon)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh token

### Users (Coming Soon)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Doctors (Coming Soon)
- `GET /api/v1/doctors` - Get all doctors
- `GET /api/v1/doctors/:id` - Get doctor by ID
- `POST /api/v1/doctors` - Create doctor profile
- `PUT /api/v1/doctors/:id` - Update doctor profile

### Patients (Coming Soon)
- `GET /api/v1/patients` - Get all patients
- `GET /api/v1/patients/:id` - Get patient by ID
- `POST /api/v1/patients` - Create patient profile
- `PUT /api/v1/patients/:id` - Update patient profile

### Appointments (Coming Soon)
- `GET /api/v1/appointments` - Get all appointments
- `GET /api/v1/appointments/:id` - Get appointment by ID
- `POST /api/v1/appointments` - Create appointment
- `PUT /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment

### Medical Records (Coming Soon)
- `GET /api/v1/medical-records` - Get medical records
- `GET /api/v1/medical-records/:id` - Get medical record by ID
- `POST /api/v1/medical-records` - Create medical record
- `PUT /api/v1/medical-records/:id` - Update medical record

## 🛠️ Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (Jest)

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs for password security
- **Input Validation** - Zod for request validation

## 📦 Dependencies

### Production Dependencies
- **express** - Web framework
- **mysql2** - MySQL database driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **zod** - Schema validation
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **express-rate-limit** - Rate limiting
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **express-validator** - Input validation

### Development Dependencies
- **nodemon** - Development server
- **jest** - Testing framework
- **supertest** - HTTP testing

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_HOST` | MySQL host | localhost |
| `DATABASE_USER` | MySQL username | root |
| `DATABASE_PASSWORD` | MySQL password | helloworld |
| `DATABASE_NAME` | Database name | healthcare_db |
| `DATABASE_PORT` | MySQL port | 3306 |
| `JWT_SECRET` | JWT secret key | your-secret-key |
| `JWT_EXPIRE` | JWT expiration | 7d |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `CLIENT_URL` | Frontend URL | http://localhost:3000 |


## 🆘 Support

For support and questions, please open an issue in the repository.
