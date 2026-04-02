import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  Badge,
  IconButton,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Payment as PaymentIcon,
  Medication as MedicationIcon,
} from "@mui/icons-material";
import { Notification } from "../../types/types";

interface NotificationMenuProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({
  notifications,
  onNotificationClick,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
    handleClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "prescription_complete":
        return <CheckCircleIcon color="success" />;
      case "prescription_refill_due":
        return <WarningIcon color="warning" />;
      case "company_credit_due":
        return <PaymentIcon color="primary" />;
      case "commission_earned":
        return <PaymentIcon color="primary" />;
      case "low_stock":
        return <MedicationIcon color="error" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          backgroundColor: "rgba(255,255,255,0.1)",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
          borderRadius: 2,
          p: 1,
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 350,
            maxHeight: 400,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
          <Typography variant="h6" fontWeight={600}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText
              primary="No notifications"
              secondary="You're all caught up!"
            />
          </MenuItem>
        ) : (
          notifications.slice(0, 5).map((notification, index) => (
            <React.Fragment key={notification.id}>
              <MenuItem
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 2,
                  opacity: notification.isRead ? 0.7 : 1,
                  backgroundColor: notification.isRead
                    ? "transparent"
                    : "action.hover",
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight={600}>
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </MenuItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}

        {notifications.length > 5 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleClose}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu;
