import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: 300
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  coverImage: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    }
  },
  author: {
    type: String,
    default: 'Admin'
  },
  tags: [{
    type: String,
    trim: true
  }],
  published: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Number,
    default: 5
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/--+/g, '-')     // Replace multiple hyphens with single hyphen
    .trim();                  // Trim whitespace
};

// Generate slug before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    // Generate base slug
    let slug = generateSlug(this.title);
    
    // Add timestamp to make it unique
    const timestamp = Date.now().toString().slice(-6);
    this.slug = `${slug}-${timestamp}`;
  }
  next();
});

// Check if model exists before creating
const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;