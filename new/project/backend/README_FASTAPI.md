# DataWhiz Analytics FastAPI Backend

A production-ready modular FastAPI backend for role-specific analytics pipelines with comprehensive data analysis capabilities.

## Features

### Role-Specific Analytics Pipelines
- **Business Analyst**: KPI dashboard, KMeans customer segmentation, sales trends, anomaly detection
- **Research & EDA**: Correlation matrix, summary stats, outlier detection, missing value imputation, hypothesis testing
- **Marketing Analytics**: ROI, RFM segmentation, engagement funnel, persona clusters, campaign testing
- **Financial Analysis**: Forecasting (Prophet), risk heatmap, ROI/IRR/NPV, volatility, auto budgeting
- **Predictive Modeling**: AutoML, regression/classification, model evaluation (ROC, CM, AUC), drift monitoring
- **Healthcare Analytics**: Cohort survival analysis, prevalence graphs, patient clustering, hospital KPIs
- **E-Commerce Analytics**: Market basket analysis, order funnel, trend forecasting, price/inventory tracking
- **General Analysis**: Auto EDA, correlation heatmap, GPT-driven insights, auto SQL generation

### Backend Features
- Role-based FastAPI routes with modular architecture
- PDF/PNG/Excel/chart downloads
- Real-time logging and error tracking
- User authentication and session management
- Admin panel with user management
- Database support (SQLite for dev, PostgreSQL for prod)
- Docker-ready deployment
- Pydantic validation
- Background task processing

## Quick Start

### Prerequisites
- Python 3.11+
- Docker and Docker Compose (for production deployment)

### Local Development Setup

1. **Clone and navigate to the backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements_fastapi.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run the application:**
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Docker Deployment

1. **Build and run with Docker Compose:**
```bash
docker-compose up --build
```

2. **For production, set environment variables:**
```bash
export OPENAI_API_KEY=your_openai_api_key
export SECRET_KEY=your_secure_secret_key
docker-compose -f docker-compose.yml up --build
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <session_token>
```

### Business Analyst Endpoints

#### Upload File
```http
POST /api/analyze/business/upload
Authorization: Bearer <session_token>
Content-Type: multipart/form-data

file: <csv/xlsx/json_file>
```

#### Run Analysis
```http
POST /api/analyze/business/analyze/{analysis_id}
Authorization: Bearer <session_token>
```

#### Get Analysis Results
```http
GET /api/analyze/business/analyses/{analysis_id}
Authorization: Bearer <session_token>
```

#### Download Report
```http
GET /api/analyze/business/download/{analysis_id}/{report_type}
Authorization: Bearer <session_token>
```

### Research & EDA Endpoints

Similar structure to Business Analyst endpoints:
- `/api/analyze/research/upload`
- `/api/analyze/research/analyze/{analysis_id}`
- `/api/analyze/research/analyses/{analysis_id}`
- `/api/analyze/research/download/{analysis_id}/{report_type}`

### Admin Endpoints

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_session_token>
```

#### Get System Stats
```http
GET /api/admin/stats
Authorization: Bearer <admin_session_token>
```

#### Get Error Logs
```http
GET /api/admin/errors
Authorization: Bearer <admin_session_token>
```

## Database Schema

### Core Tables
- **users**: User accounts and profiles
- **user_sessions**: Active user sessions
- **analyses**: Analysis records and metadata
- **reports**: Generated report files
- **error_logs**: System error tracking
- **admin_actions**: Admin action audit trail
- **system_stats**: System performance metrics

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL=sqlite:///./datawhiz.db
POSTGRES_URL=postgresql://user:pass@localhost/db

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=52428800
ALLOWED_EXTENSIONS=[".csv", ".xlsx", ".xls", ".json"]

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config/
│   ├── __init__.py
│   └── settings.py         # Configuration settings
├── database/
│   ├── __init__.py
│   ├── database.py         # Database configuration
│   └── models.py           # SQLAlchemy models
├── routers/
│   ├── __init__.py
│   ├── auth_router.py      # Authentication endpoints
│   ├── business_analyst_router.py
│   ├── research_eda_router.py
│   ├── marketing_analytics_router.py
│   ├── financial_analysis_router.py
│   ├── predictive_modeling_router.py
│   ├── healthcare_analytics_router.py
│   ├── ecommerce_analytics_router.py
│   ├── general_analysis_router.py
│   └── admin_router.py     # Admin endpoints
├── services/
│   ├── __init__.py
│   ├── auth_service.py     # Authentication logic
│   ├── business_analyst_service.py
│   ├── research_eda_service.py
│   ├── marketing_analytics_service.py
│   └── error_logging_service.py
├── schemas/
│   ├── __init__.py
│   ├── auth.py             # Authentication schemas
│   └── analysis.py         # Analysis schemas
├── uploads/                # Uploaded files
├── reports/                # Generated reports
├── logs/                   # Application logs
├── requirements_fastapi.txt
├── Dockerfile
├── docker-compose.yml
└── README_FASTAPI.md
```

## Development

### Adding New Analytics Roles

1. Create a new router in `routers/`
2. Create a new service in `services/`
3. Add the router to `main.py`
4. Update the available roles list

### Adding New Analysis Features

1. Extend the service class with new methods
2. Add corresponding endpoints in the router
3. Update schemas if needed
4. Add tests

## Testing

### Run Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/
```

### API Testing
```bash
# Start the server
python main.py

# Test endpoints with curl or Postman
curl -X GET http://localhost:8000/health
```

## Production Deployment

### Docker Deployment
```bash
# Build and run
docker-compose up --build -d

# View logs
docker-compose logs -f fastapi-backend
```

### Environment Setup
1. Set production environment variables
2. Configure PostgreSQL database
3. Set up reverse proxy (nginx)
4. Configure SSL certificates
5. Set up monitoring and logging

### Security Considerations
- Change default secret keys
- Use strong passwords
- Enable HTTPS
- Configure CORS properly
- Set up rate limiting
- Monitor error logs
- Regular security updates

## Monitoring and Logging

### Application Logs
- Logs are stored in `logs/app.log`
- Structured logging with timestamps
- Error tracking with stack traces

### System Monitoring
- Health check endpoint: `/health`
- System stats: `/api/admin/stats`
- Error monitoring: `/api/admin/errors`

## Support

For issues and questions:
1. Check the logs in `logs/app.log`
2. Review the API documentation at `/docs`
3. Check system stats via admin endpoints
4. Review error logs for debugging

## License

This project is licensed under the MIT License. 