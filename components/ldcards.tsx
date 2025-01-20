"use client"
import { useState, useEffect } from "react";
import SpinnerComponent from "./spinnercomponent";
import Alert from "antd/es/alert";
import { Flex, Spin } from "antd";


interface DashboardCard {
  title: string;
  value: string;
  message: string;
  icon: string;
}

export default function DashboardCards() {
  const [data, setData] = useState<DashboardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("ldcarddata.json");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result: DashboardCard[] = await response.json();
        setData(result);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return  <Flex align="center" justify="center" gap="middle">
    <Spin size="large" />
  </Flex>;
  }

  if (error) {
    return <Alert
    message="Error"
    description="No Data Available.Check Your Network Connection"
    type="error"
    showIcon
  />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white text-grey-800 p-4 rounded-lg shadow-md flex flex-col"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{item.title}</h4>
            {/* <span className="text-xl">{item.icon}</span> */}
          </div>
          <div className="mt-4 text-2xl font-bold">{item.value}</div>
          <p className="text-sm text-gray-400 mt-2">{item.message}</p>
        </div>
      ))}
    </div>
  );
}
