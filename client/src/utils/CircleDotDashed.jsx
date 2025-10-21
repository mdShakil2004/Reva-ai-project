"use client";

import { motion, useAnimation } from "framer-motion";

const transition = {
  duration: 2,
  ease: "linear",
  repeat: Infinity, // keep spinning while hovered
};

const spinVariants = {
  normal: { rotate: 0 },
  animate: { rotate: 360 },
};

export function CircleDotDashed({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  ...props
}) {
  const controls = useAnimation();

  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <motion.g
          style={{ willChange: "transform" }}
          variants={spinVariants}
          animate={controls}
          initial="normal"
          transition={transition}
        >
          <path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0" />
          <path d="M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7" />
          <path d="M21.82 10.1a9.93 9.93 0 0 1 0 3.8" />
          <path d="M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69" />
          <path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0" />
          <path d="M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7" />
          <path d="M2.18 13.9a9.93 9.93 0 0 1 0-3.8" />
          <path d="M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69" />
        </motion.g>
        <circle cx="12" cy="12" r="1" />
      </svg>
    </div>
  );
}
