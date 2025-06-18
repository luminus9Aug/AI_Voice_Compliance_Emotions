import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: "https://chat-emotion-and-compliance-analyzer.onrender.com/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          toast.error('Unauthorized access');
          break;
        case 403:
          toast.error('Access forbidden');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 422:
          toast.error(data.message || 'Validation error');
          break;
        case 500:
          toast.error('Server error occurred');
          break;
        default:
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network error - please check your connection');
    } else {
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

export const conversationsApi = {
  getAll: (params = {}) => {
    return api.get('/conversations', { params });
  },
  
  getById: (id) => {
    return api.get(`/conversations/${id}`);
  },
  
  create: (data) => {
    return api.post('/conversations', data);
  },
  
  update: (id, data) => {
    return api.put(`/conversations/${id}`, data);
  },
  
  delete: (id) => {
    return api.delete(`/conversations/${id}`);
  },
  
  reanalyze: (id) => {
    return api.post(`/conversations/${id}/reanalyze`);
  },
  
  getAnalytics: (params = {}) => {
    return api.get('/conversations/analytics/overview', { params });
  },
  
  search: (query, params = {}) => {
    return api.get('/conversations', { 
      params: { search: query, ...params } 
    });
  }
};

export const analysisApi = {
  analyze: (data) => {
    return api.post('/analyze', data);
  },
  
  getRules: () => {
    return api.get('/analyze/rules');
  },
  
  getStats: (params = {}) => {
    return api.get('/analyze/stats', { params });
  },
  
  getEmotions: (params = {}) => {
    return api.get('/analyze/emotions', { params });
  },
  
  getCompliance: (params = {}) => {
    return api.get('/analyze/compliance', { params });
  },
  
  getAgents: (params = {}) => {
    return api.get('/analyze/agents', { params });
  },
  
  batchAnalyze: (conversations) => {
    return api.post('/analyze/batch', { conversations });
  }
};

export const apiCall = async (apiFunction, successMessage = null) => {
  try {
    const response = await apiFunction();
    if (successMessage) {
      toast.success(successMessage);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const apiCallWithLoading = async (
  apiFunction, 
  setLoading, 
  successMessage = null
) => {
  try {
    setLoading(true);
    const response = await apiFunction();
    if (successMessage) {
      toast.success(successMessage);
    }
    return response.data;
  } catch (error) {
    throw error;
  } finally {
    setLoading(false);
  }
};

export default api;