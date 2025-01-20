import { useState, useEffect } from "react";
import { Flex, Spin } from "antd";
import { Alert } from 'antd';

interface SpinnerComponentProps {
    data: any;
  }
  
  const SpinnerComponent: React.FC<SpinnerComponentProps> =  ({ data }) => {
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!data)
      setShowSpinner(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [data]);

  return showSpinner ? (
    <Flex align="center" justify="center" gap="middle">
      <Spin size="large" />
    </Flex>
  ) : (
    <div><Alert
    message="Error"
    description="No Data Available.Check Your Network Connection."
    type="error"
    showIcon
  /></div>
  );
};

export default SpinnerComponent;
