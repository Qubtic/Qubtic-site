'use client';

import React from 'react';
import { CldImage, CldImageProps } from 'next-cloudinary';
import Image from 'next/image';

export interface CloudImageProps extends Omit<CldImageProps, 'src' | 'alt' | 'width' | 'height'> {
  src?: string;
  alt?: string;
  width?: CldImageProps['width'];
  height?: CldImageProps['height'];
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  crop?: CldImageProps['crop'];
}

/**
 * CloudImage renders images optimized via Cloudinary's `CldImage` component.
 * If the provided `src` is a local asset path (starts with '/'), an external URL (starts with 'http'),
 * or if no Cloudinary cloud name is configured, it gracefully falls back to Next.js `<Image>`.
 */
export function CloudImage({
  src = 'cld-sample-5',
  alt = 'Image',
  width,
  height,
  fill,
  className = '',
  sizes,
  priority,
  crop = { type: 'auto', source: true },
  ...props
}: CloudImageProps) {
  if (!src) return null;

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME;

  const isLocalFile = src.startsWith('/');
  const isHttpUrl = src.startsWith('http://') || src.startsWith('https://');

  // Fallback to Next.js <Image> if it's a local asset, direct HTTP URL, or Cloudinary cloud name is missing
  if (isLocalFile || isHttpUrl || !cloudName) {
    let resolvedSrc = src;
    if (!isLocalFile && !isHttpUrl && cloudName) {
      resolvedSrc = `https://res.cloudinary.com/${cloudName}/image/upload/${src}`;
    }

    if (fill) {
      return (
        <Image
          src={resolvedSrc}
          alt={alt}
          fill
          className={className}
          sizes={sizes || '100vw'}
          priority={priority}
        />
      );
    }

    const defaultWidth = typeof width === 'string' ? parseInt(width, 10) || 500 : (width as number) || 500;
    const defaultHeight = typeof height === 'string' ? parseInt(height, 10) || 500 : (height as number) || 500;

    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        width={defaultWidth}
        height={defaultHeight}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  // Use CldImage when valid Cloudinary environment is available
  if (fill) {
    return (
      <CldImage
        src={src}
        alt={alt}
        fill
        crop={crop}
        className={className}
        sizes={sizes}
        priority={priority}
        {...props}
      />
    );
  }

  const defaultWidth = width || 500;
  const defaultHeight = height || 500;

  return (
    <CldImage
      src={src}
      alt={alt}
      width={defaultWidth}
      height={defaultHeight}
      crop={crop}
      className={className}
      sizes={sizes}
      priority={priority}
      {...props}
    />
  );
}

export default CloudImage;
