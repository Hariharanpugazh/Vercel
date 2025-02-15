import React from 'react';
import ImportQuestion from '../../assets/ImportQuestion.svg';
import AddQuestion from '../../assets/AddQuestion.svg';
const TotalQuestions = ({ totalQuestions }) => {




  return (
    <div style={{flexDirection: 'row', display: 'flex', justifyContent: 'left', width: '16rem', height: '30px', borderRadius: '10px', paddingTop:"5px"}}>
      <div className='pl-5 text-normal font-semibold' >Total Questions: </div>
      <div className='pl-2 text-normal font-semibold'>{totalQuestions}</div>
    </div>
  );
};

const Header = ({ searchQuery, setSearchQuery, setIsModalOpen, setIsSingleQuestionModalOpen, totalQuestions }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center p-3 bg-white rounded-t-lg py-4">
      <TotalQuestions totalQuestions={totalQuestions}/>
      <div className="flex items-center gap-4 mt-2 md:mt-0 flex-grow">
        <div className="relative flex-grow max-w-xl ml-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-3 border border-gray-300 rounded-full focus:ring-blue-500 focus:outline-none"
            style={{ borderColor: 'rgba(0,0,0,0.4)', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#000975'}
            onBlur={(e) => e.target.style.borderColor = 'gray'}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 w-144px font-medium bg-[#111933] text-[#ffffff] hover:bg-[#111933] focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-transform duration-300 hover:scale-102 cursor-pointer"
          style={{ borderRadius: '0.5rem' }}
          
        >

          Import Question
          <img src={ImportQuestion} alt="Coding" className="w-4 h-4 ml-3" />
        </button>
        <button
          onClick={() => setIsSingleQuestionModalOpen(true)}
          className="inline-flex items-center px-4 py-2 mr-6 w-144px font-medium bg-[#111933] text-[#ffffff] hover:bg-[#111933] focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-transform duration-300 hover:scale-102 cursor-pointer"
          style={{ borderRadius: '0.5rem' }}
        >
          Add Question
          <img src={AddQuestion} alt="Coding" className="w-4 h-4 ml-3" />
        </button>
      </div>
    </div>
  );
};

export default Header;
