import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  TextField,
} from '@mui/material';
// import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CopyIcon from '@mui/icons-material/FileCopy';
import WhatsAppIcon from '../../../assets/icons/wp.png'

const ShareModal = ({ open, onClose, shareLink }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      alert('Link copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy link: ', err);
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      <DialogContent
        sx={{
          backgroundColor: '#f9faff',
          borderRadius: '12px',
          boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
          p: 4,
          textAlign: 'center',
        }}
      >
        <DialogTitle sx={{ color: '#111933', fontWeight: 'bold', fontSize: '30px' }}>Share Link</DialogTitle>
        <Box display="flex" justifyContent="center" mb={2}>
          <IconButton
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareLink)}`, "_blank")}
          >
            {/* <WhatsAppIcon style={{ backgroundColor: "#25D366", fontSize: '50px' }} /> */}
            <img src={WhatsAppIcon} className='w-16 h-16'/>
          </IconButton>
        </Box>
        <Box display="flex" alignItems="center" mb={2}>
          <TextField
            fullWidth
            value={shareLink}
            InputProps={{
              readOnly: true,
            }}
            sx={{
              '& .MuiInputBase-root': {
                color: '#111933',
                borderRadius: '8px',
              },
            }}
          />
          <IconButton onClick={handleCopyLink} sx={{ ml: 2 }}>
            <CopyIcon sx={{
              color: '#111933'
            }} />
          </IconButton>
        </Box>
        <Button onClick={onClose} variant="contained"
        sx={{
          backgroundColor: '#111933',
        }}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
