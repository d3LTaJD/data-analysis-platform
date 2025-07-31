# 🚀 DataWhiz - Complete Analytics Platform

A comprehensive data analytics platform with role-specific analysis capabilities, featuring Business Analyst tools, authentication, admin panel, and modern React frontend.

## 🌟 Overview

DataWhiz is a full-stack data analysis platform that combines the power of React frontend with Flask/FastAPI backend to provide comprehensive data analytics solutions. Whether you're a business analyst, healthcare professional, financial expert, or researcher, DataWhiz provides the tools you need to transform raw data into actionable insights.

## 📊 Features

### 🏢 **Business Analyst System**
- **Data Cleaning**: Remove nulls, duplicates, outliers with intelligent suggestions
- **KPI Computation**: Revenue, profit margin, churn rate, customer lifetime value
- **Trend Analysis**: Monthly, quarterly, yearly trends with forecasting
- **Customer Segmentation**: RFM analysis + K-means clustering
- **Anomaly Detection**: Identify unusual patterns and outliers
- **Interactive Visualizations**: Dynamic charts and dashboards
- **Business Insights**: AI-powered recommendations and insights

### 🏥 **Healthcare Analytics**
- Patient data analysis and insights
- Medical trend identification
- Healthcare KPI tracking
- Clinical data visualization

### 💰 **Financial Analysis**
- Investment portfolio analysis
- Risk assessment and modeling
- Financial trend analysis
- Market data insights

### 📈 **Marketing Analytics**
- Campaign performance tracking
- Customer segmentation
- ROI analysis
- Marketing funnel optimization

### 🛒 **E-commerce Analytics**
- Sales trend analysis
- Inventory management insights
- Customer behavior analysis
- Product performance tracking

### 🔬 **Research & EDA**
- Exploratory data analysis tools
- Statistical analysis
- Research data visualization
- Hypothesis testing support

### 🔐 **Authentication & Security**
- User registration and login
- Session management with JWT
- Role-based access control
- Password hashing with bcrypt
- Secure API endpoints

### 👨‍💼 **Admin Panel**
- User management (view, edit, delete)
- System monitoring and statistics
- Error logging and debugging
- Admin action tracking
- Performance analytics

### 🎨 **Modern Frontend**
- React 18 with TypeScript
- Tailwind CSS for professional styling
- Responsive design for all devices
- Interactive components and animations
- Real-time updates and notifications
- Dark theme with blue accents

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive styling
- **Vite** for fast development and building
- **React Router** for navigation
- **Axios** for API communication
- **Plotly.js** for interactive charts

### Backend
- **Flask** (Python) web framework
- **FastAPI** alternative implementation
- **SQLAlchemy** for database operations
- **Pandas** for data manipulation
- **NumPy** for numerical computing
- **Scikit-learn** for machine learning
- **Plotly** for data visualization
- **OpenAI API** for AI insights

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

**Full-Stack Startup:**
```bash
# Start both frontend and backend automatically
py start_fastapi_fullstack.py
```

This will automatically:
- ✅ Check system requirements
- ✅ Install all dependencies
- ✅ Set up virtual environment
- ✅ Start backend server
- ✅ Start frontend server
- ✅ Run system tests
- ✅ Open browser to the application

### Option 2: Manual Setup

#### Prerequisites
- Python 3.8+ (`py` command on Windows)
- Node.js 16+ and npm
- Git

#### Backend Setup
```bash
cd backend

# Create virtual environment
py -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start backend server
py app.py
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

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Admin Panel**: http://localhost:5173/admin

## 📁 Project Structure

```
new/project/
├── backend/                    # Flask/FastAPI backend
│   ├── routers/               # API route handlers
│   │   ├── admin_router.py    # Admin endpoints
│   │   ├── auth_router.py     # Authentication
│   │   ├── business_analyst_router.py
│   │   ├── healthcare_analytics_router.py
│   │   ├── financial_analysis_router.py
│   │   ├── marketing_analytics_router.py
│   │   └── ecommerce_analytics_router.py
│   ├── services/              # Business logic
│   │   ├── auth_service.py    # Authentication logic
│   │   ├── business_analyst_service.py
│   │   ├── data_cleaning_service.py
│   │   └── ai_insights_service.py
│   ├── schemas/               # Data models
│   ├── database/              # Database configuration
│   ├── requirements.txt       # Python dependencies
│   └── app.py                 # Main Flask app
├── src/                       # React frontend
│   ├── components/            # React components
│   │   ├── analysis/          # Analysis components
│   │   ├── ui/                # UI components
│   │   └── layout/            # Layout components
│   ├── pages/                 # Page components
│   ├── contexts/              # React contexts
│   ├── utils/                 # Utility functions
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── package.json               # Node.js dependencies
├── start_datawhiz.bat         # Windows startup script
├── run_everything.py          # Python startup script
└── start_fastapi_fullstack.py # Full-stack startup script
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./datawhiz.db
SECRET_KEY=your_secret_key_here
FLASK_ENV=development
```

### API Keys Required

- **OpenAI API Key**: For AI-powered insights and analysis
  - Get one at: https://platform.openai.com/api-keys
  - Required for advanced AI features

## 📊 Usage Guide

### 1. **Upload Your Data**
- Drag and drop CSV, Excel, or JSON files
- Supported formats: .csv, .xlsx, .xls, .json
- Automatic data validation and preview

### 2. **Choose Your Role**
- **Business Analyst**: Sales, marketing, and business metrics
- **Healthcare**: Patient data and medical insights
- **Financial**: Investment and risk analysis
- **Marketing**: Campaign and customer analysis
- **E-commerce**: Sales and inventory analysis
- **Research**: Exploratory data analysis

### 3. **Analyze Your Data**
- Use interactive dashboards
- Generate automated insights
- Create custom visualizations
- Export reports and charts

### 4. **Get AI Insights**
- Click the AI button for automated analysis
- Get natural language explanations
- Receive actionable recommendations
- Identify patterns and trends

## 🎨 Customization

### Themes and Styling
The application uses a professional dark theme with blue accents. Customize in:
- `src/index.css` - Global styles
- `tailwind.config.js` - Tailwind configuration
- `src/components/ui/` - UI components

### Adding New Analysis Roles
1. Add role definition in `src/data/roles.ts`
2. Create role-specific components in `src/components/`
3. Add backend services in `backend/services/`
4. Create API routes in `backend/routers/`

## 🚀 Deployment

### Frontend (Netlify)
The project includes `netlify.toml` for easy deployment:

```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Backend (Heroku/Railway)
- Use `requirements.txt` for Python dependencies
- Set environment variables in your hosting platform
- Configure database URL for production
- Use `gunicorn` for production server

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🧪 Testing

Run the test suite:

```bash
# Backend tests
cd backend
py test_backend.py

# Frontend tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with React, Flask, and modern web technologies
- Powered by OpenAI for AI insights
- Styled with Tailwind CSS
- Icons from various icon libraries
- Community contributions and feedback

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/d3LTaJD/data-analysis-platform/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce
4. Provide system information and environment details

## 🔄 Updates

Stay updated with the latest features and improvements:

```bash
git pull origin main
npm install
pip install -r requirements.txt
```

---

**Made with ❤️ by d3LTaJD**

*Transform your data into actionable insights with DataWhiz!*

🚀 **Ready to analyze your data? Start with `py start_fastapi_fullstack.py`** 