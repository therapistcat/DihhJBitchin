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

// Test connectivity on load
const testConnectivity = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors',
    });

    if (response.ok) {
      console.log('✅ Backend connectivity test passed');
    } else {
      console.warn('⚠️ Backend responding but with error:', response.status);
    }
  } catch (error) {
    console.warn('⚠️ Backend connectivity test failed:', error.message);
    console.log('🔄 This is normal on first load - the backend will be available when needed');
  }
};

// Run connectivity test (non-blocking)
setTimeout(testConnectivity, 1000);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // Increased timeout for better reliability
  withCredentials: false, // Disable credentials for CORS
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

// Retry function for failed requests
const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(`🔄 Retry attempt ${i + 1}/${maxRetries} for request`);

      if (i === maxRetries - 1) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      console.error('🕐 Request timeout - server might be slow');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network error - check connection or CORS');
    } else if (error.response?.status === 500) {
      console.error('🔥 Server error - backend issue');
    } else if (!error.response) {
      console.error('📡 No response - network or CORS issue');
    } else if (error.response?.status === 404) {
      console.error('🔍 Endpoint not found');
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    console.log('🔐 Registering user:', { ...userData, password: '[HIDDEN]' });
    try {
      const response = await api.post('/auth/register', userData);
      console.log('✅ Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      // Try fallback fetch for registration
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Registration fallback successful:', data);
        return data;
      } catch (fetchError) {
        console.error('❌ Registration fallback failed:', fetchError);
        throw fetchError;
      }
    }
  },

  login: async (credentials) => {
    console.log('🔐 Logging in user:', { ...credentials, password: '[HIDDEN]' });
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Try fallback fetch for login
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Login fallback successful:', data);
        return data;
      } catch (fetchError) {
        console.error('❌ Login fallback failed:', fetchError);
        throw fetchError;
      }
    }
  }
};

// Tea API calls
export const teaAPI = {
  // Get list of tea posts with filtering and pagination
  getTeaPosts: async (params = {}) => {
    console.log('🔥 getTeaPosts called with params:', params);
    console.log('🔗 Using API_BASE_URL:', API_BASE_URL);

    try {
      console.log('🔄 Making axios request to /tea/list...');
      const response = await api.get('/tea/list', { params });
      console.log('✅ Axios request successful:', response.data);
      return response.data;
    } catch (axiosError) {
      console.error('❌ Axios failed, trying direct fetch...', axiosError);

      // Fallback to direct fetch with simplified config
      try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/tea/list${queryString ? '?' + queryString : ''}`;
        console.log('🌐 Fallback fetch URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        console.log('📡 Fetch response status:', response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Fetch fallback successful!', data);
        return data;
      } catch (fetchError) {
        console.error('❌ Both axios and fetch failed:', fetchError);
        throw new Error(`Network error: Unable to connect to server. Please check your internet connection.`);
      }
    }
  },
  
  // Get single tea post
  getTeaPost: async (teaId) => {
    try {
      const response = await api.get(`/tea/${teaId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching tea post:', error);
      throw new Error(`Failed to load tea post: ${error.message}`);
    }
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
