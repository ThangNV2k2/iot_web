import type { ReactNode, MouseEventHandler } from "react";
import { Box } from "@mui/material";

interface ShapeProps {
  text?: ReactNode;
  color?: string;
  size?: number;
  shape: "circle" | "square" | "rectangle" | "ellipse" | "hexagon";
  paddingX?: number;
  paddingY?: number;
  marginX?: number;
  marginY?: number;
  border?: boolean;
  borderSize?: number;
  borderColor?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export default function Shape({
  text,
  color = "#3498db",
  size = 100,
  shape = "square",
  paddingX = 0,
  paddingY = 0,
  marginX = 0,
  marginY = 0,
  border = false,
  borderSize = 1,
  borderColor = "transparent",
  onClick,
}: ShapeProps) {
  return (
    <Box
      sx={{
        backgroundColor: color,
        width: shape === "rectangle" || shape === "ellipse" ? size * 1.5 : size,
        height: shape === "rectangle" || shape === "ellipse" ? size * 0.75 : size,
        paddingX,
        paddingY,
        marginX,
        marginY,
        border: border ? `${borderSize}px solid ${borderColor}` : "none",
        cursor: onClick ? "pointer" : "default",
        userSelect: onClick ? "none" : "auto",
        borderRadius:
          shape === "circle" || shape === "ellipse" ? "50%" : "0",
        clipPath:
          shape === "hexagon"
            ? "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
            : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
      }}
      onClick={onClick}
    >
      {text}
    </Box>
  );
}
