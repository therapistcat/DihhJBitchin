import axios from 'axios';

// Base API configuration
const getApiBaseUrl = () => {
  // Always use environment variable if set
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Use local backend in development, production backend in production
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }

  return 'https://dihhjbitchin-backend.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for production
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server might be starting up');
    } else if (error.response?.status === 500) {
      console.error('Server error - please try again later');
    } else if (!error.response) {
      console.error('Network error - check your connection and CORS settings');
    } else if (error.response?.status === 404) {
      console.error('Endpoint not found - check API routes');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
};

// Tea API calls
export const teaAPI = {
  // Get list of tea posts with filtering and pagination
  getTeaPosts: async (params = {}) => {
    const response = await api.get('/tea/list', { params });
    return response.data;
  },
  
  // Get single tea post
  getTeaPost: async (teaId) => {
    const response = await api.get(`/tea/${teaId}`);
    return response.data;
  },
  
  // Create new tea post
  createTeaPost: async (teaData, username) => {
    const response = await api.post(`/tea/create?username=${username}`, teaData);
    return response.data;
  },
  
  // Update tea post
  updateTeaPost: async (teaId, teaData, username) => {
    const response = await api.put(`/tea/${teaId}?username=${username}`, teaData);
    return response.data;
  },
  
  // Delete tea post
  deleteTeaPost: async (teaId, username) => {
    const response = await api.delete(`/tea/${teaId}?username=${username}`);
    return response.data;
  },
  
  // Vote on tea post
  voteOnTea: async (teaId, voteType, username) => {
    const response = await api.post(`/tea/${teaId}/vote?username=${username}`, {
      vote_type: voteType
    });
    return response.data;
  },

  // Get user's vote status for a tea post
  getUserVoteStatus: async (teaId, username) => {
    const response = await api.get(`/tea/${teaId}/user-vote?username=${username}`);
    return response.data;
  },
  
  // Get tea tags
  getTags: async () => {
    const response = await api.get('/tea/tags');
    return response.data;
  },
  
  // Get batch statistics
  getBatches: async () => {
    const response = await api.get('/tea/batches');
    return response.data;
  }
};

// Comments (Bitch) API calls
export const commentsAPI = {
  // Get comments for a tea post
  getComments: async (teaId, params = {}) => {
    const response = await api.get(`/bitch/${teaId}/list`, { params });
    return response.data;
  },
  
  // Create new comment
  createComment: async (teaId, commentData, username) => {
    const response = await api.post(`/bitch/${teaId}/create?username=${username}`, commentData);
    return response.data;
  },
  
  // Update comment
  updateComment: async (commentId, commentData, username) => {
    const response = await api.put(`/bitch/comment/${commentId}?username=${username}`, commentData);
    return response.data;
  },
  
  // Delete comment
  deleteComment: async (commentId, username) => {
    const response = await api.delete(`/bitch/comment/${commentId}?username=${username}`);
    return response.data;
  },
  
  // Vote on comment
  voteOnComment: async (commentId, voteType, username) => {
    const response = await api.post(`/bitch/comment/${commentId}/vote?vote_type=${voteType}&username=${username}`);
    return response.data;
  },

  // Get user's vote status for a comment
  getUserCommentVoteStatus: async (commentId, username) => {
    const response = await api.get(`/bitch/comment/${commentId}/user-vote?username=${username}`);
    return response.data;
  },
  
  // Get user's comments
  getUserComments: async (username, params = {}) => {
    const response = await api.get(`/bitch/user/${username}`, { params });
    return response.data;
  }
};

export default api;
