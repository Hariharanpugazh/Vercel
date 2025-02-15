import React, { useState } from "react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const ShareModal = ({ open, onClose, shareLink }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 sec
  };

  if (!open) return null; // Prevent rendering when closed

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#f9faff] p-8 rounded-lg shadow-xl w-full max-w-xl text-center">
        
        {/* Title */}
        <h2 className="text-lg font-semibold mb-4">Share Link</h2>

        {/* WhatsApp Share Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => window.open(`https://wa.me/?text=${shareLink}`, "_blank")}
            className="p-2 rounded-full"
          >
            <WhatsAppIcon style={{ color: "#25D366", fontSize: "32px" }} />
          </button>
        </div>

        {/* Link Input + Copy Button */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white mb-4 px-3 py-2">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="w-full text-sm text-gray-700 bg-transparent outline-none"
          />
          <button onClick={handleCopyLink} className="p-2">
            <ContentCopyIcon fontSize="medium" />
          </button>
        </div>

        {/* Copy Confirmation */}
        {copied && <p className="text-green-600 text-sm mb-2">✅ Link Copied!</p>}

        {/* Close Button */}
        <div className="flex justify-start">
          <button
            onClick={onClose}
            className="bg-[#111933] text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
