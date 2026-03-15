import Image, { type ImageLoaderProps, type ImageProps } from "next/image";

function passthroughLoader({ src }: ImageLoaderProps) {
  return src;
}

export function AppImage(props: ImageProps) {
  return <Image {...props} loader={passthroughLoader} unoptimized={props.unoptimized ?? true} />;
}
