import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export async function GET() {
  try {
    configureCloudinary();

    const result = await cloudinary.api.resources({
      max_results: 100,
      resource_type: 'image',
      type: 'upload',
    });

    return NextResponse.json({
      resources: result.resources || [],
      next_cursor: result.next_cursor,
    });
  } catch (error: any) {
    console.error('Cloudinary API error:', error);
    const msg = error?.error?.message || error?.message || '';
    if (msg.includes('api_secret mismatch')) {
      return NextResponse.json(
        {
          error:
            'Cloudinary API Secret mismatch. Please click the eye icon in your Cloudinary Dashboard under "Product Environment Credentials" to unmask and copy your full API Secret into .env (CLOUDINARY_API_SECRET=...)',
          code: 'API_SECRET_MISMATCH',
        },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: msg || 'Failed to list Cloudinary media' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { public_id } = await request.json();

    if (!public_id) {
      return NextResponse.json({ error: 'public_id is required' }, { status: 400 });
    }

    configureCloudinary();

    const result = await cloudinary.uploader.destroy(public_id);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
