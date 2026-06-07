'use client';

import * as React from 'react';
import Lightbox, { type SlideImage } from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface ImageLightboxProps {
  open: boolean;
  onClose: () => void;
  slides: SlideImage[];
  index?: number;
}

export function ImageLightbox({
  open,
  onClose,
  slides,
  index = 0,
}: ImageLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={slides}
      index={index}
      controller={{ closeOnBackdropClick: true }}
    />
  );
}
