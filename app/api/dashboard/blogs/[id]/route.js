import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db'; // Fixed path - 4 levels up
import Blog from '../../../../models/Blog'; // Fixed path - 4 levels up
import { uploadImage, deleteImage } from '../../../../../lib/uploadImage'; // Fixed path - 4 levels up

// Helper function to generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// GET single blog
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const blog = await Blog.findById(params.id);
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: blog
    });
    
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PUT update blog
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const blog = await Blog.findById(params.id);
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Extract form data
    const title = formData.get('title') || blog.title;
    const excerpt = formData.get('excerpt') || blog.excerpt;
    const content = formData.get('content') || blog.content;
    const author = formData.get('author') || blog.author;
    const tags = formData.getAll('tags') || blog.tags;
    const published = formData.get('published') === 'true';
    const featured = formData.get('featured') === 'true';
    const readTime = parseInt(formData.get('readTime')) || blog.readTime;
    const imageFile = formData.get('coverImage');
    
    let coverImage = { ...blog.coverImage };
    
    // Handle image upload if new image provided
    if (imageFile && imageFile.size > 0) {
      // Delete old image if exists
      if (blog.coverImage?.public_id) {
        await deleteImage(blog.coverImage.public_id);
      }
      
      // Upload new image
      coverImage = await uploadImage(imageFile);
    }
    
    // Generate new slug only if title changed
    let slug = blog.slug;
    if (title.trim() !== blog.title) {
      let baseSlug = generateSlug(title.trim());
      const timestamp = Date.now().toString().slice(-6);
      slug = `${baseSlug}-${timestamp}`;
    }
    
    // Update blog
    blog.title = title.trim();
    blog.slug = slug;
    blog.excerpt = excerpt.trim();
    blog.content = content.trim();
    blog.author = author.trim();
    blog.tags = tags.filter(tag => tag?.trim()).map(tag => tag.trim());
    blog.published = published;
    blog.featured = featured;
    blog.readTime = readTime;
    blog.coverImage = coverImage;
    
    await blog.save();
    
    return NextResponse.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
    
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update blog',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// DELETE blog
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const blog = await Blog.findById(params.id);
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // Delete image from Cloudinary if exists
    if (blog.coverImage?.public_id) {
      await deleteImage(blog.coverImage.public_id);
    }
    
    // Delete blog from database
    await blog.deleteOne();
    
    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}