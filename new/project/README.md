# 🚀 DataWhiz - Complete Analytics Platform

A comprehensive data analytics platform with role-specific analysis capabilities, featuring Business Analyst tools, authentication, admin panel, and modern React frontend.

## 📊 Features

### 🏢 Business Analyst System
- **Data Cleaning**: Remove nulls, duplicates, outliers
- **KPI Computation**: Revenue, profit margin, churn rate, customer value
- **Trend Analysis**: Monthly, quarterly, yearly trends
- **Customer Segmentation**: RFM analysis + K-means clustering
- **Anomaly Detection**: Identify unusual patterns
- **Interactive Visualizations**: Charts and dashboards
- **Business Insights**: AI-powered recommendations

### 🔐 Authentication & Security
- User registration and login
- Session management
- Role-based access control
- Password hashing with bcrypt
- JWT token authentication

### 👨‍💼 Admin Panel
- User management (view, edit, delete)
- System monitoring and statistics
- Error logging and debugging
- Admin action tracking

### 🎨 Modern Frontend
- React with TypeScript
- Tailwind CSS for styling
- Responsive design
- Interactive components
- Real-time updates

## 🚀 Quick Start

### Option 1: One-Click Start (Recommended)

**Windows:**
```bash
# Double-click the batch file
start_datawhiz.bat
```

**All Platforms:**
```bash
# Run the Python script (Windows: 'py', Others: 'python')
py run_everything.py
```

This will automatically:
- ✅ Check system requirements
- ✅ Install all dependencies
- ✅ Start backend server
- ✅ Start frontend server
- ✅ Run system tests
- ✅ Open browser to the application

### Option 2: Manual Setup

#### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

#### Backend Setup
```bash
cd backend

# Create virtual environment
# Windows:
py -m venv venv
# Mac/Linux:
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
# Windows:
py app.py
# Mac/Linux:
python app.py
```

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 🌐 Access Points

Once running, access the application at:

- **Main Application**: http://localhost:5173
- **Dashboard**: http://localhost:5173/dashboard
- **Business Analyst**: http://localhost:5173/analyze/business_analyst
- **Admin Panel**: http://localhost:5173/admin
- **Backend API**: http://localhost:5000

## 🔑 Default Credentials

### Admin Account
- **Email**: admin@datawhiz.com
- **Password**: admin123

### Test User
- **Email**: business.analyst@test.com
- **Password**: testpass123

## 📊 Business Analyst Usage

### 1. Upload Data
- Navigate to Dashboard: http://localhost:5173/dashboard
- Click "Business Analyst" card
- Click "Upload Data" tab
- Select CSV or Excel file with business data
- Supported columns: revenue, cost, customer_id, date, etc.

### 2. View Analysis Results
- **KPIs**: Key performance indicators
- **Insights**: Business intelligence insights
- **Recommendations**: Actionable recommendations
- **Charts**: Interactive visualizations

### 3. Analysis History
- View all previous analyses
- Access detailed results
- Download reports

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Windows
py test_business_analysis.py

# Mac/Linux
python test_business_analysis.py
```

This tests:
- ✅ User registration and authentication
- ✅ Business data upload and analysis
- ✅ KPI computation and insights generation
- ✅ Data cleaning and preprocessing
- ✅ Analysis history and results retrieval
- ✅ Customer segmentation and trend analysis
- ✅ Anomaly detection and recommendations

## 📁 Project Structure

```
new/project/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── auth_service.py           # Authentication service
│   ├── admin_service.py          # Admin panel service
│   ├── business_analysis_service.py  # Business analysis engine
│   ├── config.py                 # Configuration settings
│   ├── requirements.txt          # Python dependencies
│   └── datawhiz.db              # SQLite database
├── src/
│   ├── components/
│   │   ├── BusinessAnalyst.tsx   # Business analyst interface
│   │   ├── AdminPanel.tsx        # Admin panel component
│   │   └── ...
│   ├── utils/
│   │   └── api.ts               # API service functions
│   └── ...
├── run_everything.py            # One-click runner script
├── start_datawhiz.bat           # Windows batch file
├── test_business_analysis.py    # System test suite
└── package.json                 # Node.js dependencies
```

## 🔧 Configuration

### Backend Configuration
Edit `backend/config.py` to modify:
- Database settings
- CORS origins
- File upload limits
- JWT settings

### Frontend Configuration
Edit `src/utils/api.ts` to modify:
- API base URL
- Request timeouts
- Error handling

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 5000 is available
- Ensure all Python dependencies are installed
- Check virtual environment activation

**Frontend won't start:**
- Check if port 5173 is available
- Ensure Node.js dependencies are installed
- Clear npm cache: `npm cache clean --force`

**Database errors:**
- Delete `backend/datawhiz.db` to reset database
- Check file permissions

**Import errors:**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Logs and Debugging

- Backend logs appear in the terminal
- Frontend logs appear in browser console
- Database logs in `backend/datawhiz.db`
- Error logs stored in database

## 🚀 Deployment

### Production Setup

1. **Backend Deployment:**
   ```bash
   # Use production WSGI server
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **Frontend Deployment:**
   ```bash
   # Build for production
   npm run build
   
   # Serve static files
   npm install -g serve
   serve -s dist -l 3000
   ```

3. **Database:**
   - Use PostgreSQL or MySQL for production
   - Configure connection strings in `config.py`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the test suite for examples
- Open an issue on GitHub

---

**🎉 Enjoy using DataWhiz for your business analytics needs!** 