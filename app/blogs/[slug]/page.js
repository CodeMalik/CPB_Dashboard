import { connectDB } from '../../../lib/db';
import Blog from '../../../app/models/Blog';
import Link from 'next/link';
import Image from 'next/image';

export async function generateMetadata({ params }) {
  try {
    await connectDB();
    const blog = await Blog.findOne({ 
      slug: params.slug, 
      published: true 
    }).lean();
    
    if (!blog) {
      return {
        title: 'Blog Not Found - Custom Pack Boxes',
        description: 'The requested blog post could not be found.'
      };
    }
    
    return {
      title: `${blog.title} - Custom Pack Boxes`,
      description: blog.excerpt,
      keywords: blog.tags?.join(', ') || 'packaging, boxes, custom',
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        images: blog.coverImage?.url ? [{ url: blog.coverImage.url }] : [],
        type: 'article',
        publishedTime: blog.createdAt,
        authors: [blog.author]
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog - Custom Pack Boxes',
      description: 'Read our latest blog posts'
    };
  }
}

export default async function BlogDetailPage({ params }) {
  try {
    await connectDB();
    
    const blog = await Blog.findOne({ 
      slug: params.slug, 
      published: true 
    }).lean();
    
    if (!blog) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Blog Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link 
              href="/blogs"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Blogs
            </Link>
          </div>
        </div>
      );
    }
    
    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
    
    // Fetch related blogs
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      published: true,
      tags: { $in: blog.tags || [] }
    })
    .limit(3)
    .select('-content')
    .lean();

    return (
      <div className="min-h-screen w-420 bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/blogs"
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-colors mb-6"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Blogs
              </Link>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {blog.title}
              </h1>
              <p className="text-xl opacity-90 mb-8">
                {blog.excerpt}
              </p>
              
              {/* Blog Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Author</p>
                    <p>{blog.author}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Published</p>
                    <p>
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Read Time</p>
                    <p>{blog.readTime} min read</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Featured Image */}
              {blog.coverImage?.url && (
                <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={blog.coverImage.url}
                    alt={blog.title}
                    width={1200}
                    height={630}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              )}
              
              {/* Content */}
              <article className="prose prose-lg max-w-none">
                <div 
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </article>
              
              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blogs?tag=${encodeURIComponent(tag)}`}
                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3">
              <div className="sticky top-6 space-y-8">
                {/* Author Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{blog.author}</h4>
                      <p className="text-sm text-gray-600">Packaging Expert</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    With years of experience in the packaging industry, {blog.author} shares insights and tips to help businesses optimize their packaging solutions.
                  </p>
                </div>
                
                {/* Related Blogs */}
                {relatedBlogs.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">
                      Related Articles
                    </h3>
                    <div className="space-y-4">
                      {relatedBlogs.map((relatedBlog) => (
                        <Link
                          key={relatedBlog._id}
                          href={`/blogs/${relatedBlog.slug}`}
                          className="group flex items-start gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          {relatedBlog.coverImage?.url && (
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden relative">
                              <Image
                                src={relatedBlog.coverImage.url}
                                alt={relatedBlog.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2">
                              {relatedBlog.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(relatedBlog.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading blog:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Error Loading Blog</h1>
          <p className="text-gray-600 mb-8">There was an error loading the blog post. Please try again later.</p>
          <Link 
            href="/blogs"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }
}