import React from "react";

export interface DynamicIframeProps
  extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src: string;
  title: string;
  width?: string | number;
  height?: string | number;
  allowFullScreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * DynamicIframe is a reusable, strongly-typed iframe component.
 * - Pass src, title, width, height, allowFullScreen as props.
 * - Additional iframe attributes can be passed via ...rest.
 * - Follows accessibility and security best practices.
 */
const DynamicIframe = React.forwardRef<HTMLIFrameElement, DynamicIframeProps>(
  (
    {
      src,
      title,
      width = "100%",
      height = 400,
      allowFullScreen = false,
      className,
      style,
      ...rest
    },
    ref
  ) => (
    <iframe
      ref={ref}
      src={src}
      title={title}
      width={width}
      height={height}
      allowFullScreen={allowFullScreen}
      className={className}
      style={style}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      {...rest}
    />
  )
);

DynamicIframe.displayName = "DynamicIframe";

export default DynamicIframe;
