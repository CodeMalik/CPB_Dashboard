'use client';

import { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';

export default function BlogForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: 'Admin',
    tags: [],
    published: false,
    featured: false,
    readTime: 5,
    coverImage: null
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (initialData) {
      console.log('Initial Data:', initialData);
      setFormData({
        title: initialData.title || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        author: initialData.author || 'Admin',
        tags: initialData.tags || [],
        published: initialData.published || false,
        featured: initialData.featured || false,
        readTime: initialData.readTime || 5,
        coverImage: null
      });
      if (initialData.coverImage?.url) {
        setPreviewImage(initialData.coverImage.url);
        // If you have image dimensions in initialData, you can set them here
        // setImageSize({ width: initialData.coverImage.width, height: initialData.coverImage.height });
      }
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleWordCountChange = (count) => {
    setWordCount(count);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
      
      // Create preview and check image dimensions
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        
        // Create an image element to get dimensions
        const img = new Image();
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('published', formData.published.toString());
      formDataToSend.append('featured', formData.featured.toString());
      formDataToSend.append('readTime', formData.readTime.toString());
      
      // Add tags
      formData.tags.forEach(tag => {
        if (tag.trim()) {
          formDataToSend.append('tags', tag);
        }
      });
      
      // Add image only if it's a new file
      if (formData.coverImage instanceof File) {
        formDataToSend.append('coverImage', formData.coverImage);
      }

      await onSubmit(formDataToSend);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
              placeholder="Enter blog title..."
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt *
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              required
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
              placeholder="Brief summary of your blog post..."
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.excerpt.length}/300 characters
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Content *
              </label>
              <div className="text-sm text-gray-500">
                {wordCount} words • {Math.ceil(wordCount / 200)} min read
              </div>
            </div>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              onWordCountChange={handleWordCountChange}
            />
          </div>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-400 transition-colors">
              <input
                type="file"
                id="coverImage"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <div className="space-y-2 mb-3">
                    {imageSize.width > 0 && imageSize.height > 0 && (
                      <div className={`text-sm px-3 py-1 rounded-md ${imageSize.width >= 1200 && imageSize.height >= 630 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        <p className="font-medium">Image Size: {imageSize.width} × {imageSize.height}px</p>
                        {imageSize.width < 1200 || imageSize.height < 630 ? (
                          <p className="text-xs mt-1">
                            ⚠️ Minimum recommended: 1200 × 630px
                          </p>
                        ) : (
                          <p className="text-xs mt-1">
                            ✓ Meets recommended size
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <label
                      htmlFor="coverImage"
                      className="flex-1 bg-red-600 text-white text-center py-2 rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      Change Image
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage('');
                        setImageSize({ width: 0, height: 0 });
                        setFormData(prev => ({ ...prev, coverImage: null }));
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="coverImage" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p className="text-gray-600 font-medium">Upload Cover Image</p>
                    <div className="mt-2 space-y-1 text-center">
                      <p className="text-gray-500 text-sm">Recommended size:</p>
                      <p className="text-red-600 text-sm font-semibold">1200 × 630 pixels</p>
                      <p className="text-gray-500 text-xs mt-2">
                        Minimum: 800 × 420 pixels<br />
                        Aspect Ratio: 1.91:1 (horizontal)
                      </p>
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Read Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Read Time (minutes)
            </label>
            <input
              type="number"
              name="readTime"
              value={formData.readTime}
              onChange={handleInputChange}
              min="1"
              max="60"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
            />
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-gray-700">Published</span>
                <p className="text-xs text-gray-500">Make blog visible to public</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`block w-14 h-7 rounded-full ${formData.published ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${formData.published ? 'transform translate-x-7' : ''}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-gray-700">Featured</span>
                <p className="text-xs text-gray-500">Highlight this blog</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`block w-14 h-7 rounded-full ${formData.featured ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${formData.featured ? 'transform translate-x-7' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !formData.title || !formData.excerpt || !formData.content}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${loading || !formData.title || !formData.excerpt || !formData.content ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              {initialData ? 'Update Blog' : 'Create Blog'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}