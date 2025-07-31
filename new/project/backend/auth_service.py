import sqlite3
import bcrypt
import jwt
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import json

class AuthService:
    """Service for handling user authentication and authorization"""
    
    def __init__(self, db_path: str, jwt_secret: str):
        self.db_path = db_path
        self.jwt_secret = jwt_secret
        self.token_expiry_hours = 24
    
    def _get_db_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def _hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def _verify_password(self, password: str, hashed: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def _generate_session_token(self) -> str:
        """Generate a secure session token"""
        return secrets.token_urlsafe(32)
    
    def _create_jwt_token(self, user_id: int, username: str, role: str) -> str:
        """Create a JWT token for the user"""
        payload = {
            'user_id': user_id,
            'username': username,
            'role': role,
            'exp': datetime.utcnow() + timedelta(hours=self.token_expiry_hours)
        }
        return jwt.encode(payload, self.jwt_secret, algorithm='HS256')
    
    def register_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new user"""
        try:
            # Validate required fields
            required_fields = ['username', 'email', 'password']
            for field in required_fields:
                if not user_data.get(field):
                    return {'success': False, 'error': f'{field} is required'}
            
            username = user_data['username'].strip()
            email = user_data['email'].strip().lower()
            password = user_data['password']
            
            # Validate password strength
            if len(password) < 8:
                return {'success': False, 'error': 'Password must be at least 8 characters long'}
            
            # Validate email format (basic)
            if '@' not in email or '.' not in email:
                return {'success': False, 'error': 'Invalid email format'}
            
            # Hash password
            password_hash = self._hash_password(password)
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            # Check if username or email already exists
            cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
            existing_user = cursor.fetchone()
            
            if existing_user:
                conn.close()
                return {'success': False, 'error': 'Username or email already exists'}
            
            # Insert new user
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, first_name, last_name, role)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                username,
                email,
                password_hash,
                user_data.get('first_name', ''),
                user_data.get('last_name', ''),
                user_data.get('role', 'user')
            ))
            
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'message': 'User registered successfully',
                'user_id': user_id,
                'username': username
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Registration failed: {str(e)}'}
    
    def login_user(self, credentials: Dict[str, Any]) -> Dict[str, Any]:
        """Authenticate and login a user"""
        try:
            username = credentials.get('username', '').strip()
            password = credentials.get('password', '')
            
            if not username or not password:
                return {'success': False, 'error': 'Username and password are required'}
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            # Find user by username or email
            cursor.execute('''
                SELECT id, username, email, password_hash, role, is_active
                FROM users 
                WHERE (username = ? OR email = ?) AND is_active = 1
            ''', (username, username))
            
            user = cursor.fetchone()
            
            if not user:
                conn.close()
                return {'success': False, 'error': 'Invalid username or password'}
            
            user_id, db_username, email, password_hash, role, is_active = user
            
            # Verify password
            if not self._verify_password(password, password_hash):
                conn.close()
                return {'success': False, 'error': 'Invalid username or password'}
            
            # Generate session token
            session_token = self._generate_session_token()
            expires_at = datetime.utcnow() + timedelta(hours=self.token_expiry_hours)
            
            # Save session
            cursor.execute('''
                INSERT INTO user_sessions (user_id, session_token, expires_at)
                VALUES (?, ?, ?)
            ''', (user_id, session_token, expires_at))
            
            # Create JWT token
            jwt_token = self._create_jwt_token(user_id, db_username, role)
            
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user_id,
                    'username': db_username,
                    'email': email,
                    'role': role
                },
                'session_token': session_token,
                'jwt_token': jwt_token,
                'expires_at': expires_at.isoformat()
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Login failed: {str(e)}'}
    
    def logout_user(self, session_token: str) -> Dict[str, Any]:
        """Logout a user by invalidating their session"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM user_sessions WHERE session_token = ?', (session_token,))
            
            conn.commit()
            conn.close()
            
            return {'success': True, 'message': 'Logout successful'}
            
        except Exception as e:
            return {'success': False, 'error': f'Logout failed: {str(e)}'}
    
    def validate_session(self, session_token: str) -> Dict[str, Any]:
        """Validate a user session"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT us.user_id, us.expires_at, u.username, u.email, u.role
                FROM user_sessions us
                JOIN users u ON us.user_id = u.id
                WHERE us.session_token = ? AND us.expires_at > ?
            ''', (session_token, datetime.utcnow()))
            
            session = cursor.fetchone()
            conn.close()
            
            if not session:
                return {'success': False, 'error': 'Invalid or expired session'}
            
            user_id, expires_at, username, email, role = session
            
            return {
                'success': True,
                'user': {
                    'id': user_id,
                    'username': username,
                    'email': email,
                    'role': role
                },
                'expires_at': expires_at
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Session validation failed: {str(e)}'}
    
    def get_user_profile(self, user_id: int) -> Dict[str, Any]:
        """Get user profile information"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, first_name, last_name, role, created_at
                FROM users 
                WHERE id = ? AND is_active = 1
            ''', (user_id,))
            
            user = cursor.fetchone()
            conn.close()
            
            if not user:
                return {'success': False, 'error': 'User not found'}
            
            user_id, username, email, first_name, last_name, role, created_at = user
            
            return {
                'success': True,
                'user': {
                    'id': user_id,
                    'username': username,
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': role,
                    'created_at': created_at
                }
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Failed to get user profile: {str(e)}'}
    
    def update_user_profile(self, user_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile information"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            # Build update query dynamically
            allowed_fields = ['first_name', 'last_name', 'email']
            update_fields = []
            update_values = []
            
            for field in allowed_fields:
                if field in update_data:
                    update_fields.append(f'{field} = ?')
                    update_values.append(update_data[field])
            
            if not update_fields:
                conn.close()
                return {'success': False, 'error': 'No valid fields to update'}
            
            update_values.append(datetime.utcnow())  # updated_at
            update_values.append(user_id)  # WHERE clause
            
            query = f'''
                UPDATE users 
                SET {', '.join(update_fields)}, updated_at = ?
                WHERE id = ?
            '''
            
            cursor.execute(query, update_values)
            conn.commit()
            conn.close()
            
            return {'success': True, 'message': 'Profile updated successfully'}
            
        except Exception as e:
            return {'success': False, 'error': f'Profile update failed: {str(e)}'}
    
    def log_error(self, error_data: Dict[str, Any]) -> None:
        """Log an error to the database"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO error_logs (user_id, error_type, error_message, stack_trace, endpoint, request_data, ip_address)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                error_data.get('user_id'),
                error_data.get('error_type', 'Unknown'),
                error_data.get('error_message', ''),
                error_data.get('stack_trace', ''),
                error_data.get('endpoint', ''),
                json.dumps(error_data.get('request_data', {})),
                error_data.get('ip_address', '')
            ))
            
            conn.commit()
            conn.close()
            
        except Exception:
            # Don't let error logging fail the main operation
            pass 