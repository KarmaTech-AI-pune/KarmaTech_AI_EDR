import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Props interface for the TableTemplate component
export interface TableTemplateProps {
  title: string;
  headers: string[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  children?: React.ReactNode;
  alignHeaders?: ('left' | 'center' | 'right')[];
  headerWidths?: string[];
}

const TableTemplate: React.FC<TableTemplateProps> = ({
  title,
  headers,
  isExpanded = false,
  onToggleExpand = () => {},
  children,
  alignHeaders,
  headerWidths
}) => {
  // Styles
  const tableHeaderStyle = {
    '& .MuiTableCell-head': {
      fontWeight: 600,
      backgroundColor: '#f5f5f5',
      borderBottom: '2px solid #e0e0e0'
    }
  };

  const tableCellStyle = {
    borderBottom: '1px solid #e0e0e0',
    padding: '12px 16px'
  };

  const accordionStyle = {
    '& .MuiAccordionSummary-root': {
      backgroundColor: '#f8f9fa',
      borderLeft: '3px solid #1976d2',
      minHeight: '48px',
      '&.Mui-expanded': {
        borderBottom: '1px solid #e0e0e0'
      }
    },
    '& .MuiAccordionSummary-content': {
      margin: '12px 0',
      '&.Mui-expanded': {
        margin: '12px 0'
      }
    },
    '& .MuiAccordionDetails-root': {
      padding: 0,
      backgroundColor: '#fff'
    }
  };

  const sectionStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    '& .MuiAccordion-root': {
      borderRadius: '4px 4px 0 0 !important',
      borderBottom: 'none'
    },
    '& .MuiTableContainer-root': {
      borderRadius: '0 0 4px 4px',
      borderTop: 'none'
    }
  };

  return (
    <Box sx={{ ...sectionStyle, mb: 3 }}>
      <Accordion
        expanded={isExpanded}
        onChange={onToggleExpand}
        elevation={0}
        sx={accordionStyle}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={tableHeaderStyle}>
                  {headers.map((header, index) => (
                    <TableCell 
                      key={index} 
                      sx={{
                        ...tableCellStyle,
                        ...(headerWidths && headerWidths[index] ? { width: headerWidths[index] } : {})
                      }}
                      align={alignHeaders && alignHeaders[index] ? alignHeaders[index] : 'left'}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {children}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default TableTemplate;
