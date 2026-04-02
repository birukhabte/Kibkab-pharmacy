import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: 'spring', damping: 20, stiffness: 300 }
      }}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          overflow: 'visible'
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: theme.shadows[4]
        }}
        component={motion.div}
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1.1, 1]
        }}
        transition={{ duration: 0.5 }}
      >
        <WarningAmberRoundedIcon fontSize="large" />
      </Box>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseRoundedIcon />
      </IconButton>

      <DialogTitle sx={{ 
        pt: 5,
        fontSize: '1.5rem',
        fontWeight: 700,
        textAlign: 'center'
      }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{
          textAlign: 'center',
          fontSize: '1.1rem',
          color: theme.palette.text.primary
        }}>
          {content}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{
        justifyContent: 'center',
        pb: 3,
        px: 3,
        gap: 2
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem'
          }}
          component={motion.div}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColor}
          variant="contained"
          sx={{
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: 'none',
            '&.MuiButton-containedError': {
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.dark} 100%)`,
                boxShadow: `0 4px 12px ${theme.palette.error.light}`,
              },
            },
          }}
          component={motion.div}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;