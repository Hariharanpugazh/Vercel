import React from "react";
import { useNavigate } from "react-router-dom";
import QuestionLibrary from "../../src/assets/QuesLibraryNew.svg";
import TetsLibrary from "../../src/assets/TestLibraryNew.svg";

const Library = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#f4f6ff86] pt-24">
      <div className="w-full max-w-4xl mx-auto bg-white p-12 rounded-lg shadow-lg">
        <h4 className="text-3xl text-[#111933]  font-medium cursor-text text-center mb-4">
          Choose a Library
        </h4>
        <h6 className="text-md font text-[#111933] opacity-50 text-center mb-8">
        Explore our extensive collection of question and test libraries to streamline your workflow.
        </h6>

        <div className="flex justify-center space-x-4 mb-4">
          {/* Question Library Card */}
          <div
            className="bg-[#ECF2FE] h-36  flex flex-col justify-center items-center rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-102 cursor-pointer"
            onClick={() => handleNavigate("/library/mcq")}
            style={{width: "20rem"}}
          >
            <div className="flex items-center justify-center">
              <img
                src={QuestionLibrary}
                alt="Question Library"
                className="w-18 h-16 mr-4 ml-6"
              />
              <div>
                <h6 className="font text-black text-left font-semibold">Question Library</h6>
                <h6 className="text-xs text-[#111933] opacity-50 text-left pr-4 pt-2">
                  Access your saved question library.
                </h6>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex justify-center items-center">
            <h4 className="text-sm font text-[#111933] opacity-50">or</h4>
          </div>

          {/* Test Library Card */}
          <div
            className="bg-[#ECF2FE] h-36  flex flex-col justify-center items-center rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-102 cursor-pointer"
            onClick={() => handleNavigate("/library/mcq/test")}
            style={{width: "20rem"}}
          >
            <div className="flex items-center justify-center">
              <img
                src={TetsLibrary}
                alt="Test Library"
                className="w-18 h-16 mr-4 ml-6"
              />
              <div>
                <h6 className="font text-black text-left font-semibold">Test Library</h6>
                <h6 className="text-xs text-[#111933] opacity-50 text-left pr-4 pt-2">
                  Access your saved test library.
                </h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
