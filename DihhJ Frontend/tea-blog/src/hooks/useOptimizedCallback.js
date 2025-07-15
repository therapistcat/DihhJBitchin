import { useCallback, useMemo, useRef } from 'react';

// Optimized callback hook that prevents unnecessary re-renders
export const useOptimizedCallback = (callback, deps) => {
  return useCallback(callback, deps);
};

// Memoized value hook
export const useOptimizedMemo = (factory, deps) => {
  return useMemo(factory, deps);
};

// Debounced callback hook
export const useDebouncedCallback = (callback, delay, deps) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]);
};

// Throttled callback hook
export const useThrottledCallback = (callback, delay, deps) => {
  const lastCallRef = useRef(0);

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay, ...deps]);
};

// Previous value hook for comparison
export const usePrevious = (value) => {
  const ref = useRef();
  
  useMemo(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

// Stable reference hook
export const useStableCallback = (callback) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};
