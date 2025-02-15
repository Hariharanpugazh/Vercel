import React from 'react';
import { useNavigate } from 'react-router-dom';


const AutoManualUI = () => {
  const navigate = useNavigate();

  const handleManualClick = () => {
    navigate('/FileUpload'); // Navigates to the FileUploadWithModal page
  };
  const handleAutoCLick = () => {
    navigate('/StartContest'); // Navigates to the FileUploadWithModal page
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Select Mode</h1>
      <button style={styles.button} onClick={handleAutoCLick} >Auto</button>
      <button style={styles.button} onClick={handleManualClick}>Manual</button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ddd',
    borderRadius: '8px',
    width: '300px',
    margin: '20px auto',
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#28a745', // Adjust according to your theme
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default AutoManualUI;