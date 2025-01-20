"use client";

import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber"; // Import warning icon from Material-UI
import { Alert, Spin } from "antd";

ChartJS.register(ArcElement, Tooltip, Legend);

const generateRandomColors = (numColors: number) => {
  const colors: string[] = [];
  for (let i = 0; i < numColors; i++) {
    const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
    colors.push(randomColor);
  }
  return colors;
};

const NoData: React.FC = () => (
  <Alert
    message="Error"
    description="No Data Available.Check Your Network Connection"
    type="error"
    showIcon
  />
);

const DoubleLayerDoughnutChart: React.FC = () => {
  const [yearData, setYearData] = useState<{
    [key: string]: { [provider: string]: number[] };
  }>({});
  const [providers, setProviders] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(-1); // Default to 'All'
  const [selectedYear, setSelectedYear] = useState<string>(""); // Default to an empty string
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("codtdata.json"); // Replace with your actual API endpoint
        const data = await response.json();

        setMonths(["All", ...data.months]); // Prepend "All" to the months array
        setYearData(data.yearData);
        setProviders(data.providers);

        const availableYears = Object.keys(data.yearData).sort((a, b) =>
          b.localeCompare(a)
        ); // Sort years in descending order
        if (availableYears.length > 0) {
          setSelectedYear(availableYears[0]); // Use the most recent year
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const years = Object.keys(yearData);
  const providerColors = generateRandomColors(providers.length);

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value);
  };

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    setSelectedMonth(Number(event.target.value));
  };

  const aggregatedData = (providerData: { [provider: string]: number[] }) => {
    if (selectedMonth === -1) {
      return providers.map(
        (provider) =>
          providerData[provider]?.reduce((acc, cost) => acc + cost, 0) || 0
      );
    } else {
      return providers.map(
        (provider) => providerData[provider]?.[selectedMonth] || 0
      );
    }
  };

  const data = {
    labels: providers,
    datasets: [
      {
        label: "Actual Cost",
        data: yearData[selectedYear]
          ? aggregatedData(yearData[selectedYear])
          : [],
        backgroundColor: providerColors,
        borderColor: "black",
        borderWidth: 0.5,
        radius: "100%",
        hoverOffset: 4,
      },
      {
        label: "Estimated Cost",
        data: yearData[selectedYear]
          ? aggregatedData(yearData[selectedYear])
          : [],
        backgroundColor: providerColors,
        borderColor: "black",
        borderWidth: 0.5,
        radius: "95%",
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 0, // Minimize top padding
        bottom: 0, // Minimize bottom padding
        left: 0, // Minimize left padding
        right: 0, // Minimize right padding
      },
    },
    plugins: {
      legend: {
        position: "right" as const,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const datasetLabel = context.dataset.label || "";
            const provider = context.label;
            const value = context.raw;

            return `${provider}: ₹${value} (${datasetLabel})`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large"/>
      </div>
    );
  }

  if (Object.keys(yearData).length === 0) {
    return <NoData />;
  }

  return (
    <div className=" bg-white rounded-md  w-full px-9">
      <div className="flex justify-between items-center">
        {/* Filters */}
        <div className="flex flex-col gap-4 p-3">
          <h2 className="text-lg font-semibold mb-2">Certification Cost</h2>
          <div className="flex flex-wrap gap-4">
            <FormControl className="w-full sm:w-40">
              {/* Year Dropdown */}
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                label="Year"
                sx={{ height: "35px" }}
              >
                {years
                  .sort((a, b) => b.localeCompare(a))
                  .map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl className="w-full sm:w-40">
              {/* Month Dropdown */}
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                onChange={handleMonthChange}
                label="Month"
                sx={{ height: "35px" }}
              >
                {months.map((month, index) => (
                  <MenuItem key={index} value={index - 1}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        {/* Labels */}
        <div className="flex flex-col gap-2 items-left">
          <span className="text-sm font-medium text-gray-600">
            Outer Circle: Actual Cost
          </span>
          <span className="text-sm font-medium text-gray-600">
            Inner Circle: Estimated Cost
          </span>
        </div>

        {/* Doughnut Chart */}
        <div className="w-300 h-200">
          <Doughnut
            data={data}
            options={options}
            width={300} // Width in pixels
            height={200} // Height in pixels
          />
        </div>
      </div>
    </div>
  );
};

export default DoubleLayerDoughnutChart;
