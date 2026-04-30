import { Box, keyframes } from "@mui/material";

const pulse = keyframes`
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
`;

const dots = [0, 1, 2, 3, 4];

export default function Loader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 300,
        width: "100%",
        gap: 1,
      }}
    >
      {dots.map((i) => (
        <Box
          key={i}
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f97316, #fb923c, #fdba74)",
            animation: `${pulse} 1.4s ease-in-out infinite`,
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </Box>
  );
}
