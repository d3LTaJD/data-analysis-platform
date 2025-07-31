# 🚀 DataWhiz - Full-Stack Data Analysis Platform

A comprehensive data analysis platform built with React frontend and Flask backend, designed for business analysts, researchers, and data scientists.

## 🌟 Features

### 📊 **Data Analysis Capabilities**
- **File Upload & Processing**: Support for CSV, Excel, and JSON files
- **Data Cleaning**: Automated data quality assessment and cleaning
- **Chart Visualizations**: Interactive charts and graphs using Plotly
- **AI Insights**: OpenAI-powered data analysis and insights
- **Natural Language Queries**: Ask questions about your data in plain English

### 👥 **Role-Based Dashboards**
- **Business Analyst**: Sales analysis, market trends, KPI tracking
- **Healthcare Analytics**: Patient data analysis, medical insights
- **Financial Analysis**: Investment analysis, risk assessment
- **Marketing Analytics**: Campaign performance, customer segmentation
- **E-commerce Analytics**: Sales trends, inventory management
- **Research & EDA**: Exploratory data analysis tools

### 🔧 **Technical Features**
- **Real-time Processing**: Live data analysis and updates
- **Export Capabilities**: Download reports in multiple formats
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Professional dark UI with blue accents
- **Authentication System**: Secure user login and registration

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Flask** (Python) web framework
- **FastAPI** alternative implementation
- **SQLAlchemy** for database operations
- **Pandas** for data manipulation
- **NumPy** for numerical computing
- **Plotly** for data visualization
- **OpenAI API** for AI insights

## 📦 Installation

### Prerequisites
- Python 3.8+ (`py` command)
- Node.js 16+ and npm
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/d3LTaJD/data-analysis-platform.git
   cd data-analysis-platform
   ```

2. **Navigate to the project directory**
   ```bash
   cd new/project
   ```

3. **Run the full-stack startup script**
   ```bash
   py start_fastapi_fullstack.py
   ```

   This script will:
   - Check dependencies
   - Set up Python virtual environment
   - Install Python packages
   - Install npm dependencies
   - Start both backend and frontend servers

### Manual Setup

#### Backend Setup
```bash
cd new/project/backend
py -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
py start_fastapi.py
```

#### Frontend Setup
```bash
cd new/project
npm install
npm run dev
```

## 🚀 Usage

### Starting the Application

1. **Automatic Setup** (Recommended)
   ```bash
   py start_fastapi_fullstack.py
   ```

2. **Manual Setup**
   - Start backend: `py start_fastapi.py` (in backend directory)
   - Start frontend: `npm run dev` (in project root)

### Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Using the Platform

1. **Upload Data**: Drag and drop CSV, Excel, or JSON files
2. **Choose Role**: Select your analysis role (Business Analyst, Healthcare, etc.)
3. **Analyze Data**: Use the interactive dashboard for data exploration
4. **Get AI Insights**: Click the AI button for automated analysis
5. **Export Results**: Download reports and visualizations

## 📁 Project Structure

```
data-analysis-platform/
├── new/project/                 # Main project directory
│   ├── backend/                 # Flask/FastAPI backend
│   │   ├── routers/            # API route handlers
│   │   ├── services/           # Business logic services
│   │   ├── schemas/            # Data models
│   │   ├── database/           # Database configuration
│   │   └── requirements.txt    # Python dependencies
│   ├── src/                    # React frontend source
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   └── start_fastapi_fullstack.py  # Main startup script
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./datawhiz.db
SECRET_KEY=your_secret_key_here
```

### API Keys Required

- **OpenAI API Key**: For AI-powered insights and analysis
  - Get one at: https://platform.openai.com/api-keys

## 🎨 Customization

### Themes
The application uses a professional dark theme with blue accents. You can customize colors in:
- `src/index.css` - Global styles
- `tailwind.config.js` - Tailwind configuration

### Adding New Analysis Roles
1. Add role definition in `src/data/roles.ts`
2. Create role-specific components in `src/components/`
3. Add backend services in `backend/services/`

## 🚀 Deployment

### Frontend (Netlify)
The project includes `netlify.toml` for easy deployment to Netlify.

### Backend (Heroku/Railway)
- Use `requirements.txt` for Python dependencies
- Set environment variables in your hosting platform
- Configure database URL for production

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

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/d3LTaJD/data-analysis-platform/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

---

**Made with ❤️ by d3LTaJD**

*Transform your data into actionable insights with DataWhiz!* 