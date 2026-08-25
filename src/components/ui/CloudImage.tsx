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
 * If the provided `src` is a local asset path (starts with '/'), it gracefully falls back to Next.js `<Image>`.
 * Handles `fill` properly without passing conflicting `width` and `height` properties.
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

  const isLocalFile = src.startsWith('/');

  if (fill) {
    if (isLocalFile) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
        />
      );
    }

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

  if (isLocalFile) {
    const numericWidth = typeof defaultWidth === 'string' ? parseInt(defaultWidth, 10) || 500 : (defaultWidth as number) || 500;
    const numericHeight = typeof defaultHeight === 'string' ? parseInt(defaultHeight, 10) || 500 : (defaultHeight as number) || 500;

    return (
      <Image
        src={src}
        alt={alt}
        width={numericWidth}
        height={numericHeight}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  // Cloudinary Public ID or Cloudinary URL
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
