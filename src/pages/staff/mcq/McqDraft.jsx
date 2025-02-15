import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../../../layout/Loader';
import DraftCards from '../../../components/staff/mcq/DraftCards';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const McqDraft = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const [draftTests, setDraftTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Number of items to display per page

  useEffect(() => {
    fetchDraftTests();
  }, []);

  const fetchDraftTests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/draft/`, { withCredentials: true });
      if (response.status === 200) {
        setDraftTests(response.data.draftAssessments.reverse()); // Reverse the incoming data
      }
    } catch (error) {
      console.error(error.response?.data?.error || 'Something Went Wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTestSelection = (testId) => {
    setSelectedTests((prevSelected) =>
      prevSelected.includes(testId)
        ? prevSelected.filter((id) => id !== testId)
        : [...prevSelected, testId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedTests((prevSelected) =>
      prevSelected.length === draftTests.length ? [] : draftTests.map((test) => test.contestId)
    );
  };

  const handleDelete = async () => {
    if (selectedTests.length === 0) return;

    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/delete-drafts/`, {
        data: { contestIds: selectedTests },
        withCredentials: true,
      });
      setDraftTests((prevDrafts) =>
        prevDrafts.filter((test) => !selectedTests.includes(test.contestId))
      );
      setSelectedTests([]);
    } catch (error) {
      console.error("Error deleting draft:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const currentDrafts = draftTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center">
      {isLoading && <Loader message="Fetching draft tests..." />}
      <div className="flex justify-between items-center mb-4 py-4 px-8 w-full">
        <h1 className="text-3xl text-[#111933] font-bold">Your Test Drafts</h1>
        <div className='flex space-x-2'>
          <button
            onClick={toggleSelectAll}
            className="px-4 py-2 bg-[#111933] text-white rounded-lg hover:bg-[#fd944e] transition-colors"
          >
            {selectedTests.length === draftTests.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            disabled={selectedTests.length === 0}
          >
            Delete Selected
          </button>
        </div>
      </div>
      <div className="w-7xl p-4">
        <DraftCards
          drafts={currentDrafts}
          onEditDraft={(testId) => console.log(`Edit draft with ID: ${testId}`)}
          onDelete={toggleTestSelection}
          selectedTests={selectedTests}
          toggleTestSelection={toggleTestSelection}
        />
      </div>
      <Stack spacing={2}>
        <Pagination
          count={Math.ceil(draftTests.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Stack>
    </div>
  );
};

export default McqDraft;
