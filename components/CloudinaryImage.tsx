'use client';

import Image, { ImageProps } from 'next/image';
import { getCloudinaryImageUrl, isCloudinaryImageUrl } from '@/lib/utils';

export default function CloudinaryImage(props: ImageProps) {
  const cloudinaryUrl = typeof props.src === 'string' && isCloudinaryImageUrl(props.src);

  return (
    <Image
      {...props}
      alt={props.alt}
      src={typeof props.src === 'string' ? getCloudinaryImageUrl(props.src) : props.src}
      unoptimized={cloudinaryUrl || props.unoptimized}
    />
  );
}
