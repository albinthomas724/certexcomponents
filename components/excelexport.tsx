import React from 'react';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';
import DownloadIcon from '@mui/icons-material/Download';

interface ExcelExportProps {
  data: unknown[];
  fileName: string;
  sx?: object;
}

const ExcelExport: React.FC<ExcelExportProps> = ({ data, fileName }) => {
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return (
    <Button
      startIcon={<DownloadIcon />}
      variant="contained"
      color="primary"
      onClick={handleExport}
      sx={{
        fontSize: { xs: '10px', sm: '12px', md: '14px' },
        padding: { xs: '6px 10px', sm: '8px 16px', md: '10px 20px' },
        margin: { xs: 1, sm: 2 },
        minWidth: '90px',
        textTransform: 'none',
      }}
    >
      Export
    </Button>
  );
};

export default ExcelExport;
