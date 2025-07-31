import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Updated to FastAPI backend

export const apiService = {
  // Health check
  healthCheck: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.data;
    } catch (error: any) {
      console.error('Health check failed:', error.response?.data || error.message);
      return { error: 'Backend is not responding.' };
    }
  },

  // Authentication endpoints
  register: async (userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      return response.data;
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Registration failed.');
    }
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      return response.data;
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Login failed.');
    }
  },

  logout: async (sessionToken: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Logout failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Logout failed.');
    }
  },

  validateSession: async (sessionToken: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/validate`, {}, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Session validation failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Session validation failed.');
    }
  },

  getProfile: async (sessionToken: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get profile failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to get profile.');
    }
  },

  updateProfile: async (sessionToken: string, profileData: {
    first_name?: string;
    last_name?: string;
  }): Promise<any> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Update profile failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to update profile.');
    }
  },

  // Admin endpoints
  adminGetUsers: async (sessionToken: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get users failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to get users.');
    }
  },

  adminGetUserDetails: async (sessionToken: string, userId: number): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get user details failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to get user details.');
    }
  },

  adminUpdateUserRole: async (sessionToken: string, userId: number, role: string): Promise<any> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}/role?role=${role}`, {}, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Update user role failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to update user role.');
    }
  },

  adminToggleUserStatus: async (sessionToken: string, userId: number): Promise<any> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}/status`, {}, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Toggle user status failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to toggle user status.');
    }
  },

  adminDeleteUser: async (sessionToken: string, userId: number): Promise<any> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Delete user failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to delete user.');
    }
  },

  adminGetStats: async (sessionToken: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get stats failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to get system stats.');
    }
  },

  adminGetErrors: async (sessionToken: string, limit: number = 50): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/errors?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get errors failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to get error logs.');
    }
  },

  adminGetActions: async (sessionToken: string, limit: number = 50): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/actions?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get admin actions failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to get admin actions.');
    }
  },

  // Role-specific analysis endpoints
  uploadFile: async (sessionToken: string, file: File, role: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/analyze/${role}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`${role} upload failed:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || `Failed to upload file for ${role} analysis.`);
    }
  },

  runAnalysis: async (sessionToken: string, analysisId: number, role: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze/${role}/analyze/${analysisId}`, {}, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`${role} analysis failed:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || `Failed to run ${role} analysis.`);
    }
  },

  getAnalyses: async (sessionToken: string, role: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analyze/${role}/analyses`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`Get ${role} analyses failed:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || `Failed to get ${role} analyses.`);
    }
  },

  getAnalysisResult: async (sessionToken: string, analysisId: number, role: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analyze/${role}/analyses/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`Get ${role} analysis result failed:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || `Failed to get ${role} analysis result.`);
    }
  },

  downloadReport: async (sessionToken: string, analysisId: number, reportType: string, role: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analyze/${role}/download/${analysisId}/${reportType}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error(`Download ${role} report failed:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || `Failed to download ${role} report.`);
    }
  },

  generateReports: async (sessionToken: string, analysisId: number, role: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze/${role}/generate-reports/${analysisId}`, {}, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`Generate ${role} reports failed:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || `Failed to generate ${role} reports.`);
    }
  },

  // Legacy methods for backward compatibility
  businessAnalysisUpload: async (sessionToken: string, file: File): Promise<any> => {
    return apiService.uploadFile(sessionToken, file, 'business');
  },

  getBusinessAnalyses: async (sessionToken: string): Promise<any> => {
    return apiService.getAnalyses(sessionToken, 'business');
  },

  getBusinessAnalysisDetails: async (sessionToken: string, analysisId: number): Promise<any> => {
    return apiService.getAnalysisResult(sessionToken, analysisId, 'business');
  },

  // Generic analysis methods
  cleanData: async (role: string, sessionToken: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze/${role}/clean`, {}, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error cleaning data:', error.response?.data || error.message);
      return { error: error.response?.data?.detail || 'Failed to clean data.' };
    }
  },

  getAIInsight: async (role: string, question: string, sessionToken: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze/${role}/ai-insight`, {
        question: question
      }, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting AI insight:', error.response?.data || error.message);
      return { error: error.response?.data?.detail || 'Failed to get AI insight.' };
    }
  },

  previewData: async (role: string, sessionToken: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analyze/${role}/preview`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error previewing data:', error.response?.data || error.message);
      return { error: error.response?.data?.detail || 'Failed to preview data.' };
    }
  },

  downloadData: async (role: string, downloadType: string, format: string, sessionToken: string, payload?: any): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze/${role}/download/${downloadType}`, payload || {}, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        },
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error downloading data:', error.response?.data || error.message);
      return { error: error.response?.data?.detail || 'Failed to download data.' };
    }
  },

  // Additional utility methods
  getAvailableRoles: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/`);
      return response.data.available_roles || [];
    } catch (error: any) {
      console.error('Error getting available roles:', error.response?.data || error.message);
      return [];
    }
  },

  // Placeholder methods for future features
  naturalLanguageQuery: async (role: string, payload: { query: string; sessionToken: string }): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze/${role}/nlq`, {
        query: payload.query
      }, {
        headers: {
          'Authorization': `Bearer ${payload.sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error with natural language query:', error.response?.data || error.message);
      return { type: 'error', message: error.response?.data?.detail || 'Failed to process natural language query.' };
    }
  },

  assessDataQuality: async (role: string, sessionToken: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze/${role}/data-quality`, {}, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error assessing data quality:', error.response?.data || error.message);
      return { error: error.response?.data?.detail || 'Failed to assess data quality.' };
    }
  },

  generateDecisionIntelligence: async (role: string, sessionToken: string, analysisContext?: any): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze/${role}/decision-intelligence`, {
        analysis_context: analysisContext
      }, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error generating decision intelligence:', error.response?.data || error.message);
      return { error: error.response?.data?.detail || 'Failed to generate decision intelligence.' };
    }
  },
};