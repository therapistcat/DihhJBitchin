import React, { useState, useRef, useEffect } from 'react';
import './Common.css';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '🖼️',
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  return (
    <div 
      ref={imgRef}
      className={`lazy-image-container ${className} ${isLoaded ? 'loaded' : ''} ${hasError ? 'error' : ''}`}
      {...props}
    >
      {!isInView && (
        <div className="lazy-image-placeholder">
          <span className="placeholder-icon">{placeholder}</span>
          <div className="loading-shimmer"></div>
        </div>
      )}
      
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`lazy-image ${isLoaded ? 'fade-in' : ''}`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
      
      {hasError && (
        <div className="lazy-image-error">
          <span className="error-icon">❌</span>
          <span className="error-text">Failed to load image</span>
        </div>
      )}
      
      {!isLoaded && isInView && !hasError && (
        <div className="lazy-image-loading">
          <div className="loading-spinner spinner-small"></div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
