import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { FileText, Code, Trash2, Calendar, Clock } from "lucide-react";
import { FaArrowRightLong } from "react-icons/fa6";
import { GiDuration } from "react-icons/gi";

const DraftCards = ({ drafts = [], onEditDraft, onDelete, selectedTests, toggleTestSelection }) => {

  const formatDuration = (hours, minutes) => {
    const totalHours = Math.floor((parseInt(hours || 0) * 60 + parseInt(minutes || 0)) / 60);
    const remainingMinutes = (parseInt(hours || 0) * 60 + parseInt(minutes || 0)) % 60;
    
    if (totalHours === 0) {
      return `${remainingMinutes} mins`;
    } else if (remainingMinutes === 0) {
      return totalHours === 1 ? `1 hr` : `${totalHours} hrs`;
    } else {
      return `${totalHours} hr ${remainingMinutes} mins`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {drafts.length > 0 ? (
        drafts.map((draft) => {
          const icon =
            draft.assessment_type === "coding" ? (
              <Code className="w-5 h-5 text-[#fd944e]" />
            ) : (
              <FileText className="w-5 h-5 text-[#000975]" />
            );

          return (
            <div key={draft.contestId} className="relative">
              <input
                type="checkbox"
                checked={selectedTests.includes(draft.contestId)}
                onChange={() => toggleTestSelection(draft.contestId)}
                className="absolute top-2 left-2 z-10"
              />
              <motion.div whileHover={{ y: -2 }} className="w-full mb-4 max-w-md">
                <div className="py-5 px-4 border bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-center gap-4 p-2 mb-2">
                    <div className="flex gap-2 items-center">
                      <div className="rounded-full p-1 bg-white">{icon}</div>

                      <div className="text-[#111933]">
                        <h3 className="text-base font-semibold">{draft.name || "Untitled Draft"}</h3>
                        <p className="text-sm">{draft.assessment_type?.toUpperCase() || "MCQ"}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-xl font-semibold bg-gray-400 text-white">Draft</span>
                  </div>
                  <div className="flex flex-row justify-evenly gap-2 flex-wrap">
                    <div className="flex bg-white py-1 px-2 border shadow rounded-sm items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">{formatDate(draft?.starttime).split(',')[0]}</span>
                    </div>
                    <div className="flex bg-white py-1 px-2 border shadow rounded-sm items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs whitespace-nowrap">
                        {new Date(draft?.starttime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
                      </span>
                    </div>

                    <div className="flex bg-white py-1 px-2 border shadow rounded-sm items-center gap-1">
                      <GiDuration className="w-3 h-3" />
                      <span className="text-xs">
                        {formatDuration(draft?.duration?.hours, draft?.duration?.minutes)}
                      </span>
                    </div>
                  </div>
                  {/* <div className="p-2 flex justify-between items-center">
                    <button
                      className="px-2 py-2.5 bg-gray-500 text-white rounded-lg flex items-center text-xs"
                      onClick={() => onEditDraft(draft.contestId)}
                    >
                      Edit Draft <FaArrowRightLong className="w-3 h-3 ml-1" />
                    </button>
                    <button onClick={() => onDelete(draft.contestId)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div> */}
                </div>
              </motion.div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">No draft tests available.</p>
      )}
    </div>
  );
};

DraftCards.propTypes = {
  drafts: PropTypes.array,
  onEditDraft: PropTypes.func,
  onDelete: PropTypes.func,
  selectedTests: PropTypes.array,
  toggleTestSelection: PropTypes.func,
};

export default DraftCards;
