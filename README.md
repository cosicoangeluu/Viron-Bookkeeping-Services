# VIRON Bookkeeping Services

A comprehensive bookkeeping management system designed for clients and bookkeepers to streamline document management, tax compliance, and financial tracking.

## 🚀 Features

### For Clients
- **Personal Information Management**: Store and update personal details, TIN, SSS, PhilHealth, and Pag-IBIG numbers
- **Document Upload**: Upload BIR forms and financial documents organized by quarter and year
- **Gross Income Tracking**: Record and track gross income with computed tax calculations
- **Due Date Reminders**: Automatic calculation of government contribution due dates (PhilHealth, SSS, Pag-IBIG)
- **Calendar Integration**: Visual calendar showing important tax deadlines and reminders
- **Secure Authentication**: Login/signup with password reset functionality

### For Bookkeepers
- **Client Management**: View and manage all client accounts
- **Document Oversight**: Access and organize all client documents across different BIR forms
- **Activity Monitoring**: Track user activities and system usage
- **Home Statistics**: Dashboard with key metrics and statistics
- **Messaging System**: Communicate with clients through the platform
- **BIR Form Management**: Add and manage different BIR form types

### System Features
- **Multi-Role Authentication**: Separate interfaces for clients and bookkeepers
- **File Upload/Download**: Secure document storage with 10MB file size limit
- **Database Integration**: MySQL database with connection pooling
- **Responsive Design**: Modern React interface with Tailwind CSS styling
- **RESTful API**: Comprehensive backend API for all operations

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **React Router** - Declarative routing for React
- **Lucide React** - Beautiful icon library
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL2** - MySQL database client
- **bcrypt** - Password hashing
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

### Database
- **MySQL** - Relational database management system
- **Connection Pooling** - Efficient database connection management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MySQL** (v8.0 or higher)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/viron-bookkeeping-services.git
cd viron-bookkeeping-services
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Database Configuration
1. Create a MySQL database named `viron_bookkeeping_db`
2. Create a `.env` file in the `backend` directory:
```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=viron_bookkeeping_db
PORT=5000
```

#### Start the Backend Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../bookkeeping-app
npm install
```

#### Start the Development Server
```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`

### 4. Production Build

#### Build the Frontend
```bash
cd bookkeeping-app
npm run build
```

#### Preview the Production Build
```bash
npm run preview
```

## 📊 Database Schema

The application uses the following main tables:

- **users**: User authentication and role management
- **personal_info**: Client personal information and government IDs
- **dependents**: Family dependents information
- **gross_records**: Income and tax calculation records
- **documents**: File uploads with BIR form associations
- **bir_forms**: BIR form types and categories
- **messages**: Communication between users
- **user_activities**: Activity logging and tracking
- **reminders**: System reminders and notifications

## 🔧 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration
- `POST /api/forgot-password` - Password reset request
- `POST /api/reset-password` - Password reset confirmation

### Personal Information
- `GET /api/personal-info/:userId` - Get user personal info
- `POST /api/personal-info/:userId` - Update user personal info

### Documents
- `POST /api/upload` - Upload documents
- `GET /api/documents/:clientId/:formName` - Get client documents by form
- `GET /api/download/:documentId` - Download specific document
- `DELETE /api/documents/:documentId` - Delete document

### Financial Records
- `GET /api/gross-records/:userId` - Get gross income records
- `POST /api/gross-records/:userId` - Add new gross record

### Due Dates
- `GET /api/due-dates/:userId` - Calculate government contribution due dates

## 🎨 Usage

1. **Access the Application**: Open `http://localhost:5173` in your browser
2. **Select Role**: Choose between Client or Bookkeeper
3. **Authentication**: Login with existing credentials or create a new account
4. **Dashboard**: Navigate through different sections based on your role
5. **Upload Documents**: Use the document upload feature to submit BIR forms
6. **Track Due Dates**: View upcoming government contribution deadlines
7. **Manage Information**: Update personal and financial information as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@vironbookkeeping.com or create an issue in this repository.

## 🙏 Acknowledgments

- Icons provided by [Lucide React](https://lucide.dev/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/)

---

**VIRON Bookkeeping Services** - Streamlining bookkeeping for a better tomorrow.
