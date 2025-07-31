import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DATABASE = os.environ.get('DATABASE') or 'datawhiz.db'
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    
    # CORS settings
    CORS_ORIGINS = [
        'http://localhost:5173',  # Vite dev server
        'http://localhost:3000',  # Alternative dev port
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000'
    ]
    
    # JWT settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    
    # File upload settings
    ALLOWED_EXTENSIONS = {
        'csv', 'xlsx', 'xls', 'json', 'txt', 'parquet'
    }
    
    # Analysis settings
    MAX_FILE_SIZE_MB = 16
    MAX_ROWS_FOR_ANALYSIS = 100000

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    # Add production-specific settings here

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    DATABASE = 'test_datawhiz.db'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 