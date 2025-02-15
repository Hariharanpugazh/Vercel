import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import StudentTable from "../../../components/staff/StudentTable";

import { createTheme, ThemeProvider } from '@mui/material/styles';
const theme = createTheme({
  palette: {
    primary: {
      main: '#111933',
    },
  },
});

const PublishDialog = ({
  open,
  onClose,
  handlePublish,
  students,
  selectedStudents,
  setSelectedStudents,
  filters,
  setFilters,
  sortConfig,
  setSortConfig,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  openFilterDialog,
  setOpenFilterDialog,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>Select Students</DialogTitle>
      <DialogContent>
        <StudentTable
          students={students}
          selectedStudents={selectedStudents}
          setSelectedStudents={setSelectedStudents}
          filters={filters}
          setFilters={setFilters}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          openFilterDialog={openFilterDialog}
          setOpenFilterDialog={setOpenFilterDialog}
        />
      </DialogContent>
      <DialogActions>
      <Button
        onClick={onClose}
        variant="outlined"
        sx={{
          color: '#111933', 
          borderColor: '#111933',
          '&:hover': { 
            backgroundColor: '#111933', 
            color: 'white' 
          }
        }}
      >
        Cancel
      </Button>
        <ThemeProvider theme={theme}>
          <Button onClick={handlePublish} variant="contained" color="primary">
            Confirm
          </Button>
        </ThemeProvider>
      </DialogActions>
    </Dialog>
  );
};

export default PublishDialog;
