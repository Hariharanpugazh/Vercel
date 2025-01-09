import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Button,
  TextField,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";

const ShareModal = ({ open, onClose, shareLink }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Share Modal</DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="center" mb={2}>

          <IconButton
            onClick={() => window.open(`https://wa.me/?text=${shareLink}`, "_blank")}
          >
            <WhatsAppIcon style={{ color: "#25D366" }} />
          </IconButton>
          
        </Box>
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            value={shareLink}
            InputProps={{
              readOnly: true,
            }}
          />
          <IconButton onClick={handleCopyLink}>
            <CopyIcon />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareModal;
