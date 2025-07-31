# DataWhiz Analytics - Full Stack Integration

This project now features a complete integration between a **FastAPI backend** and **React frontend** with role-specific analytics pipelines.

## 🚀 Quick Start

### Option 1: Automated Startup (Recommended)
```bash
# Run the automated startup script
python start_fastapi_fullstack.py
```

This script will:
- ✅ Check all dependencies
- ✅ Setup backend and frontend
- ✅ Start both servers automatically
- ✅ Open the application in your browser

### Option 2: Manual Startup

#### Step 1: Setup Backend
```bash
cd backend

# Install Python dependencies
pip install -r requirements_fastapi.txt

# Create environment file
cp env.example .env
# Edit .env with your OpenAI API key

# Start FastAPI server
py start_fastapi.py
```

#### Step 2: Setup Frontend
```bash
# In a new terminal, from project root
npm install
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔧 What's New

### FastAPI Backend Features
- ✅ **8 Role-Specific Analytics Pipelines**
  - Business Analyst: KPI dashboard, customer segmentation, sales trends
  - Research & EDA: Correlation analysis, hypothesis testing, outlier detection
  - Marketing Analytics: ROI analysis, RFM segmentation, campaign testing
  - Financial Analysis: Forecasting, risk analysis, ROI calculations
  - Predictive Modeling: AutoML, model evaluation, drift monitoring
  - Healthcare Analytics: Survival analysis, patient clustering
  - E-Commerce Analytics: Market basket analysis, order funnel
  - General Analysis: Auto EDA, GPT-driven insights

- ✅ **Production-Ready Features**
  - JWT authentication with session management
  - File upload with validation (CSV, Excel, JSON)
  - Background task processing
  - Report generation (PDF, PNG, Excel, JSON)
  - Real-time error logging
  - Admin panel with user management
  - Database support (SQLite dev, PostgreSQL prod)
  - Docker deployment ready

### Frontend Integration
- ✅ **Updated API Service**: Now connects to FastAPI backend
- ✅ **Enhanced Authentication**: JWT-based auth with proper session management
- ✅ **Role-Based Analytics**: Each role has its own analysis pipeline
- ✅ **File Upload**: Drag-and-drop file upload for analysis
- ✅ **Real-Time Results**: Background processing with status updates
- ✅ **Report Downloads**: Multiple format support

## 📊 Available Analytics Roles

### 1. Business Analyst
- **KPI Dashboard**: Key performance indicators and metrics
- **Customer Segmentation**: KMeans clustering analysis
- **Sales Trends**: Time-series analysis and forecasting
- **Anomaly Detection**: Identify unusual patterns in data

### 2. Research & EDA
- **Correlation Matrix**: Feature relationships analysis
- **Summary Statistics**: Comprehensive data overview
- **Outlier Detection**: Statistical anomaly identification
- **Missing Value Analysis**: Data quality assessment
- **Hypothesis Testing**: Statistical significance testing

### 3. Marketing Analytics
- **ROI Analysis**: Return on investment calculations
- **RFM Segmentation**: Recency, Frequency, Monetary analysis
- **Engagement Funnel**: Customer journey analysis
- **Persona Clustering**: Customer segmentation
- **Campaign Testing**: A/B testing and performance analysis

### 4. Financial Analysis
- **Forecasting**: Time-series predictions using Prophet
- **Risk Heatmap**: Risk assessment visualization
- **ROI/IRR/NPV**: Financial metric calculations
- **Volatility Analysis**: Market risk assessment
- **Auto Budgeting**: Automated budget allocation

### 5. Predictive Modeling
- **AutoML**: Automated machine learning pipeline
- **Regression/Classification**: Model training and evaluation
- **Model Evaluation**: ROC, confusion matrix, AUC metrics
- **Drift Monitoring**: Model performance tracking

### 6. Healthcare Analytics
- **Cohort Survival Analysis**: Patient outcome analysis
- **Prevalence Graphs**: Disease pattern visualization
- **Patient Clustering**: Similar patient group identification
- **Hospital KPIs**: Healthcare performance metrics

### 7. E-Commerce Analytics
- **Market Basket Analysis**: Product association rules
- **Order Funnel**: Purchase journey analysis
- **Trend Forecasting**: Sales prediction models
- **Price/Inventory Tracking**: Supply chain optimization

### 8. General Analysis
- **Auto EDA**: Automated exploratory data analysis
- **Correlation Heatmap**: Feature relationship visualization
- **GPT-Driven Insights**: AI-powered data interpretation
- **Auto SQL Generation**: Database query automation

## 🔐 Authentication

The system now uses JWT-based authentication:

1. **Register**: Create a new account with email and password
2. **Login**: Authenticate with your credentials
3. **Session Management**: Automatic token refresh and validation
4. **Role-Based Access**: Different user roles with specific permissions

## 📁 File Upload

Supported file formats:
- **CSV** (.csv)
- **Excel** (.xlsx, .xls)
- **JSON** (.json)

File size limit: 50MB

## 📊 Analysis Workflow

1. **Upload File**: Drag and drop your data file
2. **Select Role**: Choose the appropriate analytics role
3. **Run Analysis**: Start the analysis pipeline
4. **View Results**: Interactive charts and insights
5. **Download Reports**: Get results in multiple formats

## 🛠️ Development

### Backend Development
```bash
cd backend
py start_fastapi.py
```

### Frontend Development
```bash
npm run dev
```

### API Testing
Visit http://localhost:8000/docs for interactive API documentation

## 🐳 Production Deployment

### Docker Deployment
```bash
cd backend
docker-compose up --build
```

### Environment Variables
Set these in your `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key
SECRET_KEY=your_secure_secret_key
POSTGRES_URL=postgresql://user:pass@localhost/db
```

## 🔍 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if port 8000 is available
   - Verify Python dependencies are installed
   - Check the logs in `backend/logs/app.log`

2. **Frontend won't connect to backend**
   - Ensure backend is running on port 8000
   - Check CORS settings in backend config
   - Verify API_BASE_URL in `src/utils/api.ts`

3. **File upload fails**
   - Check file size (max 50MB)
   - Verify file format is supported
   - Ensure uploads directory exists

4. **Authentication issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify backend authentication endpoints

### Logs
- **Backend logs**: `backend/logs/app.log`
- **Frontend logs**: Browser developer console
- **API errors**: Check `/api/admin/errors` endpoint

## 📞 Support

For issues and questions:
1. Check the logs for error messages
2. Review the API documentation at `/docs`
3. Test individual endpoints using the interactive docs
4. Check system stats via admin endpoints

## 🎯 Next Steps

The system is now fully integrated and ready for:
- ✅ Data analysis across 8 different roles
- ✅ Production deployment
- ✅ User management and authentication
- ✅ Report generation and downloads
- ✅ Real-time analytics processing

Your DataWhiz Analytics platform is now production-ready with a complete FastAPI backend and React frontend integration! 