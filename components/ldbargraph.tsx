"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axios from "axios";

// Register Chart.js components
ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

type FilterOptions = {
  financialYear: string[];
  department: string[];
  provider: string[];
};

type ChartDataItem = {
  financialYear: string;
  department: string;
  provider: string;
  month: string;
  count: number;
};

type ApiResponse = {
  certifications: {
    financial_year: string;
    department: string;
    provider_name: string;
    monthly_data: Record<string, number>;
  }[];
};

// Helper Functions
const generateColor = (index: number, alpha = 0.6) => {
  const randomChannel = () => Math.floor(Math.random() * 256);
  return `rgba(${randomChannel()}, ${randomChannel()}, ${randomChannel()}, ${alpha})`;
};

const BarGraph: React.FC = () => {
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Record<string, string>>({
    financialYear: "All",
    department: "All",
    provider: "All",
  });

  const [baseFilterOptions, setBaseFilterOptions] = useState<FilterOptions>({
    financialYear: [],
    department: [],
    provider: [],
  });

  const colorRef = useRef<Map<string, string>>(new Map());

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<ApiResponse>("nominationcount.json");
      const certifications = response.data.certifications;

      // Extract filter options
      const baseOptions = {
        financialYear: ["All", ...new Set(certifications.map((item) => item.financial_year))],
        department: ["All", ...new Set(certifications.map((item) => item.department))],
        provider: ["All", ...new Set(certifications.map((item) => item.provider_name))],
      };

      setBaseFilterOptions(baseOptions);

      // Transform data for chart
      const chartData = certifications.flatMap((item) =>
        Object.entries(item.monthly_data).map(([month, count]) => ({
          financialYear: item.financial_year,
          department: item.department,
          provider: item.provider_name,
          month,
          count,
        }))
      );

      setData(chartData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Dynamically calculate filter options based on current filters
  const filterOptions = useMemo(() => {
    const filteredCertifications = data.filter((item) => {
      return (
        (filters.financialYear === "All" || item.financialYear === filters.financialYear) &&
        (filters.department === "All" || item.department === filters.department) &&
        (filters.provider === "All" || item.provider === filters.provider)
      );
    });

    return {
      financialYear: [
        "All",
        ...new Set(filteredCertifications.map((item) => item.financialYear)),
      ],
      department: [
        "All",
        ...new Set(filteredCertifications.map((item) => item.department)),
      ],
      provider: [
        "All",
        ...new Set(filteredCertifications.map((item) => item.provider)),
      ],
    };
  }, [data, filters]);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return (
        (filters.financialYear === "All" || item.financialYear === filters.financialYear) &&
        (filters.department === "All" || item.department === filters.department) &&
        (filters.provider === "All" || item.provider === filters.provider)
      );
    });
  }, [data, filters]);

  // Prepare Chart Data
  const months = useMemo(() => {
    const uniqueMonths = Array.from(new Set(data.map((item) => item.month)));
    return uniqueMonths.sort(
      (a, b) => new Date(`2000-${a}-01`).getTime() - new Date(`2000-${b}-01`).getTime()
    );
  }, [data]);

  const datasets = useMemo(() => {
    const providers = Array.from(new Set(filteredData.map((item) => item.provider)));

    providers.forEach((provider, index) => {
      if (!colorRef.current.has(provider)) {
        colorRef.current.set(provider, generateColor(index));
      }
    });

    return providers.map((provider) => {
      const data = months.map((month) => {
        const matchingData = filteredData.find((item) => item.provider === provider && item.month === month);
        return matchingData ? matchingData.count : 0; // Default to 0 if no data for the month
      });

      return {
        label: provider,
        data,
        backgroundColor: colorRef.current.get(provider),
        borderColor: colorRef.current.get(provider)?.replace("0.6", "1"),
        borderWidth: 1,
      };
    });
  }, [filteredData, months]);

  const chartData = {
    labels: months,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right", // Position the legend on the right
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Certifications",
        },
      },
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
    },
  };
  

  return (
    <div className="h-52 mx-9 bg-whitegrey rounded-md shadow-md px-3 py-4">
      <h2>Certifications by Month</h2>
      <div className="flex flex-row">
      <div className="flex gap-4 mb-4 flex-col">
        {(Object.keys(filters) as Array<keyof typeof filterOptions>).map((filterKey) => (
          <div key={filterKey}>
            <label htmlFor={filterKey} className="block mb-1 capitalize">
              {filterKey.replace(/([A-Z])/g, " $1")}
            </label>
            <select
              id={filterKey}
              value={filters[filterKey]}
              onChange={(e) => setFilters({ ...filters, [filterKey]: e.target.value })}
              disabled={loading || filterOptions[filterKey].length === 0}
            >
              {filterOptions[filterKey].map((option) => (
                <option key={`${filterKey}-${option}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
<div>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredData.length > 0 ? (
        <Bar data={chartData} options={options} height={200} width={550} />
      ) : (
        <p>No data available.</p>
      )}
      </div>
      </div>
    </div>
  );
};

export default BarGraph;
