"use client";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Alert, Flex, Spin } from "antd";


// Define types for your data structure
interface ProviderData {
  [provider: string]: number[];
}

interface DepartmentData {
  [department: string]: ProviderData;
}

interface CostData {
  [year: string]: {
    labels: string[];
    departments: DepartmentData;
  };
}

interface APIData {
  costData: CostData;
}

const BarGraph: React.FC = () => {
  const [data, setData] = useState<APIData | null>(null); // API data
  const [financialYear, setFinancialYear] = useState("All");
  const [provider, setProvider] = useState("All");
  const [department, setDepartment] = useState("All");
  const [chartData, setChartData] = useState<any>(null);
  const [isloading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("newbarchartdata.json"); // Hardcoded API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const jsonData: APIData = await response.json(); // Specify the data type
        setData(jsonData);

        // Set default values for filters
        setFinancialYear("All");
        setDepartment("All");
        setProvider("All");
      } catch (error) {
        console.error("Error fetching API data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update chart data when filters change
  useEffect(() => {
    if (data) {
      let labels: string[] = [];
      let aggregatedData: number[] = [];

      if (financialYear === "All") {
        // Aggregate data for all years
        labels = Object.values(data.costData)[0]?.labels || [];
        Object.keys(data.costData).forEach((year) => {
          Object.entries(data.costData[year].departments).forEach(
            ([deptName, providers]) => {
              if (department === "All" || department === deptName) {
                Object.entries(providers).forEach(([prov, values]) => {
                  if (provider === "All" || provider === prov) {
                    values.forEach((value: number, index: number) => {
                      aggregatedData[index] =
                        (aggregatedData[index] || 0) + value;
                    });
                  }
                });
              }
            }
          );
        });
      } else {
        // Aggregate data for selected year
        const yearData = data.costData[financialYear];
        labels = yearData.labels;
        Object.entries(yearData.departments).forEach(
          ([deptName, providers]) => {
            if (department === "All" || department === deptName) {
              Object.entries(providers).forEach(([prov, values]) => {
                if (provider === "All" || provider === prov) {
                  values.forEach((value: number, index: number) => {
                    aggregatedData[index] =
                      (aggregatedData[index] || 0) + value;
                  });
                }
              });
            }
          }
        );
      }

      // Update chart data
      setChartData({
        labels,
        datasets: [
          {
            label: `Certifications (${
              provider === "All" ? "All Providers" : provider
            })`,
            data: aggregatedData,
            backgroundColor: "rgba(0, 112, 187, 1)",
            borderColor: "rgba(0, 112, 187, 1)",
            borderWidth: 1,
          },
        ],
      });
    }
  }, [data, financialYear, department, provider]);

  if (isloading)
    return (
      <Flex align="center" justify="center" gap="middle">
        <Spin size="large" />
      </Flex>
    );
  if (!data)
    return (
      <Alert
        message="Error"
        description="No Data Available.Check Your Network Connection"
        type="error"
        showIcon
      />
    );

  return (
    <div className="bg-white mx-3 my-4 p-4 rounded-md">
      <h1>Certifications Per Month</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Bar Graph */}
        {chartData ? (
          <div className="w-full max-w-full md:max-w-[600px] md:h-[300px]">
            <Bar
              className="mt-5"
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Months",
                    },
                    grid: {
                      display: false, // Remove the grid lines for the x-axis
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Number of Certifications",
                    },
                    grid: {
                      display: false, // Remove the grid lines for the x-axis
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <Flex align="center" gap="middle">
            <Spin size="small" />
            <Spin />
            <Spin size="large" />
          </Flex>
        )}
        <div className="flex  flex-col gap-6 items-center bg-white ml-12 flex-wrap">
          {/* Financial Year Filter */}
          <FormControl
            className="w-full md:w-48"
            size="small"
            variant="outlined"
          >
            <InputLabel id="financial-year-label">Financial Year</InputLabel>
            <Select
              labelId="financial-year-label"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              label="Financial Year"
            >
              <MenuItem value="All">All</MenuItem>
              {Object.keys(data.costData).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Department Filter */}
          <FormControl
            className="w-full md:w-48"
            size="small"
            variant="outlined"
          >
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              label="Department"
            >
              <MenuItem value="All">All</MenuItem>
              {Object.keys(
                financialYear === "All"
                  ? data.costData[Object.keys(data.costData)[0]].departments
                  : data.costData[financialYear]?.departments || {}
              ).map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Provider Filter */}
          <FormControl
            className="w-full md:w-48"
            size="small"
            variant="outlined"
          >
            <InputLabel id="provider-label">Provider</InputLabel>
            <Select
              labelId="provider-label"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              label="Provider"
            >
              <MenuItem value="All">All</MenuItem>
              {Object.keys(
                financialYear === "All"
                  ? data.costData[Object.keys(data.costData)[0]].departments[
                      department === "All"
                        ? Object.keys(
                            data.costData[Object.keys(data.costData)[0]]
                              .departments
                          )[0]
                        : department
                    ] || {}
                  : data.costData[financialYear]?.departments[department] || {}
              ).map((prov) => (
                <MenuItem key={prov} value={prov}>
                  {prov}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export default BarGraph;
