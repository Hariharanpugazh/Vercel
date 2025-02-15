import { useEffect, useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";

const useDeviceRestriction = (contestId) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const navigate = useNavigate();
  const [openDeviceRestrictionModal, setOpenDeviceRestrictionModal] = useState(false);

  useEffect(() => {
    const applyDeviceRestriction = () => {
      const deviceRestriction = localStorage.getItem(`deviceRestriction_${contestId}`);
      if (deviceRestriction === "true" && (isMobile || isTablet)) {
        setOpenDeviceRestrictionModal(true);
      }
    };

    applyDeviceRestriction();
  }, [contestId, isMobile, isTablet]);

  const handleDeviceRestrictionModalClose = () => {
    setOpenDeviceRestrictionModal(false);
    navigate("/studentdashboard");
  };

  return { openDeviceRestrictionModal, handleDeviceRestrictionModalClose };
};

export default useDeviceRestriction;
