import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const FileUpload = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [file, setFile] = useState(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';
    const navigate = useNavigate();
  
    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        console.log('Selected file:', selectedFile.name);
      }
    };
  
    const openModal = () => {
      setIsModalOpen(true);
    };
  
    const closeModal = async (confirm = false) => {
      if (confirm && file) {
        // Create FormData to include the file for the API call
        const formData = new FormData();
        formData.append('file', file);
  
        try {
          const response = await fetch(`${API_BASE_URL}/userinput/`, {
            method: 'POST',
            body: formData,
          });
  
          if (response.ok) {
            console.log('File uploaded successfully');
          } else {
            console.error('Failed to upload file');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
  
      // Close the modal and reset the file name
      setIsModalOpen(false);
      setFile(null);
    };

    const handleManualSelect = () => {
      navigate('/ManualSelectUI'); // Redirect to /ManualSelectUI
    };
  
    return (
      <div style={styles.outerContainer}>
        <div style={styles.container}>
          <button style={styles.button} onClick={openModal}>
            File Upload
          </button>
          <button style={styles.button} onClick={handleManualSelect}>
            Manual Select
          </button>
        </div>
  
        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Upload File</h3>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                style={styles.fileInput}
              />
              <p style={styles.fileName}>{file ? file.name : 'No file chosen'}</p>
              <div style={styles.modalButtons}>
                <button style={styles.confirmButton} onClick={() => closeModal(true)}>
                  Confirm
                </button>
                <button style={styles.cancelButton} onClick={() => closeModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

const styles = {
  outerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ddd',
    borderRadius: '8px',
    width: '250px',
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  button: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#28a745',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '300px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  fileInput: {
    display: 'block',
    width: '100%',
    marginBottom: '10px',
  },
  fileName: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '15px',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  confirmButton: {
    padding: '10px 20px',
    fontSize: '14px',
    color: '#fff',
    backgroundColor: '#28a745',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    flexGrow: 1,
    marginRight: '5px',
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: '14px',
    color: '#fff',
    backgroundColor: '#dc3545',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    flexGrow: 1,
    marginLeft: '5px',
  },
};

export default FileUpload;
