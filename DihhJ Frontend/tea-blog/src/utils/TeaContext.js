import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Tea Context
const TeaContext = createContext();

// Action types
const TEA_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_POSTS: 'SET_POSTS',
  ADD_POST: 'ADD_POST',
  UPDATE_POST: 'UPDATE_POST',
  DELETE_POST: 'DELETE_POST',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  CACHE_POST: 'CACHE_POST'
};

// Initial state
const initialState = {
  posts: [],
  cachedPosts: new Map(),
  loading: false,
  error: null,
  filters: {
    sort_by: 'hot',
    order: 'desc',
    batch: null,
    search: ''
  },
  pagination: {
    page: 1,
    hasMore: true,
    total: 0
  }
};

// Reducer
const teaReducer = (state, action) => {
  switch (action.type) {
    case TEA_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case TEA_ACTIONS.SET_POSTS:
      return {
        ...state,
        posts: action.payload.posts,
        pagination: {
          ...state.pagination,
          ...action.payload.pagination
        },
        loading: false,
        error: null
      };

    case TEA_ACTIONS.ADD_POST:
      const newPost = action.payload;
      const updatedCachedPosts = new Map(state.cachedPosts);
      updatedCachedPosts.set(newPost.id, newPost);
      
      return {
        ...state,
        posts: [newPost, ...state.posts],
        cachedPosts: updatedCachedPosts
      };

    case TEA_ACTIONS.UPDATE_POST:
      const updatedPost = action.payload;
      const updatedCachedPostsMap = new Map(state.cachedPosts);
      updatedCachedPostsMap.set(updatedPost.id, updatedPost);
      
      return {
        ...state,
        posts: state.posts.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        ),
        cachedPosts: updatedCachedPostsMap
      };

    case TEA_ACTIONS.DELETE_POST:
      const postIdToDelete = action.payload;
      const cachedPostsAfterDelete = new Map(state.cachedPosts);
      cachedPostsAfterDelete.delete(postIdToDelete);
      
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== postIdToDelete),
        cachedPosts: cachedPostsAfterDelete
      };

    case TEA_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case TEA_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case TEA_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        },
        pagination: {
          ...state.pagination,
          page: 1 // Reset pagination when filters change
        }
      };

    case TEA_ACTIONS.CACHE_POST:
      const postToCache = action.payload;
      const newCachedPosts = new Map(state.cachedPosts);
      newCachedPosts.set(postToCache.id, postToCache);
      
      return {
        ...state,
        cachedPosts: newCachedPosts
      };

    default:
      return state;
  }
};

// Provider component
export const TeaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(teaReducer, initialState);

  // Actions
  const setLoading = useCallback((loading) => {
    dispatch({ type: TEA_ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setPosts = useCallback((posts, pagination = {}) => {
    dispatch({ 
      type: TEA_ACTIONS.SET_POSTS, 
      payload: { posts, pagination } 
    });
  }, []);

  const addPost = useCallback((post) => {
    dispatch({ type: TEA_ACTIONS.ADD_POST, payload: post });
  }, []);

  const updatePost = useCallback((post) => {
    dispatch({ type: TEA_ACTIONS.UPDATE_POST, payload: post });
  }, []);

  const deletePost = useCallback((postId) => {
    dispatch({ type: TEA_ACTIONS.DELETE_POST, payload: postId });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: TEA_ACTIONS.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: TEA_ACTIONS.CLEAR_ERROR });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: TEA_ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  const cachePost = useCallback((post) => {
    dispatch({ type: TEA_ACTIONS.CACHE_POST, payload: post });
  }, []);

  const getCachedPost = useCallback((postId) => {
    return state.cachedPosts.get(postId);
  }, [state.cachedPosts]);

  const value = {
    ...state,
    setLoading,
    setPosts,
    addPost,
    updatePost,
    deletePost,
    setError,
    clearError,
    setFilters,
    cachePost,
    getCachedPost
  };

  return (
    <TeaContext.Provider value={value}>
      {children}
    </TeaContext.Provider>
  );
};

// Hook to use tea context
export const useTea = () => {
  const context = useContext(TeaContext);
  if (!context) {
    throw new Error('useTea must be used within a TeaProvider');
  }
  return context;
};

export default TeaContext;
