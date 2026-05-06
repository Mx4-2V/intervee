import Image from "next/image";

type LogoContainerSize = "sm" | "lg";

interface LogoContainerProps {
  alt: string;
  height: number;
  size?: LogoContainerSize;
  src: string;
  width: number;
}

const sizeClasses: Record<LogoContainerSize, string> = {
  sm: "h-11 w-11",
  lg: "h-20 w-20",
};

const imageSize: Record<LogoContainerSize, { height: number; width: number }> = {
  sm: { height: 26, width: 26 },
  lg: { height: 44, width: 44 },
};

export function LogoContainer({
  alt,
  height,
  size = "sm",
  src,
  width,
}: LogoContainerProps) {
  return (
    <div className={`flex ${sizeClasses[size]} shrink-0 items-center justify-center rounded border border-intervee-card-border bg-intervee-card-strong/10 shadow-sm`}>
      <Image
        alt={alt}
        height={height ?? imageSize[size].height}
        src={src}
        width={width ?? imageSize[size].width}
      />
    </div>
  );
}