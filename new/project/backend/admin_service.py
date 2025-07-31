import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List
from auth_service import AuthService

class AdminService:
    """Service for handling admin operations"""
    
    def __init__(self, db_path: str, auth_service: AuthService):
        self.db_path = db_path
        self.auth_service = auth_service
    
    def _get_db_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def _log_admin_action(self, admin_id: int, action_type: str, target_user_id: int = None, action_details: str = None, ip_address: str = None):
        """Log an admin action"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO admin_actions (admin_id, action_type, target_user_id, action_details, ip_address)
                VALUES (?, ?, ?, ?, ?)
            ''', (admin_id, action_type, target_user_id, action_details, ip_address))
            
            conn.commit()
            conn.close()
        except Exception:
            # Don't let admin action logging fail the main operation
            pass
    
    def _is_admin(self, user_id: int) -> bool:
        """Check if user is an admin"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('SELECT role FROM users WHERE id = ? AND is_active = 1', (user_id,))
            result = cursor.fetchone()
            conn.close()
            
            return result and result[0] in ['admin', 'super_admin']
        except Exception:
            return False
    
    def get_all_users(self, admin_id: int) -> Dict[str, Any]:
        """Get all users (admin only)"""
        try:
            if not self._is_admin(admin_id):
                return {'success': False, 'error': 'Admin access required'}
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at
                FROM users
                ORDER BY created_at DESC
            ''')
            
            users = []
            for row in cursor.fetchall():
                users.append({
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'first_name': row[3],
                    'last_name': row[4],
                    'role': row[5],
                    'is_active': bool(row[6]),
                    'created_at': row[7],
                    'updated_at': row[8]
                })
            
            conn.close()
            
            # Log admin action
            self._log_admin_action(admin_id, 'view_all_users', action_details=f'Viewed {len(users)} users')
            
            return {
                'success': True,
                'users': users,
                'total_count': len(users)
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Failed to get users: {str(e)}'}
    
    def get_user_details(self, admin_id: int, target_user_id: int) -> Dict[str, Any]:
        """Get detailed user information (admin only)"""
        try:
            if not self._is_admin(admin_id):
                return {'success': False, 'error': 'Admin access required'}
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            # Get user details
            cursor.execute('''
                SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at
                FROM users
                WHERE id = ?
            ''', (target_user_id,))
            
            user = cursor.fetchone()
            if not user:
                conn.close()
                return {'success': False, 'error': 'User not found'}
            
            user_data = {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'first_name': user[3],
                'last_name': user[4],
                'role': user[5],
                'is_active': bool(user[6]),
                'created_at': user[7],
                'updated_at': user[8]
            }
            
            # Get user sessions
            cursor.execute('''
                SELECT session_token, expires_at, created_at
                FROM user_sessions
                WHERE user_id = ?
                ORDER BY created_at DESC
            ''', (target_user_id,))
            
            sessions = []
            for row in cursor.fetchall():
                sessions.append({
                    'session_token': row[0][:20] + '...',  # Truncate for security
                    'expires_at': row[1],
                    'created_at': row[2]
                })
            
            # Get user error logs
            cursor.execute('''
                SELECT error_type, error_message, endpoint, created_at
                FROM error_logs
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 10
            ''', (target_user_id,))
            
            error_logs = []
            for row in cursor.fetchall():
                error_logs.append({
                    'error_type': row[0],
                    'error_message': row[1],
                    'endpoint': row[2],
                    'created_at': row[3]
                })
            
            conn.close()
            
            # Log admin action
            self._log_admin_action(admin_id, 'view_user_details', target_user_id)
            
            return {
                'success': True,
                'user': user_data,
                'active_sessions': sessions,
                'recent_errors': error_logs
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Failed to get user details: {str(e)}'}
    
    def update_user_role(self, admin_id: int, target_user_id: int, new_role: str) -> Dict[str, Any]:
        """Update user role (admin only)"""
        try:
            if not self._is_admin(admin_id):
                return {'success': False, 'error': 'Admin access required'}
            
            # Validate role
            valid_roles = ['user', 'admin', 'super_admin']
            if new_role not in valid_roles:
                return {'success': False, 'error': 'Invalid role'}
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            # Get current role
            cursor.execute('SELECT role FROM users WHERE id = ?', (target_user_id,))
            result = cursor.fetchone()
            
            if not result:
                conn.close()
                return {'success': False, 'error': 'User not found'}
            
            old_role = result[0]
            
            # Update role
            cursor.execute('''
                UPDATE users 
                SET role = ?, updated_at = ?
                WHERE id = ?
            ''', (new_role, datetime.utcnow(), target_user_id))
            
            conn.commit()
            conn.close()
            
            # Log admin action
            self._log_admin_action(
                admin_id, 
                'update_user_role', 
                target_user_id, 
                f'Changed role from {old_role} to {new_role}'
            )
            
            return {
                'success': True,
                'message': f'User role updated from {old_role} to {new_role}'
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Failed to update user role: {str(e)}'}
    
    def toggle_user_status(self, admin_id: int, target_user_id: int) -> Dict[str, Any]:
        """Toggle user active status (admin only)"""
        try:
            if not self._is_admin(admin_id):
                return {'success': False, 'error': 'Admin access required'}
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            # Get current status
            cursor.execute('SELECT is_active, username FROM users WHERE id = ?', (target_user_id,))
            result = cursor.fetchone()
            
            if not result:
                conn.close()
                return {'success': False, 'error': 'User not found'}
            
            current_status = result[0]
            username = result[1]
            new_status = not current_status
            
            # Update status
            cursor.execute('''
                UPDATE users 
                SET is_active = ?, updated_at = ?
                WHERE id = ?
            ''', (new_status, datetime.utcnow(), target_user_id))
            
            # If deactivating, also invalidate all sessions
            if not new_status:
                cursor.execute('DELETE FROM user_sessions WHERE user_id = ?', (target_user_id,))
            
            conn.commit()
            conn.close()
            
            # Log admin action
            action = 'deactivated' if not new_status else 'activated'
            self._log_admin_action(
                admin_id, 
                'toggle_user_status', 
                target_user_id, 
                f'User {action}'
            )
            
            return {
                'success': True,
                'message': f'User {username} {action}',
                'new_status': new_status
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Failed to toggle user status: {str(e)}'}
    
    def delete_user(self, admin_id: int, target_user_id: int) -> Dict[str, Any]:
        """Delete user (admin only)"""
        try:
            if not self._is_admin(admin_id):
                return {'success': False, 'error': 'Admin access required'}
            
            if admin_id == target_user_id:
                return {'success': False, 'error': 'Cannot delete yourself'}
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            # Get user info for logging
            cursor.execute('SELECT username FROM users WHERE id = ?', (target_user_id,))
            result = cursor.fetchone()
            
            if not result:
                conn.close()
                return {'success': False, 'error': 'User not found'}
            
            username = result[0]
            
            # Delete user data (cascade delete)
            cursor.execute('DELETE FROM user_sessions WHERE user_id = ?', (target_user_id,))
            cursor.execute('DELETE FROM error_logs WHERE user_id = ?', (target_user_id,))
            cursor.execute('DELETE FROM users WHERE id = ?', (target_user_id,))
            
            conn.commit()
            conn.close()
            
            # Log admin action
            self._log_admin_action(
                admin_id, 
                'delete_user', 
                target_user_id, 
                f'Deleted user: {username}'
            )
            
            return {
                'success': True,
                'message': f'User {username} deleted successfully'
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Failed to delete user: {str(e)}'}
    
    def get_system_stats(self, admin_id: int) -> Dict[str, Any]:
        """Get system statistics (admin only)"""
        try:
            if not self._is_admin(admin_id):
                return {'success': False, 'error': 'Admin access required'}
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            # Get user statistics
            cursor.execute('SELECT COUNT(*) FROM users')
            total_users = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM users WHERE is_active = 1')
            active_users = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM user_sessions WHERE expires_at > ?', (datetime.utcnow(),))
            active_sessions = cursor.fetchone()[0]
            
            # Get recent registrations
            cursor.execute('''
                SELECT COUNT(*) FROM users 
                WHERE created_at >= date('now', '-7 days')
            ''')
            new_users_week = cursor.fetchone()[0]
            
            # Get error statistics
            cursor.execute('SELECT COUNT(*) FROM error_logs')
            total_errors = cursor.fetchone()[0]
            
            cursor.execute('''
                SELECT COUNT(*) FROM error_logs 
                WHERE created_at >= date('now', '-24 hours')
            ''')
            errors_today = cursor.fetchone()[0]
            
            # Get admin actions
            cursor.execute('''
                SELECT COUNT(*) FROM admin_actions 
                WHERE created_at >= date('now', '-7 days')
            ''')
            admin_actions_week = cursor.fetchone()[0]
            
            conn.close()
            
            stats = {
                'users': {
                    'total': total_users,
                    'active': active_users,
                    'inactive': total_users - active_users,
                    'new_this_week': new_users_week
                },
                'sessions': {
                    'active': active_sessions
                },
                'errors': {
                    'total': total_errors,
                    'last_24h': errors_today
                },
                'admin_actions': {
                    'this_week': admin_actions_week
                }
            }
            
            return {
                'success': True,
                'stats': stats,
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Failed to get system stats: {str(e)}'}
    
    def get_error_logs(self, admin_id: int, limit: int = 50) -> Dict[str, Any]:
        """Get error logs (admin only)"""
        try:
            if not self._is_admin(admin_id):
                return {'success': False, 'error': 'Admin access required'}
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT el.id, el.error_type, el.error_message, el.endpoint, el.ip_address, el.created_at,
                       u.username, u.email
                FROM error_logs el
                LEFT JOIN users u ON el.user_id = u.id
                ORDER BY el.created_at DESC
                LIMIT ?
            ''', (limit,))
            
            errors = []
            for row in cursor.fetchall():
                errors.append({
                    'id': row[0],
                    'error_type': row[1],
                    'error_message': row[2],
                    'endpoint': row[3],
                    'ip_address': row[4],
                    'created_at': row[5],
                    'user': {
                        'username': row[6],
                        'email': row[7]
                    } if row[6] else None
                })
            
            conn.close()
            
            return {
                'success': True,
                'errors': errors,
                'total_count': len(errors)
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Failed to get error logs: {str(e)}'}
    
    def get_admin_actions(self, admin_id: int, limit: int = 50) -> Dict[str, Any]:
        """Get admin action logs (admin only)"""
        try:
            if not self._is_admin(admin_id):
                return {'success': False, 'error': 'Admin access required'}
            
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT aa.id, aa.action_type, aa.action_details, aa.ip_address, aa.created_at,
                       admin.username as admin_username,
                       target.username as target_username
                FROM admin_actions aa
                LEFT JOIN users admin ON aa.admin_id = admin.id
                LEFT JOIN users target ON aa.target_user_id = target.id
                ORDER BY aa.created_at DESC
                LIMIT ?
            ''', (limit,))
            
            actions = []
            for row in cursor.fetchall():
                actions.append({
                    'id': row[0],
                    'action_type': row[1],
                    'action_details': row[2],
                    'ip_address': row[3],
                    'created_at': row[4],
                    'admin_username': row[5],
                    'target_username': row[6]
                })
            
            conn.close()
            
            return {
                'success': True,
                'actions': actions,
                'total_count': len(actions)
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Failed to get admin actions: {str(e)}'} 