import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

const DownloadContestData = ({ contestId, contestName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/staff/download-contest-data/${contestId}/`);
        downloadExcel(response.data); // Download the Excel file when data is fetched
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [contestId]);

  const downloadExcel = (data) => {
    const workbook = XLSX.utils.book_new();

    // Create the overall sheet
    const overallSheetData = [
      ["Contest Name", contestName],
      ["Overall Average Percentage", data.average_percentage],
      [], // Empty row for spacing
      ["Name", "Email", "College Name", "Department", "Registration Number", "Year", "Percentage"], // Header row
      ...data.students.map(student => [
        student.name,
        student.email,
        student.collegename,
        student.dept,
        student.regno,
        student.year,
        student.percentage
      ])
    ];

    const overallSheet = XLSX.utils.aoa_to_sheet(overallSheetData);
    XLSX.utils.book_append_sheet(workbook, overallSheet, "Overall");

    // Calculate average percentage for each college
    const collegeAverages = {};
    data.students.forEach(student => {
      if (!collegeAverages[student.collegename]) {
        collegeAverages[student.collegename] = { total: 0, count: 0, students: [] };
      }
      collegeAverages[student.collegename].total += student.percentage;
      collegeAverages[student.collegename].count += 1;
      collegeAverages[student.collegename].students.push(student);
    });

    // Create a summary sheet for college-wise statistics
    const collegeSummarySheetData = [
      ["College Name", "Average Percentage", "Number of Students"],
      ...Object.keys(collegeAverages).map(college => [
        college,
        collegeAverages[college].total / collegeAverages[college].count,
        collegeAverages[college].count
      ])
    ];

    const collegeSummarySheet = XLSX.utils.aoa_to_sheet(collegeSummarySheetData);
    XLSX.utils.book_append_sheet(workbook, collegeSummarySheet, "College Summary");

    // Create a sheet for each college
    Object.keys(collegeAverages).forEach(college => {
      const collegeSheetData = [
        ["College Name", college],
        ["Average Percentage", collegeAverages[college].total / collegeAverages[college].count],
        ["Number of Students", collegeAverages[college].count],
        [], // Empty row for spacing
        ["Name", "Email", "Department", "Registration Number", "Year", "Percentage"], // Header row
        ...collegeAverages[college].students.map(student => [
          student.name,
          student.email,
          student.dept,
          student.regno,
          student.year,
          student.percentage
        ])
      ];

      // Calculate average percentage for each department within the college
      const deptAverages = {};
      collegeAverages[college].students.forEach(student => {
        if (!deptAverages[student.dept]) {
          deptAverages[student.dept] = { total: 0, count: 0, students: [] };
        }
        deptAverages[student.dept].total += student.percentage;
        deptAverages[student.dept].count += 1;
        deptAverages[student.dept].students.push(student);
      });

      // Add department averages and specific student data to the college sheet
      Object.keys(deptAverages).forEach(dept => {
        const average = deptAverages[dept].total / deptAverages[dept].count;
        collegeSheetData.push(["Department", dept]);
        collegeSheetData.push(["Average Percentage", average]);
        collegeSheetData.push(["Number of Students", deptAverages[dept].count]);
        collegeSheetData.push([]); // Empty row for spacing
        collegeSheetData.push(["Name", "Email", "Registration Number", "Year", "Percentage"]); // Header row for department
        deptAverages[dept].students.forEach(student => {
          collegeSheetData.push([
            student.name,
            student.email,
            student.regno,
            student.year,
            student.percentage
          ]);
        });
        collegeSheetData.push([]); // Empty row for spacing
      });

      const collegeSheet = XLSX.utils.aoa_to_sheet(collegeSheetData);
      XLSX.utils.book_append_sheet(workbook, collegeSheet, college);

      // Apply styles to make the Excel file look more like a dashboard
      const headerStyle = {
        font: { bold: true, size: 14 },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "FFFF00" } },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        }
      };

      const subHeaderStyle = {
        font: { bold: true, size: 12 },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "FFCC00" } },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        }
      };

      const dataStyle = {
        font: { size: 11 },
        alignment: { horizontal: "left" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        }
      };

      collegeSheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      collegeSheet["!rows"] = [{ hpt: 20 }, { hpt: 20 }, { hpt: 20 }, { hpt: 20 }, { hpt: 20 }];
      collegeSheet["A1"].s = headerStyle;
      collegeSheet["B1"].s = headerStyle;
      collegeSheet["A2"].s = headerStyle;
      collegeSheet["B2"].s = headerStyle;
      collegeSheet["A3"].s = headerStyle;
      collegeSheet["B3"].s = headerStyle;
      collegeSheet["A5"].s = subHeaderStyle;
      collegeSheet["B5"].s = subHeaderStyle;
      collegeSheet["C5"].s = subHeaderStyle;
      collegeSheet["D5"].s = subHeaderStyle;
      collegeSheet["E5"].s = subHeaderStyle;
      collegeSheet["F5"].s = subHeaderStyle;

      // Apply data style to all data rows
      collegeSheetData.forEach((row, rowIndex) => {
        if (rowIndex >= 5) {
          row.forEach((cell, colIndex) => {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
            if (collegeSheet[cellRef]) {
              collegeSheet[cellRef].s = dataStyle;
            }
          });
        }
      });

      // Enable filters and sorting
      collegeSheet["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 4, c: 0 }, e: { r: collegeSheetData.length - 1, c: 5 } }) };
    });

    // Apply styles and filters to the overall sheet
    const overallHeaderStyle = {
      font: { bold: true, size: 14 },
      alignment: { horizontal: "center" },
      fill: { fgColor: { rgb: "FFFF00" } },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      }
    };

    const overallDataStyle = {
      font: { size: 11 },
      alignment: { horizontal: "left" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      }
    };

    overallSheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    overallSheet["!rows"] = [{ hpt: 20 }, { hpt: 20 }, { hpt: 20 }, { hpt: 20 }];
    overallSheet["A1"].s = overallHeaderStyle;
    overallSheet["B1"].s = overallHeaderStyle;
    overallSheet["A2"].s = overallHeaderStyle;
    overallSheet["B2"].s = overallHeaderStyle;
    overallSheet["A4"].s = overallHeaderStyle;
    overallSheet["B4"].s = overallHeaderStyle;
    overallSheet["C4"].s = overallHeaderStyle;
    overallSheet["D4"].s = overallHeaderStyle;
    overallSheet["E4"].s = overallHeaderStyle;
    overallSheet["F4"].s = overallHeaderStyle;
    overallSheet["G4"].s = overallHeaderStyle;

    // Apply data style to all data rows
    overallSheetData.forEach((row, rowIndex) => {
      if (rowIndex >= 4) {
        row.forEach((cell, colIndex) => {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
          if (overallSheet[cellRef]) {
            overallSheet[cellRef].s = overallDataStyle;
          }
        });
      }
    });

    // Enable filters and sorting
    overallSheet["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 3, c: 0 }, e: { r: overallSheetData.length - 1, c: 6 } }) };

    // Apply styles and filters to the college summary sheet
    const summaryHeaderStyle = {
      font: { bold: true, size: 14 },
      alignment: { horizontal: "center" },
      fill: { fgColor: { rgb: "FFFF00" } },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      }
    };

    const summaryDataStyle = {
      font: { size: 11 },
      alignment: { horizontal: "left" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      }
    };

    collegeSummarySheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }];
    collegeSummarySheet["!rows"] = [{ hpt: 20 }];
    collegeSummarySheet["A1"].s = summaryHeaderStyle;
    collegeSummarySheet["B1"].s = summaryHeaderStyle;
    collegeSummarySheet["C1"].s = summaryHeaderStyle;

    // Apply data style to all data rows
    collegeSummarySheetData.forEach((row, rowIndex) => {
      if (rowIndex >= 1) {
        row.forEach((cell, colIndex) => {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
          if (collegeSummarySheet[cellRef]) {
            collegeSummarySheet[cellRef].s = summaryDataStyle;
          }
        });
      }
    });

    // Enable filters and sorting
    collegeSummarySheet["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: collegeSummarySheetData.length - 1, c: 2 } }) };

    XLSX.writeFile(workbook, `${contestName}.xlsx`);
  };

  if (loading) return null; // Return null to hide the component while loading
  if (error) return null; // Return null to hide the component in case of an error

  return null; // Return null to hide the component after downloading
};

export default DownloadContestData;
