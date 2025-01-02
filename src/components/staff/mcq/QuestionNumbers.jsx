import React from "react";



export default function QuestionNumbers({

  questionNumbers,

  questionStatuses,

  onQuestionClick,

}) {

  const handleClick = (index) => {

    onQuestionClick(index);

  };



  return (

    <div className="grid grid-cols-5 gap-2">

      {questionNumbers.map((num, index) => (

        <div

          key={num}

          className={`p-2 border rounded-md text-center cursor-pointer ${

            questionStatuses[index] === "current"

              ? "bg-yellow-500 text-white"

              : questionStatuses[index] === "review"

              ? "bg-blue-500 text-white"

              : questionStatuses[index] === "answered"

              ? "bg-green-500 text-white"

              : "bg-gray-200 text-gray-700"

          }`}

          onClick={() => handleClick(index)}

        >

          {num}

        </div>

      ))}

    </div>

  );

}