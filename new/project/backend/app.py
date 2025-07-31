from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_compress import Compress
import sqlite3
import json
import traceback
import os
import pandas as pd
from datetime import datetime
from config import config
from auth_service import AuthService
from admin_service import AdminService
from business_analysis_service import BusinessAnalysisService

app = Flask(__name__)

# Load configuration
app.config.from_object(config['development'])

# Initialize extensions
CORS(app, origins=app.config['CORS_ORIGINS'])
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
Compress(app)

# Initialize services
auth_service = AuthService(app.config['DATABASE'], app.config['JWT_SECRET_KEY'])
admin_service = AdminService(app.config['DATABASE'], auth_service)
business_analysis_service = BusinessAnalysisService(app.config['DATABASE'])

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def init_db():
    """Initialize database tables"""
    conn = sqlite3.connect(app.config['DATABASE'])
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            role TEXT DEFAULT 'user',
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # User sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Error logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS error_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            error_type TEXT NOT NULL,
            error_message TEXT NOT NULL,
            stack_trace TEXT,
            endpoint TEXT,
            request_data TEXT,
            ip_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Admin actions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_user_id INTEGER NOT NULL,
            action_type TEXT NOT NULL,
            action_details TEXT,
            target_user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_user_id) REFERENCES users (id),
            FOREIGN KEY (target_user_id) REFERENCES users (id)
        )
    ''')
    
    # System stats table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS system_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stat_name TEXT NOT NULL,
            stat_value TEXT NOT NULL,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Business analysis tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS business_analysis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            analysis_name TEXT NOT NULL,
            analysis_type TEXT NOT NULL,
            kpi_metrics TEXT,
            performance_data TEXT,
            insights TEXT,
            recommendations TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS kpi_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            analysis_id INTEGER NOT NULL,
            metric_name TEXT NOT NULL,
            metric_value REAL,
            metric_unit TEXT,
            target_value REAL,
            performance_status TEXT DEFAULT 'good',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (analysis_id) REFERENCES business_analysis (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS business_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            analysis_id INTEGER NOT NULL,
            report_type TEXT NOT NULL,
            report_data TEXT,
            report_format TEXT DEFAULT 'json',
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (analysis_id) REFERENCES business_analysis (id)
        )
    ''')
    
    # Create admin user if not exists
    cursor.execute('SELECT id FROM users WHERE email = ?', ('admin@datawhiz.com',))
    if not cursor.fetchone():
        admin_password_hash = auth_service._hash_password('admin123')
        cursor.execute('''
            INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('admin@datawhiz.com', admin_password_hash, 'Admin', 'User', 'admin', 1))
    
    conn.commit()
    conn.close()

# Initialize database
init_db()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'DataWhiz Backend'
    })

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        result = auth_service.register_user(data)
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        auth_service.log_error({
            'error_type': 'Registration Error',
            'error_message': str(e),
            'stack_trace': traceback.format_exc(),
            'endpoint': '/api/auth/register',
            'request_data': request.get_json(),
            'ip_address': request.remote_addr
        })
        return jsonify({'success': False, 'error': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    """Login user"""
    try:
        data = request.get_json()
        result = auth_service.login_user(data)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 401
            
    except Exception as e:
        auth_service.log_error({
            'error_type': 'Login Error',
            'error_message': str(e),
            'stack_trace': traceback.format_exc(),
            'endpoint': '/api/auth/login',
            'request_data': request.get_json(),
            'ip_address': request.remote_addr
        })
        return jsonify({'success': False, 'error': 'Login failed'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        result = auth_service.logout_user(session_token)
        return jsonify(result), 200
        
    except Exception as e:
        auth_service.log_error({
            'error_type': 'Logout Error',
            'error_message': str(e),
            'stack_trace': traceback.format_exc(),
            'endpoint': '/api/auth/logout',
            'request_data': request.get_json(),
            'ip_address': request.remote_addr
        })
        return jsonify({'success': False, 'error': 'Logout failed'}), 500

@app.route('/api/auth/validate', methods=['POST'])
def validate_session():
    """Validate user session"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        result = auth_service.validate_session(session_token)
        return jsonify(result), 200 if result['success'] else 401
        
    except Exception as e:
        auth_service.log_error({
            'error_type': 'Session Validation Error',
            'error_message': str(e),
            'stack_trace': traceback.format_exc(),
            'endpoint': '/api/auth/validate',
            'request_data': request.get_json(),
            'ip_address': request.remote_addr
        })
        return jsonify({'success': False, 'error': 'Session validation failed'}), 500

@app.route('/api/auth/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        result = auth_service.get_user_profile(session_token)
        return jsonify(result), 200 if result['success'] else 401
        
    except Exception as e:
        auth_service.log_error({
            'error_type': 'Profile Get Error',
            'error_message': str(e),
            'stack_trace': traceback.format_exc(),
            'endpoint': '/api/auth/profile',
            'request_data': request.get_json(),
            'ip_address': request.remote_addr
        })
        return jsonify({'success': False, 'error': 'Failed to get profile'}), 500

@app.route('/api/auth/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        data = request.get_json()
        result = auth_service.update_user_profile(session_token, data)
        return jsonify(result), 200 if result['success'] else 400
        
    except Exception as e:
        auth_service.log_error({
            'error_type': 'Profile Update Error',
            'error_message': str(e),
            'stack_trace': traceback.format_exc(),
            'endpoint': '/api/auth/profile',
            'request_data': request.get_json(),
            'ip_address': request.remote_addr
        })
        return jsonify({'success': False, 'error': 'Failed to update profile'}), 500

# Admin endpoints
@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    """Get all users (admin only)"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        result = admin_service.get_all_users(session_token)
        return jsonify(result), 200 if result['success'] else 403
        
    except Exception as e:
        return jsonify({'success': False, 'error': 'Failed to get users'}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['GET'])
def admin_get_user_details(user_id):
    """Get user details (admin only)"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        result = admin_service.get_user_details(session_token, user_id)
        return jsonify(result), 200 if result['success'] else 403
        
    except Exception as e:
        return jsonify({'success': False, 'error': 'Failed to get user details'}), 500

@app.route('/api/admin/users/<int:user_id>/role', methods=['PUT'])
def admin_update_user_role(user_id):
    """Update user role (admin only)"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        data = request.get_json()
        result = admin_service.update_user_role(session_token, user_id, data.get('role'))
        return jsonify(result), 200 if result['success'] else 403
        
    except Exception as e:
        return jsonify({'success': False, 'error': 'Failed to update user role'}), 500

@app.route('/api/admin/users/<int:user_id>/status', methods=['PUT'])
def admin_toggle_user_status(user_id):
    """Toggle user status (admin only)"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        result = admin_service.toggle_user_status(session_token, user_id)
        return jsonify(result), 200 if result['success'] else 403
        
    except Exception as e:
        return jsonify({'success': False, 'error': 'Failed to toggle user status'}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def admin_delete_user(user_id):
    """Delete user (admin only)"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        result = admin_service.delete_user(session_token, user_id)
        return jsonify(result), 200 if result['success'] else 403
        
    except Exception as e:
        return jsonify({'success': False, 'error': 'Failed to delete user'}), 500

@app.route('/api/admin/stats', methods=['GET'])
def admin_get_stats():
    """Get system stats (admin only)"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        result = admin_service.get_system_stats(session_token)
        return jsonify(result), 200 if result['success'] else 403
        
    except Exception as e:
        return jsonify({'success': False, 'error': 'Failed to get system stats'}), 500

@app.route('/api/admin/errors', methods=['GET'])
def admin_get_errors():
    """Get error logs (admin only)"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        limit = request.args.get('limit', 50, type=int)
        result = admin_service.get_error_logs(session_token, limit)
        return jsonify(result), 200 if result['success'] else 403
        
    except Exception as e:
        return jsonify({'success': False, 'error': 'Failed to get error logs'}), 500

@app.route('/api/admin/actions', methods=['GET'])
def admin_get_actions():
    """Get admin actions (admin only)"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        limit = request.args.get('limit', 50, type=int)
        result = admin_service.get_admin_actions(session_token, limit)
        return jsonify(result), 200 if result['success'] else 403
        
    except Exception as e:
        return jsonify({'success': False, 'error': 'Failed to get admin actions'}), 500

# Business Analysis endpoints
@app.route('/api/business-analysis/upload', methods=['POST'])
def business_analysis_upload():
    """Upload and analyze business data"""
    try:
        # Get user ID from session token
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        session_result = auth_service.validate_session(session_token)
        if not session_result['success']:
            return jsonify({'success': False, 'error': 'Invalid session'}), 401
        
        user_id = session_result['user']['id']
        
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Validate file type
        if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
            return jsonify({'success': False, 'error': 'Only CSV and Excel files are supported'}), 400
        
        # Save file temporarily
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            file.save(tmp_file.name)
            
            try:
                # Load data
                if file.filename.endswith('.csv'):
                    df = pd.read_csv(tmp_file.name)
                else:
                    df = pd.read_excel(tmp_file.name)
                
                # Clean data
                cleaning_result = business_analysis_service.clean_business_data(df)
                cleaned_df = cleaning_result['cleaned_data']
                
                # Perform analysis
                analysis_results = {}
                
                # Compute KPIs
                kpi_result = business_analysis_service.compute_kpis(cleaned_df)
                analysis_results['kpis'] = kpi_result
                
                # Analyze trends
                trend_result = business_analysis_service.analyze_trends(cleaned_df)
                analysis_results['trends'] = trend_result
                
                # Customer segmentation
                segmentation_result = business_analysis_service.customer_segmentation(cleaned_df)
                analysis_results['segmentation'] = segmentation_result
                
                # Detect anomalies
                anomaly_result = business_analysis_service.detect_anomalies(cleaned_df)
                analysis_results['anomalies'] = anomaly_result
                
                # Generate insights
                insights_result = business_analysis_service.generate_business_insights(cleaned_df, analysis_results)
                analysis_results['insights'] = insights_result
                
                # Generate visualizations
                viz_result = business_analysis_service.generate_visualizations(cleaned_df, analysis_results)
                analysis_results['visualizations'] = viz_result
                
                # Save results
                analysis_name = f"Business Analysis - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
                save_result = business_analysis_service.save_analysis_results(user_id, analysis_name, analysis_results)
                
                # Clean up temp file
                os.unlink(tmp_file.name)
                
                return jsonify({
                    'success': True,
                    'message': 'Business analysis completed successfully',
                    'analysis_name': analysis_name,
                    'cleaning_report': cleaning_result['cleaning_report'],
                    'kpis': kpi_result.get('kpis', {}) if kpi_result['success'] else {},
                    'insights': insights_result.get('insights', []) if insights_result['success'] else [],
                    'recommendations': insights_result.get('recommendations', []) if insights_result['success'] else [],
                    'chart_count': viz_result.get('chart_count', 0) if viz_result['success'] else 0,
                    'analysis_id': save_result.get('analysis_id')
                }), 200
                
            except Exception as analysis_error:
                # Clean up temp file
                os.unlink(tmp_file.name)
                raise analysis_error
                
    except Exception as e:
        # Log the error
        auth_service.log_error({
            'error_type': 'Business Analysis Error',
            'error_message': str(e),
            'stack_trace': traceback.format_exc(),
            'endpoint': '/api/business-analysis/upload',
            'request_data': request.get_json(),
            'ip_address': request.remote_addr
        })
        return jsonify({'success': False, 'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/business-analysis/analyses', methods=['GET'])
def get_business_analyses():
    """Get user's business analyses"""
    try:
        # Get user ID from session token
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        session_result = auth_service.validate_session(session_token)
        if not session_result['success']:
            return jsonify({'success': False, 'error': 'Invalid session'}), 401
        
        user_id = session_result['user']['id']
        
        conn = sqlite3.connect(app.config['DATABASE'])
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, analysis_name, analysis_type, status, created_at, updated_at
            FROM business_analysis
            WHERE user_id = ?
            ORDER BY created_at DESC
        ''', (user_id,))
        
        analyses = []
        for row in cursor.fetchall():
            analyses.append({
                'id': row[0],
                'analysis_name': row[1],
                'analysis_type': row[2],
                'status': row[3],
                'created_at': row[4],
                'updated_at': row[5]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'analyses': analyses,
            'total_count': len(analyses)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to get analyses: {str(e)}'}), 500

@app.route('/api/business-analysis/analyses/<int:analysis_id>', methods=['GET'])
def get_business_analysis_details(analysis_id):
    """Get detailed business analysis results"""
    try:
        # Get user ID from session token
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not session_token:
            return jsonify({'success': False, 'error': 'Authorization header required'}), 401
        
        session_result = auth_service.validate_session(session_token)
        if not session_result['success']:
            return jsonify({'success': False, 'error': 'Invalid session'}), 401
        
        user_id = session_result['user']['id']
        
        conn = sqlite3.connect(app.config['DATABASE'])
        cursor = conn.cursor()
        
        # Get analysis details
        cursor.execute('''
            SELECT id, analysis_name, analysis_type, kpi_metrics, performance_data, 
                   insights, recommendations, status, created_at, updated_at
            FROM business_analysis
            WHERE id = ? AND user_id = ?
        ''', (analysis_id, user_id))
        
        result = cursor.fetchone()
        if not result:
            conn.close()
            return jsonify({'success': False, 'error': 'Analysis not found'}), 404
        
        analysis = {
            'id': result[0],
            'analysis_name': result[1],
            'analysis_type': result[2],
            'kpi_metrics': json.loads(result[3]) if result[3] else {},
            'performance_data': json.loads(result[4]) if result[4] else {},
            'insights': json.loads(result[5]) if result[5] else {},
            'recommendations': json.loads(result[6]) if result[6] else {},
            'status': result[7],
            'created_at': result[8],
            'updated_at': result[9]
        }
        
        # Get KPI metrics
        cursor.execute('''
            SELECT metric_name, metric_value, metric_unit, target_value, performance_status
            FROM kpi_metrics
            WHERE analysis_id = ?
            ORDER BY metric_name
        ''', (analysis_id,))
        
        kpi_metrics = []
        for row in cursor.fetchall():
            kpi_metrics.append({
                'metric_name': row[0],
                'metric_value': row[1],
                'metric_unit': row[2],
                'target_value': row[3],
                'performance_status': row[4]
            })
        
        # Get reports/charts
        cursor.execute('''
            SELECT report_type, report_data, report_format, generated_at
            FROM business_reports
            WHERE analysis_id = ?
            ORDER BY generated_at DESC
        ''', (analysis_id,))
        
        reports = []
        for row in cursor.fetchall():
            reports.append({
                'report_type': row[0],
                'report_data': row[1],
                'report_format': row[2],
                'generated_at': row[3]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'kpi_metrics': kpi_metrics,
            'reports': reports
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to get analysis details: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting DataWhiz Backend Server...")
    print(f"📊 Database: {app.config['DATABASE']}")
    print(f"🌐 CORS Origins: {app.config['CORS_ORIGINS']}")
    print(f"📁 Upload Folder: {app.config['UPLOAD_FOLDER']}")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000) 