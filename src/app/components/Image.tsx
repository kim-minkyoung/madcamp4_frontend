interface ImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

function Image({ src, alt, className, width, height }: ImageProps) {
  return (
    <img src={src} alt={alt} className={className} width={width} height={height} />
  );
}

export default Image;
