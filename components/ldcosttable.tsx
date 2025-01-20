"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExcelExport from "./excelexport";
import { Alert, Spin } from "antd";

interface MonthlyData {
  Count: number;
  EstimatedCost: number;
  ActualCost: number;
}

interface RowData {
  id: number;
  provider: string;
  FinancialYear: string;
  January: MonthlyData;
  February: MonthlyData;
  March: MonthlyData;
  April: MonthlyData;
  May: MonthlyData;
  June: MonthlyData;
  July: MonthlyData;
  August: MonthlyData;
  September: MonthlyData;
  October: MonthlyData;
  November: MonthlyData;
  December: MonthlyData;
}

export default function LDCertificationCostTable() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [filteredRows, setFilteredRows] = useState<RowData[]>([]);
  const [financialYears, setFinancialYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [grandTotals, setGrandTotals] = useState({
    totalCount: 0,
    totalEstimatedCost: 0,
    totalActualCost: 0,
  });
  const [monthlyTotals, setMonthlyTotals] = useState<{
    [month: string]: {
      Count: number;
      EstimatedCost: number;
      ActualCost: number;
    };
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("certificatecost.json")
      .then((response) => {
        if (Array.isArray(response.data)) {
          const data = response.data as RowData[];
          setRows(data);

          let years = Array.from(new Set(data.map((row) => row.FinancialYear)));
          years.sort((a, b) => parseInt(b) - parseInt(a));
          setFinancialYears(years);

          const mostRecentYear = years[0];
          setSelectedYear(mostRecentYear);
          filterRowsByYear(data, mostRecentYear);
        } else {
          console.error("API response is not an array:", response.data);
        }
      })
      .catch((error) => {
        setError("No Data Available. Check Your Network Connection"); // Set error message here
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    filterRowsByYear(rows, selectedYear);
  }, [selectedYear, rows]);

  const filterRowsByYear = (data: RowData[], year: string) => {
    const filtered = data.filter((row) => row.FinancialYear === year);
    setFilteredRows(filtered);

    const totals = filtered.reduce(
      (acc, row) => {
        const { totalCount, totalEstimatedCost, totalActualCost } =
          calculateYearlyTotals(row);
        acc.totalCount += totalCount;
        acc.totalEstimatedCost += totalEstimatedCost;
        acc.totalActualCost += totalActualCost;
        return acc;
      },
      { totalCount: 0, totalEstimatedCost: 0, totalActualCost: 0 }
    );
    setGrandTotals(totals);

    const monthTotals: {
      [month: string]: {
        Count: number;
        EstimatedCost: number;
        ActualCost: number;
      };
    } = {
      January: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
      February: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
      March: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
      April: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
      May: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
      June: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
      July: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
      August: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
      September: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
      October: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
      November: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
      December: { Count: 0, EstimatedCost: 0, ActualCost: 0 },
    };

    filtered.forEach((row) => {
      for (const month in monthTotals) {
        const monthlyData = row[month as keyof RowData] as MonthlyData;
        monthTotals[month].Count += monthlyData.Count;
        monthTotals[month].EstimatedCost += monthlyData.EstimatedCost;
        monthTotals[month].ActualCost += monthlyData.ActualCost;
      }
    });

    setMonthlyTotals(monthTotals);
  };
  const getCurrentDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const calculateYearlyTotals = (row: RowData) => {
    let totalCount = 0;
    let totalEstimatedCost = 0;
    let totalActualCost = 0;

    [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ].forEach((month) => {
      const monthlyData = row[month as keyof RowData] as MonthlyData;
      totalCount += monthlyData.Count;
      totalEstimatedCost += monthlyData.EstimatedCost;
      totalActualCost += monthlyData.ActualCost;
    });

    return { totalCount, totalEstimatedCost, totalActualCost };
  };

  return (
    <Box sx={{ padding: 2, bgcolor: "white", overflowX: "auto" }}>
{error ? (
  <Alert
    message="Error"
    description={error}
    type="error"
    showIcon
    closable
    onClose={() => setError(null)} // Clear error on close
  />
):(<div>

      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          width: "100%",
          height: 70,
        }}
      >
        <FormControl sx={{ minWidth: 200, marginRight: 2 }}>
          <InputLabel>Financial Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value as string)}
            label="Financial Year"
          >
            {financialYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ExcelExport
          data={filteredRows.map((row) => ({
            Provider: row.provider,
            January_Count: row.January?.Count || 0,
            January_Estimated_Cost: row.January?.EstimatedCost || 0,
            January_Actual_Cost: row.January?.ActualCost || 0,
            February_Count: row.February?.Count || 0,
            February_Estimated_Cost: row.February?.EstimatedCost || 0,
            February_Actual_Cost: row.February?.ActualCost || 0,
            March_Count: row.March?.Count || 0,
            March_Estimated_Cost: row.March?.EstimatedCost || 0,
            March_Actual_Cost: row.March?.ActualCost || 0,
            April_Count: row.April?.Count || 0,
            April_Estimated_Cost: row.April?.EstimatedCost || 0,
            April_Actual_Cost: row.April?.ActualCost || 0,
            May_Count: row.May?.Count || 0,
            May_Estimated_Cost: row.May?.EstimatedCost || 0,
            May_Actual_Cost: row.May?.ActualCost || 0,
            June_Count: row.June?.Count || 0,
            June_Estimated_Cost: row.June?.EstimatedCost || 0,
            June_Actual_Cost: row.June?.ActualCost || 0,
            July_Count: row.July?.Count || 0,
            July_Estimated_Cost: row.July?.EstimatedCost || 0,
            July_Actual_Cost: row.July?.ActualCost || 0,
            August_Count: row.August?.Count || 0,
            August_Estimated_Cost: row.August?.EstimatedCost || 0,
            August_Actual_Cost: row.August?.ActualCost || 0,
            September_Count: row.September?.Count || 0,
            September_Estimated_Cost: row.September?.EstimatedCost || 0,
            September_Actual_Cost: row.September?.ActualCost || 0,
            October_Count: row.October?.Count || 0,
            October_Estimated_Cost: row.October?.EstimatedCost || 0,
            October_Actual_Cost: row.October?.ActualCost || 0,
            November_Count: row.November?.Count || 0,
            November_Estimated_Cost: row.November?.EstimatedCost || 0,
            November_Actual_Cost: row.November?.ActualCost || 0,
            December_Count: row.December?.Count || 0,
            December_Estimated_Cost: row.December?.EstimatedCost || 0,
            December_Actual_Cost: row.December?.ActualCost || 0,
            Yearly_Total_Count: calculateYearlyTotals(row).totalCount,
            Yearly_Total_Estimated_Cost:
              calculateYearlyTotals(row).totalEstimatedCost,
            Yearly_Total_Actual_Cost:
              calculateYearlyTotals(row).totalActualCost,
          }))}
          fileName={`Certification_Cost_${getCurrentDateString()}`}
        />
      </Box>

      <div>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <Spin size="large" />
          </Box>
        ) : (
          <Box sx={{ width: "100%", height: "50vh" }}>
            <Sheet
              variant="outlined"
              sx={() => ({
                "--TableCell-height": "40px",
                "--TableHeader-height": "calc(1 * var(--TableCell-height))",
                "--Table-secondColumnWidth": "150px",
                "--Table-lastColumnWidth": "250px",
                "--TableRow-stripeBackground": "rgba(0 0 0 / 0.04)",
                "--TableRow-hoverBackground": "rgba(0 0 0 / 0.08)",
                overflow: "auto",
                whiteSpace: "nowrap",
                width: "100%",
                backgroundColor: "background.surface",
              })}
            >
              <Table
                borderAxis="bothBetween"
                stripe="odd"
                hoverRow
                sx={{
                  "& tr > *:first-of-type": {
                    position: "sticky",
                    left: 0,
                    zIndex: 10,
                    boxShadow: "1px 0 var(--TableCell-borderColor)",
                    bgcolor: "background.surface",
                  },
                  "& tr > *:nth-last-of-type(3)": {
                    position: "sticky",
                    right: "178px",
                    bgcolor: "background.surface",
                    zIndex: 3,
                    overflowX: "hidden",
                  },
                  "& tr > *:nth-last-of-type(2)": {
                    position: "sticky",
                    right: "88px",
                    bgcolor: "background.surface",
                    zIndex: 3,
                    overflowX: "hidden",
                  },
                  "& tr > *:last-child": {
                    position: "sticky",
                    right: 0,
                    bgcolor: "var(--TableCell-headBackground)",
                    overflowX: "hidden",
                  },
                  "& thead th": {
                    position: "sticky",
                    top: 0,
                    backgroundColor: "background.surface",
                    zIndex: 4,
                    color: "grey",
                  },
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        width: "var(--Table-secondColumnWidth)",
                        color: "grey",
                      }}
                      rowSpan={2}
                    >
                      Provider
                    </th>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month) => (
                      <th
                        key={month}
                        colSpan={3}
                        style={{
                          width: 450,
                          textAlign: "center",
                          color: "grey",
                        }}
                      >
                        {month}
                      </th>
                    ))}
                    <th
                      aria-label="last"
                      style={{
                        width: "var(--Table-lastColumnWidth)",
                        textAlign: "center",
                        color: "grey",
                      }}
                      colSpan={3}
                    >
                      Yearly Total
                    </th>
                  </tr>
                  <tr>
                    {Array.from({ length: 12 }).map((_, index) => (
                      <React.Fragment key={index}>
                        <th style={{ width: 150, zIndex: 2, color: "grey" }}>
                          Count
                        </th>
                        <th style={{ width: 150, zIndex: 2, color: "grey" }}>
                          Estimated Cost
                        </th>
                        <th style={{ width: 150, zIndex: 2, color: "grey" }}>
                          Actual Cost
                        </th>
                      </React.Fragment>
                    ))}
                    <th
                      style={{
                        width: "var(--Table-lastColumnWidth)",
                        color: "grey",
                      }}
                    >
                      Count
                    </th>
                    <th
                      style={{
                        width: "var(--Table-lastColumnWidth)",
                        color: "grey",
                      }}
                    >
                      Estimated Cost
                    </th>
                    <th
                      style={{
                        width: "var(--Table-lastColumnWidth)",
                        color: "grey",
                      }}
                    >
                      Actual Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                          backgroundColor: "white",
                        }}
                      >
                        {row.provider}
                      </td>
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((month) => {
                        const monthlyData = row[
                          month as keyof RowData
                        ] as MonthlyData;
                        return (
                          <React.Fragment key={month}>
                            <td>{monthlyData.Count || 0}</td>
                            <td>{monthlyData.EstimatedCost || 0}</td>
                            <td>{monthlyData.ActualCost || 0}</td>
                          </React.Fragment>
                        );
                      })}
                      <td style={{ textAlign: "center" }}>
                        {calculateYearlyTotals(row).totalCount}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {calculateYearlyTotals(row).totalEstimatedCost.toFixed(
                          2
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {calculateYearlyTotals(row).totalActualCost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        backgroundColor: "background.surface",
                      }}
                    >
                      Total
                    </td>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month) => (
                      <React.Fragment key={month}>
                        <td
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            backgroundColor: "background.surface",
                          }}
                        >
                          {monthlyTotals[month].Count}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            backgroundColor: "background.surface",
                          }}
                        >
                          {monthlyTotals[month].EstimatedCost.toFixed(2)}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            backgroundColor: "background.surface",
                          }}
                        >
                          {monthlyTotals[month].ActualCost.toFixed(2)}
                        </td>
                      </React.Fragment>
                    ))}
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        backgroundColor: "background.surface",
                      }}
                    >
                      {grandTotals.totalCount}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        backgroundColor: "background.surface",
                      }}
                    >
                      {grandTotals.totalEstimatedCost.toFixed(2)}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        backgroundColor: "background.surface",
                      }}
                    >
                      {grandTotals.totalActualCost.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </Sheet>
          </Box>
        )}
      </div></div>)}
    </Box>
  );
}
