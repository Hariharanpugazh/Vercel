
import React from 'react';

const TotalQuestions = ({ totalQuestions }) => {


    const boxStyle = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '10rem', // Match the width of FiltersSidebar
        height: '30px', // Adjust as needed
        borderRadius: '10px',
        backgroundColor: '#FFCC00', // Updated background color with 20% opacity
        
      };
      

  const numberStyle = {
    fontSize: '16px', // Adjust as needed
    fontWeight: 'extrabold',  
    color: '#000975',
  };

  const labelStyle = {
    fontSize: '14px', // Adjust as needed
    color: '#000975',
  };

  return (
    
      <div style={boxStyle}>
        
        <div className='pr-4 text-sm' style={labelStyle}>Total Questions  </div>
        <div style={numberStyle}>{totalQuestions}</div>
      </div>
    
  );
};

export default TotalQuestions;

