# 🎓 Classroom Assignment Portal

A comprehensive, full-stack Learning Management System (LMS) built with modern web technologies. This portal provides a complete solution for educational institutions to manage classrooms, assignments, submissions, and grading.

![Classroom Portal](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## 🚀 Features

### 🔐 **Authentication & User Management**
- Multi-role authentication (Students, Teachers, Administrators)
- Secure JWT-based authentication with bcrypt password hashing
- Role-based access control with proper permissions
- User profile management

### 🏫 **Classroom Management**
- Create and manage classrooms with unique join codes
- Student enrollment system with class rosters
- Real-time classroom analytics and performance metrics
- Subject-based organization

### 📝 **Advanced Assignment System**
- Rich assignment creation with multiple types (homework, quiz, exam, project, lab)
- Due date management with automatic late submission tracking
- Grading rubrics and point-based assessment
- Assignment categories and templates
- Publish/unpublish functionality for draft management

### 📤 **File Upload & Management**
- Drag-and-drop file upload interface
- Support for multiple file types (PDF, DOC, DOCX, TXT, images, ZIP)
- Secure file storage with 10MB size limits
- File download and management with access controls

### 🎯 **Submission & Grading System**
- Student submission interface with text and file uploads
- Comprehensive teacher grading dashboard
- Detailed feedback system with rubric-based assessment
- Grade distribution analytics and performance tracking
- Late submission penalties and tracking

### 📊 **Analytics & Reporting**
- **Teacher Dashboard**: Class performance overview, grade distributions, student progress
- **Student Dashboard**: Personal grade tracking, assignment progress, performance analytics
- **Classroom Analytics**: Individual student performance, assignment difficulty analysis
- Real-time performance metrics and engagement tracking

### 🔔 **Real-time Notification System**
- Automated notifications for assignments, grades, and deadlines
- Live notification center with read/unread status
- Assignment due date reminders
- Grade posting alerts

### 📱 **Modern User Interface**
- Responsive design for desktop, tablet, and mobile devices
- Material-UI components with modern styling
- Intuitive navigation and user experience
- Real-time updates without page refresh

## 🛠️ Technology Stack

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety and better development experience
- **MongoDB Atlas** - Cloud database with clustering
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### **Frontend**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type safety for better development
- **Material-UI (MUI)** - Comprehensive component library
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing

### **Database**
- **MongoDB Atlas** - Cloud-hosted MongoDB with automatic scaling
- **Mongoose Schemas** - Structured data modeling
- **Indexing** - Optimized query performance

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/classroom-assignment-portal.git
cd classroom-assignment-portal
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file with your MongoDB connection
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string

npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Environment Variables
Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=2h

# File Upload Configuration
MAX_FILE_SIZE=10485760
```

## 🚀 Quick Start with Demo Data

Run the demo data setup script to populate your system:
```bash
npm install axios
node setup-demo-data.js
```

### Demo Accounts
- **Teacher**: `teacher@demo.com` / `password123`
- **Students**: `alice@student.com`, `bob@student.com`, etc. / `password123`

## 📋 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Classroom Management
- `GET /api/classrooms` - Get user's classrooms
- `POST /api/classrooms` - Create classroom (teachers only)
- `POST /api/classrooms/join` - Join classroom with code (students)
- `GET /api/classrooms/:id` - Get classroom details

### Assignment System
- `GET /api/assignments/classroom/:id` - Get classroom assignments
- `POST /api/assignments` - Create assignment (teachers only)
- `PATCH /api/assignments/:id/publish` - Publish/unpublish assignment
- `PUT /api/assignments/:id` - Update assignment

### Submission & Grading
- `POST /api/submissions` - Submit assignment (students only)
- `GET /api/submissions/assignment/:id` - Get assignment submissions (teachers)
- `PATCH /api/submissions/:id/grade` - Grade submission (teachers)

### File Management
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files/download/:filename` - Download file

### Analytics
- `GET /api/analytics/teacher-dashboard` - Teacher analytics
- `GET /api/analytics/student-dashboard` - Student analytics
- `GET /api/analytics/classroom/:id` - Classroom analytics

## 🎯 Usage Guide

### For Teachers
1. **Setup**: Register → Create classrooms → Share class codes with students
2. **Content Creation**: Create assignments → Upload materials → Set grading rubrics
3. **Management**: Monitor submissions → Grade student work → Provide detailed feedback
4. **Analytics**: View class performance → Track student progress → Generate reports

### For Students
1. **Enrollment**: Register → Join classrooms using provided codes
2. **Learning**: View assignments → Download materials → Submit completed work
3. **Progress Tracking**: Check grades → Read feedback → Monitor performance
4. **Organization**: Manage deadlines → View notifications → Plan study schedule

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt with salt rounds
- **Role-based Access Control** with proper permission checks
- **Input Validation** and sanitization on all endpoints
- **File Upload Security** with type and size validation
- **CORS Protection** for cross-origin request security

## 📊 Database Schema

### Collections
- **Users**: Authentication and user profiles
- **Classrooms**: Classroom information and enrollment
- **Assignments**: Assignment details and settings
- **Submissions**: Student work and grades
- **Notifications**: System notifications and alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, questions, or feature requests:
- Create an issue in this repository
- Contact the development team
- Check the documentation and user guides

## 🎉 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by popular LMS platforms like Google Classroom and Canvas
- Designed for educational institutions of all sizes

---

**Built with ❤️ for education and learning**

## 🌟 Star this repository if you found it helpful!