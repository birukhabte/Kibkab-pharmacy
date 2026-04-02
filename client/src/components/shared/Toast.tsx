import React from "react";
import {
  Box,
  Typography,
  Fade,
  Alert,
  AlertTitle,
  IconButton,
} from "@mui/material";
import { CheckCircle, Error, Info, Warning, Close } from "@mui/icons-material";

export interface ToastProps {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
  title?: string;
}

const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity,
  onClose,
  duration = 5000,
  title,
}) => {
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  const getSeverityConfig = () => {
    switch (severity) {
      case "success":
        return {
          icon: <CheckCircle sx={{ fontSize: 48, color: "#2E7D32" }} />,
          bgColor: "linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)",
          borderColor: "#4CAF50",
          textColor: "#1B5E20",
          shadowColor: "rgba(76, 175, 80, 0.3)",
        };
      case "error":
        return {
          icon: <Error sx={{ fontSize: 48, color: "#D32F2F" }} />,
          bgColor: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
          borderColor: "#F44336",
          textColor: "#B71C1C",
          shadowColor: "rgba(244, 67, 54, 0.3)",
        };
      case "warning":
        return {
          icon: <Warning sx={{ fontSize: 48, color: "#F57C00" }} />,
          bgColor: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
          borderColor: "#FF9800",
          textColor: "#E65100",
          shadowColor: "rgba(255, 152, 0, 0.3)",
        };
      case "info":
        return {
          icon: <Info sx={{ fontSize: 48, color: "#1976D2" }} />,
          bgColor: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
          borderColor: "#2196F3",
          textColor: "#0D47A1",
          shadowColor: "rgba(33, 150, 243, 0.3)",
        };
      default:
        return {
          icon: <Info sx={{ fontSize: 48, color: "#1976D2" }} />,
          bgColor: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
          borderColor: "#2196F3",
          textColor: "#0D47A1",
          shadowColor: "rgba(33, 150, 243, 0.3)",
        };
    }
  };

  const config = getSeverityConfig();

  if (!open) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      {/* Toast Content */}
      <Box
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          minWidth: 400,
          maxWidth: 600,
          width: "90vw",
        }}
      >
        <Fade in={open} timeout={300}>
          <Box
            sx={{
              background: config.bgColor,
              border: `3px solid ${config.borderColor}`,
              borderRadius: 4,
              boxShadow: `0 20px 60px ${config.shadowColor}, 0 8px 25px rgba(0,0,0,0.15)`,
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={onClose}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                color: config.textColor,
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.1)",
                },
              }}
            >
              <Close />
            </IconButton>

            {/* Icon */}
            <Box sx={{ mb: 2, mt: 1 }}>{config.icon}</Box>

            {/* Title */}
            {title && (
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  color: config.textColor,
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {title}
              </Typography>
            )}

            {/* Message */}
            <Typography
              variant="h6"
              sx={{
                color: config.textColor,
                fontWeight: 600,
                lineHeight: 1.4,
                px: 2,
              }}
            >
              {message}
            </Typography>

            {/* Progress Bar */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${config.borderColor} 0%, ${config.borderColor} 100%)`,
                borderRadius: "0 0 16px 16px",
                animation: `progressBar ${duration}ms linear`,
                "@keyframes progressBar": {
                  "0%": { width: "100%" },
                  "100%": { width: "0%" },
                },
              }}
            />
          </Box>
        </Fade>
      </Box>
    </>
  );
};

export default Toast;
