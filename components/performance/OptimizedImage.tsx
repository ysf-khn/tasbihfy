import Image, { ImageProps } from "next/image";
import { forwardRef } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "priority"> {
  priority?: boolean;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}

// Component for optimized images with better Core Web Vitals
const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ priority = false, loading = "lazy", fetchPriority = "auto", ...props }, ref) => {
    return (
      <Image
        {...props}
        ref={ref}
        priority={priority}
        loading={priority ? "eager" : loading}
        // @ts-ignore - fetchPriority is not in Next.js types yet but supported
        fetchPriority={fetchPriority}
        quality={85} // Slightly reduce quality for better performance
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;