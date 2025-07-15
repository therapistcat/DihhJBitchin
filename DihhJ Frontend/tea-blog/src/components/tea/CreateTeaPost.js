import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { teaAPI } from '../../services/api';
import ImageUpload from '../common/ImageUpload';
import './Tea.css';

const CreateTeaPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tag: '' // Changed from tags array to single tag string
  });
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const availableTags = ['general', 'informative', 'hari-bitch', 'snitching-on-my-bestie'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleTagSelect = (tag) => {
    setFormData(prev => ({
      ...prev,
      tag: prev.tag === tag ? '' : tag // Toggle selection or select new tag
    }));
  };

  // Convert images to base64 strings for API
  const convertImagesToBase64 = async () => {
    const imagePromises = images.map(image => {
      return new Promise((resolve) => {
        // If it's already a base64 string (from preview), use it
        if (image.preview) {
          resolve(image.preview);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(image.file);
        }
      });
    });

    return Promise.all(imagePromises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    if (formData.title.trim().length < 1) {
      setError('Title is required');
      return;
    }

    if (formData.content.trim().length < 1) {
      setError('Content is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Convert images to base64
      const imageBase64Array = await convertImagesToBase64();

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        images: imageBase64Array,
        tags: formData.tag ? [formData.tag] : [] // Convert single tag to array for API
      };

      const response = await teaAPI.createTeaPost(postData, user.username);

      if (response.tea) {
        // Reset form
        setFormData({
          title: '',
          content: '',
          tag: ''
        });
        setImages([]);

        // Navigate to the new post
        navigate(`/tea/${response.tea.id}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to create post. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="create-tea-container card">
        <div className="auth-required">
          <p>Please log in to drop some heat 🔥</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-tea-container card card-glow">
      <div className="create-tea-form">
        <div className="form-header">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="back-btn"
            title="Back to home"
          >
            ← Back
          </button>
          <h2>Drop Some Heat</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's the heat about? 🔥"
              maxLength={200}
              required
              disabled={isSubmitting}
            />
            <small>{formData.title.length}/200 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Drop all the details... make it spicy! 🌶️"
              rows={6}
              maxLength={5000}
              required
              disabled={isSubmitting}
            />
            <small>{formData.content.length}/5000 characters</small>
          </div>

          <div className="form-group">
            <label>Tag (Select One)</label>
            <div className="tag-selector">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-btn ${formData.tag === tag ? 'selected' : ''}`}
                  onClick={() => handleTagSelect(tag)}
                  disabled={isSubmitting}
                >
                  {tag}
                </button>
              ))}
            </div>
            <small>Choose one tag that best describes your post</small>
          </div>

          <div className="form-group">
            <label>Images (Optional)</label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={5}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Dropping Heat...' : '🔥 Drop Heat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeaPost;
