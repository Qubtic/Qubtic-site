import { NextResponse } from 'next/server';
import { getBlogDb, saveBlogPostDb, deleteBlogPostDb, BlogPostItem } from '@/lib/store';

export async function GET() {
  try {
    const posts = await getBlogDb();
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const post: BlogPostItem = await request.json();
    if (!post.slug || !post.title) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    const saved = await saveBlogPostDb(post);
    return NextResponse.json({ success: true, post: saved });
  } catch (error) {
    console.error('Error saving blog post:', error);
    return NextResponse.json({ success: false, error: 'Failed to save blog post' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
    }

    const success = await deleteBlogPostDb(slug);
    return NextResponse.json({ success, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete blog post' }, { status: 500 });
  }
}
