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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'qubtic_uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    configureCloudinary();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'auto',
    });

    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    const msg = error?.error?.message || error?.message || '';
    if (msg.includes('api_secret mismatch')) {
      return NextResponse.json(
        {
          error:
            'Cloudinary API Secret mismatch. Please click the eye icon in your Cloudinary Dashboard under "Product Environment Credentials" to unmask and copy your full API Secret into .env (CLOUDINARY_API_SECRET=...)',
        },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: msg || 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
