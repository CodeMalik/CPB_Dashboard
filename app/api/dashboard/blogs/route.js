import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db'; // Fixed path - 3 levels up
import Blog from '../../../../app/models/Blog'; // Fixed path - 3 levels up
import { uploadImage } from '../../../../lib/uploadImage'; // Fixed path - 3 levels up

// Helper function to generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// GET all blogs for dashboard
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status === 'published') {
      query.published = true;
    } else if (status === 'draft') {
      query.published = false;
    }
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: blogs
    });
    
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blogs',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// POST create new blog
export async function POST(request) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    
    // Extract form data
    const title = formData.get('title');
    const excerpt = formData.get('excerpt');
    const content = formData.get('content');
    const author = formData.get('author') || 'Admin';
    const tags = formData.getAll('tags');
    const published = formData.get('published') === 'true';
    const featured = formData.get('featured') === 'true';
    const readTime = parseInt(formData.get('readTime')) || 5;
    const imageFile = formData.get('coverImage');
    
    // Validate required fields
    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title, excerpt, and content are required' 
        },
        { status: 400 }
      );
    }
    
    let coverImage = {};
    
    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      coverImage = await uploadImage(imageFile);
    }
    
    // Generate slug
    let baseSlug = generateSlug(title.trim());
    const timestamp = Date.now().toString().slice(-6);
    const slug = `${baseSlug}-${timestamp}`;
    
    // Create new blog
    const blog = new Blog({
      title: title.trim(),
      slug: slug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: author.trim(),
      tags: tags.filter(tag => tag?.trim()).map(tag => tag.trim()),
      published,
      featured,
      readTime,
      coverImage
    });
    
    await blog.save();
    
    return NextResponse.json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
    
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create blog',
        message: error.message,
        details: error.errors 
      },
      { status: 500 }
    );
  }
}