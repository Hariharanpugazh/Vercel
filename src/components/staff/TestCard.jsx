import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Users, Clock, ChevronRight, FileText, Code } from "lucide-react";
import { Card, CardHeader, CardFooter, CardBody } from "@nextui-org/react";

const TestCard = ({ title, type, date, category, stats, status, contestId }) => {
  const navigate = useNavigate();

  const handleViewTest = () => {
    navigate(`/viewtest/${contestId}`);
  };

  const statusStyles = {
    Live: "bg-gradient-to-r from-green-400 to-green-600 text-white",
    Upcoming: "bg-gradient-to-r from-[#ff8100] to-[#ff7900] text-white",
    Ended: "bg-gradient-to-r from-red-400 to-red-600 text-white",
  };

  const getIcon = (type) => {
    switch (type) {
      case "Coding":
        return <Code className="w-8 h-8 text-[#000975]" />;
      case "MCQ":
        return <FileText className="w-8 h-8 text-[#000975]" />;
      default:
        return <FileText className="w-8 h-8 text-[#000975]" />;
    }
  };

  return (
    <motion.div whileHover={{ y: -5 }} className="w-full max-w-xl">
      <Card className="py-4 shadow-xl bg-gradient-to-br from-blue-50 to-white border-2 border-transparent rounded-2xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="flex justify-between items-center gap-5">
          <div className="flex gap-4 items-center">
            <div className="p-2 rounded-full">
              {getIcon(type)}
            </div>
            <div className="text-[#000975]">
              <h3 className="text-3xl font-bold">{title}</h3>
              <p className="text-sm">{category}</p>
            </div>
          </div>
          <span
            className={`px-4 py-2 mr-11 mb-4 rounded-full text-xs font-semibold ${statusStyles[status]}`}
          >
            {status}
          </span>
        </CardHeader>
        <CardBody className="grid grid-cols-3 gap-4 w-full">
        {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="text-center">
              <h4 className="text-4xl font-bold">{value}</h4>
              <p className="text-gray-600 text-sm">{key}</p>
            </div>
          ))}
        </CardBody>
        <CardFooter className="flex ml-1 gap-2 mb-1">
          <div className="flex bg-white py-2 px-3 border rounded-full items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{date}</span>
          </div>
          <div className="flex bg-white py-2 px-3 border rounded-full items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">{category}</span>
          </div>
          <div className="flex bg-white py-2 px-3 border rounded-full items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{type}</span>
          </div>
          <div className="position-absolute pl-4 right-0">
          <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleViewTest}
          className="w-40 px-6 py-2 bg-[#000975] text-white rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center font-semibold"
        >
          View Test
          <ChevronRight className="w-5 h-5 ml-2" />
        </motion.button>
        </div>
        </CardFooter>
       
      </Card>
    </motion.div>
  );
};

export default TestCard;
