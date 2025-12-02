import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../../lib/db'; // Fixed path - 4 levels up
import Blog from '../../../../../models/Blog'; // Fixed path - 4 levels up

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const { published } = await request.json();
    const blog = await Blog.findById(params.id);
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    blog.published = published;
    await blog.save();
    
    return NextResponse.json({
      success: true,
      message: `Blog ${published ? 'published' : 'unpublished'} successfully`,
      data: blog
    });
    
  } catch (error) {
    console.error('Error toggling publish:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog status' },
      { status: 500 }
    );
  }
}