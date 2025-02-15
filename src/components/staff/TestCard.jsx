import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Users, Clock, ChevronRight, FileText, Code } from "lucide-react";
import { Card, CardHeader, CardFooter, CardBody } from "@nextui-org/react";
import { Skeleton } from "@mui/material";
import { formatInTimeZone } from 'date-fns-tz';

const TestCard = ({ title, type, date, time, stats, registrationStart, endDate, contestId, isLoading }) => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState("");

  const calculateStatus = () => {
    // Get current time in UTC by converting IST to UTC
    const istNow = new Date();
    const utcTimestamp = formatInTimeZone(
      istNow,
      'Asia/Kolkata',
      "yyyy-MM-dd'T'HH:mm:ss'Z'"
    );
  
    // Convert current IST to UTC timestamp for comparison
    const currentUTC = new Date(utcTimestamp).getTime();
    const startUTC = new Date(registrationStart).getTime();
    const endUTC = new Date(endDate).getTime();
  
    if (currentUTC < startUTC) {
      return "Upcoming";
    } else if (currentUTC >= startUTC && currentUTC <= endUTC) {
      return "Live";
    } else {
      return "Completed";
    }
  };
  

  useEffect(() => {
    if (!registrationStart || !endDate) {
      console.log('Missing dates for:', title);
      return;
    }

    const updateStatus = () => {
      const newStatus = calculateStatus();
      setCurrentStatus(newStatus);
    };

    // Initial update
    updateStatus();

    // Update every minute
    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);
  }, [registrationStart, endDate, title]);

  const handleViewTest = () => {
    navigate(`/viewtest/${contestId}`);
  };

  const statusStyles = {
    Live: "bg-[#34cf70] text-white",
    Upcoming: "bg-[#ff9742] text-white",
    Completed: "bg-red-500 text-white",
  };

  const getIcon = (type) => {
    switch (type) {
      case "Coding":
        return <Code className="w-4 h-4 text-[#111933]" />;
      case "MCQ":
        return <FileText className="w-4 h-4 text-[#111933]" />;
      default:
        return <FileText className="w-4 h-4 text-[#111933]" />;
    }
  };

  // Format time in UTC (original format)
  const formatTimeUTC = (dateString) => {
    return formatInTimeZone(new Date(dateString), 'UTC', 'hh:mm a');
  };

  // Format date in UTC (original format)
  const formatDateUTC = (dateString) => {
    return formatInTimeZone(new Date(dateString), 'UTC', 'MM/dd/yyyy');
  };

  return (
    <motion.div whileHover={{ y: -2 }} className="w-full max-w-md">
      <Card className="py-2 shadow-lg bg-gradient-to-br from-blue-50 to-white rounded-xl hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex justify-between items-center gap-2">
          <div className="flex gap-2 items-center">
            <div className="p-1 rounded-full">
              {isLoading ? <Skeleton variant="circular" width={24} height={24} /> : getIcon(type)}
            </div>
            <div className="text-[#111933]">
              {isLoading ? (
                <Skeleton variant="text" width={100} height={24} />
              ) : (
                <h3 className="text-base font-bold">{title}</h3>
              )}
            </div>
          </div>
          {isLoading ? (
            <Skeleton variant="text" width={60} height={24} />
          ) : (
            <span
              className={`px-2 py-1 mb-2 rounded-full mr-1 text-xs font-semibold ${
                statusStyles[currentStatus || "Upcoming"]
              }`}
            >
              {currentStatus || "Upcoming"}
            </span>
          )}
        </CardHeader>
        <CardBody className="grid grid-cols-3 gap-3 w-full">
          {isLoading ? (
            <>
              <Skeleton variant="text" width={50} height={24} />
              <Skeleton variant="text" width={50} height={24} />
              <Skeleton variant="text" width={50} height={24} />
            </>
          ) : (
            Object.entries(stats).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-gray-600 text-sm inline-block">{key}</p>
                <h4 className="text-lg font-medium inline-block ml-1">{value}</h4>
              </div>
            ))
          )}
        </CardBody>
        <CardFooter className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mt-2">
          <div className="flex flex-row gap-1">
            <div className="flex bg-white py-0.5 px-1.5 sm:py-0.5 sm:px-2 border rounded-full items-center gap-1">
              {isLoading ? <Skeleton variant="text" width={40} height={20} /> : <Calendar className="w-2 h-2 sm:w-2.5 sm:h-2.5" />}
              {isLoading ? (
                <Skeleton variant="text" width={60} height={20} />
              ) : (
                <span className="text-xs sm:text-xs">{formatDateUTC(endDate)}</span>
              )}
            </div>
            <div className="flex bg-white py-0.5 px-1.5 sm:py-0.5 sm:px-2 border rounded-full items-center gap-1">
              {isLoading ? <Skeleton variant="text" width={40} height={20} /> : <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />}
              {isLoading ? (
                <Skeleton variant="text" width={60} height={20} />
              ) : (
                <span className="text-xs sm:text-xs whitespace-nowrap">{formatTimeUTC(endDate)}</span>
              )}
            </div>
            <div className="flex bg-white py-1 px-2 sm:py-1 sm:px-3 border rounded-full items-center gap-2">
              {isLoading ? <Skeleton variant="text" width={40} height={20} /> : <Users className="w-2 h-2 sm:w-2.5 sm:h-2.5" />}
              {isLoading ? <Skeleton variant="text" width={60} height={20} /> : <span className="text-xs sm:text-xs">{type}</span>}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewTest}
            className="ml-9 px-2 py-2 bg-[#111933] text-white rounded-lg hover:bg-[#111933de] transition-colors flex items-end font-base text-sm sm:text-sm"
          >
            {isLoading ? <Skeleton variant="text" width={60} height={24} /> : "View Test"}
            <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4" />
          </motion.button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TestCard;