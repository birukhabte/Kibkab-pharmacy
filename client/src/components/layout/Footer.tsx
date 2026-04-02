import React from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import {
  LocalPharmacy as PharmacyIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
} from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        color: "white",
        py: 4,
        px: 3,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(46, 125, 50, 0.5), transparent)",
        },
      }}
    >
      {/* Main Footer Content */}
      <Stack spacing={3}>
        {/* Top Section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: "linear-gradient(135deg, #2E7D32, #4CAF50)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
              }}
            >
              <PharmacyIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  background: "linear-gradient(45deg, #4CAF50, #81C784)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                PharmaManage Pro
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Advanced Pharmacy Management System
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Chip
              icon={<SecurityIcon />}
              label="Secure"
              size="small"
              sx={{
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                color: "#4CAF50",
                border: "1px solid rgba(76, 175, 80, 0.3)",
              }}
            />
            <Chip
              icon={<SpeedIcon />}
              label="Fast"
              size="small"
              sx={{
                backgroundColor: "rgba(33, 150, 243, 0.2)",
                color: "#2196F3",
                border: "1px solid rgba(33, 150, 243, 0.3)",
              }}
            />
            <Chip
              icon={<SupportIcon />}
              label="24/7 Support"
              size="small"
              sx={{
                backgroundColor: "rgba(255, 152, 0, 0.2)",
                color: "#FF9800",
                border: "1px solid rgba(255, 152, 0, 0.3)",
              }}
            />
          </Stack>
        </Stack>

        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

        {/* Middle Section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={4}
        >
          {/* Company Info */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              About PharmaManage Pro
            </Typography>
            <Typography
              variant="body2"
              sx={{ opacity: 0.8, lineHeight: 1.6, mb: 2 }}
            >
              Leading pharmaceutical management solution designed for modern
              healthcare facilities. Streamline operations, enhance patient
              care, and ensure regulatory compliance.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Quick Links */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {[
                "Dashboard",
                "Inventory",
                "Employees",
                "Branches",
                "Reports",
                "Settings",
              ].map((link) => (
                <Typography
                  key={link}
                  variant="body2"
                  sx={{
                    opacity: 0.8,
                    cursor: "pointer",
                    "&:hover": {
                      opacity: 1,
                      color: "#4CAF50",
                      transform: "translateX(4px)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* Contact Info */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Contact Information
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <EmailIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  support@pharmamanage.com
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PhoneIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  +1 (555) 123-4567
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  123 Healthcare Ave, Medical District
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

        {/* Bottom Section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © 2024 PharmaManage Pro. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.7,
                cursor: "pointer",
                "&:hover": { opacity: 1 },
              }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.7,
                cursor: "pointer",
                "&:hover": { opacity: 1 },
              }}
            >
              Terms of Service
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.7,
                cursor: "pointer",
                "&:hover": { opacity: 1 },
              }}
            >
              Cookie Policy
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;
