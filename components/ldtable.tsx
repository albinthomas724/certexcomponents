'use client'
import React, { useState, useEffect } from "react";
import axios from "axios";
import { parse } from "date-fns";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridRowParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import {
  Box,
  Modal,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import dayjs, { Dayjs } from "dayjs";
import ExcelExport from "./excelexport";
import { Flex, Spin} from "antd";


// API Fetch function
// const fetchLDNominationData = async (): Promise<RowData[]> => {
//   try {
//     const response = await axios.get(
//       "LDNominationData.json"
//     );
//     const data = response.data;

//     if (Array.isArray(data)) {
//       return data.map((row: RowData) => ({
//         ...row,
//         nominationDate:
//           typeof row.examDate === "string" ? parseDate(row.examDate) : row.examDate,
//         examDate: typeof row.examDate === "string" ? parseDate(row.examDate) : row.examDate,
//       }));
//     } else {
//       throw new Error("Data is not in expected array format");
//     }
//   } catch (error) {
//     throw new Error("Failed to load data");
//   }
// };

// const parseDate = (dateString: string) => {
//   return parse(dateString, "yyyy-MM-dd", new Date());
// };

// Types
interface RowData {
  nominationId: number;
  employeeId: number;
  employeeName: string;
  email: string;
  department: string;
  provider: string;
  certificationName: string;
  criticality: string;
  plannedExamMonth: string;
  motivationDescription: string;
  managerRecommendation: string;
  managerRemarks: string;
  isDepartmentApproved: boolean;
  isLndApproved: boolean;
  nominationDate: Date;
  examDate: string | Date;
  examStatus: string;
  uploadCertificateStatus: string;
  skillMatrixStatus: string;
  reimbursementStatus: string;
  nominationStatus: string;
  financialYear: string;
  costOfCertification: number;
}

// Component
const LdNominationTable: React.FC <{ initialRows: RowData[] }>= ({initialRows}) => {
  const [rows, setRows] = useState<RowData[]>(initialRows);
  const [filteredRows, setFilteredRows] = useState<RowData[]>(initialRows);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedCriticality, setSelectedCriticality] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState<Dayjs | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Dayjs | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const [financialYears, setFinancialYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accordionExpanded, setAccordionExpanded] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);
  const [criticalities, setCriticalities] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  const columns: GridColDef[] = [
    { field: "nominationId", headerName: "Nomination ID", width: 150 },
    { field: "employeeId", headerName: "Employee ID", width: 150 },
    { field: "employeeName", headerName: "Employee Name", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "department", headerName: "Department", width: 150 },
    { field: "provider", headerName: "Provider", width: 150 },
    { field: "certificationName", headerName: "Certification Name", width: 200 },
    { field: "criticality", headerName: "Criticality", width: 100 },
    { field: "plannedExamMonth", headerName: "Planned Month of Exam", width: 200 },
    { field: "motivationDescription", headerName: "Motivation Description", width: 200 },
    { field: "managerRecommendation", headerName: "Manager Recommendation", width: 200 },
    { field: "managerRemarks", headerName: "Manager Remarks", width: 200 },
    { field: "isDepartmentApproved", headerName: "Department Approval", width: 200 },
    { field: "isLndApproved", headerName: "L&D Approval", width: 200 },
    { field: "examDate", headerName: "Exam Date", width: 150, type: "date" },
    { field: "examStatus", headerName: "Exam Status", width: 150 },
    { field: "uploadCertificateStatus", headerName: "Upload Certificate Status", width: 200 },
    { field: "skillMatrixStatus", headerName: "Skill Matrix Status", width: 200 },
    { field: "reimbursementStatus", headerName: "Reimbursement Status", width: 200 },
    { field: "nominationStatus", headerName: "Nomination Status", width: 150 },
    { field: "financialYear", headerName: "Financial Year", width: 150 },
    { field: "costOfCertification", headerName: "Cost of Certification (INR)", width: 150 },
  ];

  // ...rest of your component logic remains unchanged
  const getCurrentDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const data = await fetchLDNominationData();
        const data=initialRows;
        setRows(data);
        setFilteredRows(data);

        const uniqueFinancialYears = Array.from(
          new Set(data.map((row: RowData) => row.financialYear))
        );
        setFinancialYears(uniqueFinancialYears);

        const uniqueProviders = Array.from(
          new Set(data.map((row: RowData) => row.provider))
        );
        setProviders(uniqueProviders);

        const uniqueCriticalities = Array.from(
          new Set(data.map((row: RowData) => row.criticality))
        );
        setCriticalities(uniqueCriticalities);

        const uniqueDepartments = Array.from(
          new Set(data.map((row: RowData) => row.department))
        );
        setDepartments(uniqueDepartments);

        setLoading(false);
      } catch (error) {
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = rows;

    if (searchTerm) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          value
            ? value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            : false
        )
      );
    }

    if (selectedProvider) {
      filtered = filtered.filter((row) => row.provider === selectedProvider);
    }

    if (selectedCriticality) {
      filtered = filtered.filter(
        (row) => row.criticality === selectedCriticality
      );
    }

    if (selectedFinancialYear) {
      filtered = filtered.filter(
        (row) => row.financialYear === selectedFinancialYear
      );
    }

    if (selectedStartDate) {
      filtered = filtered.filter(
        (row) => row.examDate && dayjs(row.examDate).isAfter(selectedStartDate)
      );
    }

    if (selectedEndDate) {
      filtered = filtered.filter(
        (row) => row.examDate && dayjs(row.examDate).isBefore(selectedEndDate)
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(
        (row) => row.department === selectedDepartment
      );
    }

    setFilteredRows(filtered);
  }, [
    searchTerm,
    selectedProvider,
    selectedCriticality,
    selectedFinancialYear,
    selectedStartDate,
    selectedEndDate,
    selectedDepartment,
    rows,
  ]);

  const handleOpenModal = (row: RowData) => {
    setSelectedRow(row);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRow(null);
  };

  const handleClearDateFilters = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const handleSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectionModel(newSelectionModel);
  };

  const handleRowClick: GridEventListener<"rowClick"> = (
    params: GridRowParams,
    event
  ) => {
    const target = event.target as HTMLElement;

    if (target.closest(".MuiDataGrid-cellCheckbox")) {
      event.stopPropagation();
    } else {
      handleOpenModal(params.row as RowData);
    }
  };

  const handleSendEmail = () => {
    const selectedRows = filteredRows.filter((row) =>
      selectionModel.includes(row.nominationId)
    );
    const emailAddresses = selectedRows.map((row) => row.email).join(",");
    console.log("Email Addresses:", emailAddresses);
    window.location.href = `mailto:${emailAddresses}`;
  };

  const getRowId = (row: RowData) => row.nominationId;

  if (loading) {
    return (
      <Flex align="center" justify="center" gap="middle">
      <Spin size="large" />
    </Flex>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
        p={2}
        sx={{ backgroundColor: "#f9f9f9", width: "96%", ml: 2 }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#757575", display: "flex", alignItems: "center" }}
        >
          <InfoOutlinedIcon
            sx={{ fontSize: "1.5rem", color: "#757575", mr: 1 }}
          />
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      p={2}
      ml={2}
      mr={1.7}
      mt={-2}
      sx={{ backgroundColor: "white", borderRadius: "15px" }}
    >
      <Accordion
        expanded={accordionExpanded}
        sx={{ width: "100%", border: "none", boxShadow: "none" }}
      >
        <AccordionSummary
  component="div" // Change to a non-button element
  aria-controls="filter-content"
  id="filter-header"
  sx={{
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    border: "none",
    boxShadow: "none",
    backgroundColor: "white",
    padding: 1,
    cursor: "default",
    flexWrap: "wrap",
    "&.Mui-focusVisible": {
      backgroundColor: "transparent",
    },
    "&:focus": {
      backgroundColor: "transparent",
    },
  }}
>
  <Typography
    variant="h5"
    sx={{
      flex: 1,
      minWidth: "150px",
      textAlign: { xs: "center", sm: "left" },
    }}
  >
    All Nominations Data
  </Typography>
  <Box
    display="flex"
    alignItems="center"
    sx={{
      ml: { xs: 0, sm: 1 },
      flexDirection: { xs: "column", sm: "row" },
      width: "auto",
      textAlign: { xs: "center", sm: "left" },
    }}
  >
    <TextField
      label="Search"
      variant="outlined"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{
        width: { xs: "100%", sm: "200px" },
        height: "35px",
        "& .MuiInputBase-input": {
          height: "10px",
        },
      }}
    />
    <IconButton
      onClick={() => setAccordionExpanded(!accordionExpanded)}
      sx={{
        ml: { xs: 0, sm: 1 },
        mt: { xs: 1, sm: 0 },
      }}
    >
      <FilterListIcon />
    </IconButton>
     <ExcelExport
      data={filteredRows}
      fileName={`Nomination_Data_${getCurrentDateString()}`}
      sx={{
        mt: { xs: 1, sm: 0 },
      }}
    /> 
  </Box>
</AccordionSummary>


        <AccordionDetails>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
            sx={{ border: "none", boxShadow: "none" }}
          >
            <FormControl sx={{ minWidth: 100 }}>
              <InputLabel>Provider</InputLabel>
              <Select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as string)}
                label="Provider"
              >
                <MenuItem value="">All</MenuItem>
                {providers.map((provider) => (
                  <MenuItem key={provider} value={provider}>
                    {provider}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 130 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={(e) =>
                  setSelectedDepartment(e.target.value as string)
                }
                label="Department"
              >
                <MenuItem value="">All</MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Criticality</InputLabel>
              <Select
                value={selectedCriticality}
                onChange={(e) =>
                  setSelectedCriticality(e.target.value as string)
                }
                label="Criticality"
              >
                <MenuItem value="">All</MenuItem>
                {criticalities.map((criticality) => (
                  <MenuItem key={criticality} value={criticality}>
                    {criticality}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Financial Year</InputLabel>
              <Select
                value={selectedFinancialYear}
                onChange={(e) =>
                  setSelectedFinancialYear(e.target.value as string)
                }
                label="Financial Year"
              >
                <MenuItem value="">All</MenuItem>
                {financialYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={selectedStartDate}
                onChange={(date: Dayjs | null) => setSelectedStartDate(date)}
                slotProps={{
                  textField: {
                    variant: "outlined", // or "filled" or "standard"
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={selectedEndDate}
                onChange={(date: Dayjs | null) => setSelectedEndDate(date)}
                slotProps={{
                  textField: {
                    variant: "outlined", // or "filled" or "standard"
                  },
                }}
              />
            </LocalizationProvider>
            <Button onClick={handleClearDateFilters}>Clear</Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Render button only when rows are selected */}
      {selectionModel.length > 0 && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2, mb: 1 }}
          onClick={handleSendEmail}
        >
          Send E-Mail
        </Button>
      )}
      {/* Data table */}
      <Box sx={{ height: 350, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          checkboxSelection
          onRowSelectionModelChange={handleSelectionChange}
          getRowId={getRowId}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 25, { value: -1, label: "All" }]}
          sx={{
            width: "100%",
            "& .MuiDataGrid-cell": {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              "&[title]": {
                pointerEvents: "none",
              },
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Box>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Paper
          sx={{
            width: "80%",
            maxWidth: 400,
            margin: "auto",
            padding: 2,
            position: "relative",
            maxHeight: "85vh",
            overflow: "auto",
            marginTop: 6,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            {selectedRow?.certificationName}
          </Typography>
          <Typography id="modal-description" sx={{ mt: 1, fontSize: 14 }}>
            <strong>Employee Name:</strong> {selectedRow?.employeeName} <br />
            <strong>Email:</strong> {selectedRow?.email} <br />
            <strong>Department:</strong> {selectedRow?.department} <br />
            <strong>Provider:</strong> {selectedRow?.provider} <br />
            <strong>Criticality:</strong> {selectedRow?.criticality} <br />
            <strong>Planned Month of Exam:</strong>{" "}
            {selectedRow?.plannedExamMonth} <br />
            <strong>Motivation:</strong> {selectedRow?.motivationDescription}{" "}
            <br />
            <strong>Department Approval:</strong>{" "}
            {selectedRow?.isDepartmentApproved ? "Yes" : "No"} <br />
            <strong>L&D Approval:</strong>{" "}
            {selectedRow?.isLndApproved ? "Yes" : "No"} <br />
            <strong>Exam Date:</strong>{" "}
            {selectedRow?.examDate
              ? new Date(selectedRow.examDate).toDateString()
              : "N/A"}{" "}
            <br />
            <strong>Exam Status:</strong> {selectedRow?.examStatus} <br />
            <strong>Upload Certificate Status:</strong>{" "}
            {selectedRow?.uploadCertificateStatus} <br />
            <strong>Skill Matrix Status:</strong>{" "}
            {selectedRow?.skillMatrixStatus} <br />
            <strong>Reimbursement Status:</strong>{" "}
            {selectedRow?.reimbursementStatus} <br />
            <strong>Nomination Status:</strong> {selectedRow?.nominationStatus}{" "}
            <br />
            <strong>Financial Year:</strong> {selectedRow?.financialYear} <br />
            <strong>Cost of Certification (INR):</strong>{" "}
            {selectedRow?.costOfCertification} <br />
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              (window.location.href = `mailto:${selectedRow?.email}`)
            }
            sx={{ mt: 2 }}
          >
            Send Email
          </Button>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Paper>
      </Modal>
    </Box>
  );
};

export default LdNominationTable;
