import React from "react";

type ProgressiveBlurProps = {
  className?: string;
  backgroundColor?: string;
  position?: "top" | "bottom";
  height?: string;
  blurAmount?: string;
  zIndex?: number;
  fixed?: boolean;
  /**
   * When false, renders no tint/gradient fill — only backdrop blur + mask.
   * Useful where any visible overlay is undesirable.
   */
  tint?: boolean;
  /**
   * Controls how quickly the blur fades out via mask.
   * soft = longer, smoother feather; hard = shorter, stronger.
   */
  fade?: "soft" | "medium" | "hard";
};

const ProgressiveBlur = ({
  className = "",
  backgroundColor = "rgba(0, 0, 0, 0)",
  position = "top",
  height = "280px",
  blurAmount = "4px",
  zIndex = 10,
  fixed = false,
  tint = true,
  fade = "medium",
}: ProgressiveBlurProps) => {
  const isTop = position === "top";

  // Build mask gradients based on fade strength
  const maskSoftTop = `linear-gradient(to bottom, black 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 75%, transparent 100%)`;
  const maskSoftBottom = `linear-gradient(to top, black 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 75%, transparent 100%)`;
  const maskMediumTop = `linear-gradient(to bottom, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.15) 80%, transparent 100%)`;
  const maskMediumBottom = `linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.15) 80%, transparent 100%)`;
  const maskHardTop = `linear-gradient(to bottom, black 0%, rgba(0,0,0,0.95) 10%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 70%, transparent 90%)`;
  const maskHardBottom = `linear-gradient(to top, black 0%, rgba(0,0,0,0.95) 10%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.25) 70%, transparent 90%)`;

  const maskImage = fade === "soft"
    ? (isTop ? maskSoftTop : maskSoftBottom)
    : fade === "hard"
    ? (isTop ? maskHardTop : maskHardBottom)
    : (isTop ? maskMediumTop : maskMediumBottom);

  // Optional background tint/gradient; disabled when tint=false
  const background = !tint
    ? "transparent"
    : (isTop
      ? `linear-gradient(to top, transparent 0%, rgba(0,0,0,0.01) 10%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.12) 70%, ${backgroundColor} 100%)`
      : `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.01) 10%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.12) 70%, ${backgroundColor} 100%)`
    );

  return (
    <div
      className={`pointer-events-none ${fixed ? 'fixed' : 'absolute'} left-0 w-full select-none ${className}`}
      style={{
        [isTop ? "top" : "bottom"]: 0,
        height,
        zIndex,
        background,
        maskImage,
        WebkitMaskImage: maskImage,
        WebkitBackdropFilter: `blur(${blurAmount})`,
        backdropFilter: `blur(${blurAmount})`,
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    />
  );
};

export { ProgressiveBlur };
