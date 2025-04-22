import { SxProps, Theme } from '@mui/material';

// Shared styles for JobStart Form components
export const textFieldStyle: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    backgroundColor: '#fff',
    '&:hover fieldset': {
      borderColor: '#1976d2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    }
  }
};

export const tableHeaderStyle: SxProps<Theme> = {
  '& .MuiTableCell-head': {
    fontWeight: 600,
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #e0e0e0'
  }
};

export const tableCellStyle: SxProps<Theme> = {
  borderBottom: '1px solid #e0e0e0',
  padding: '12px 16px'
};

export const accordionStyle: SxProps<Theme> = {
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

export const sectionStyle: SxProps<Theme> = {
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

export const summaryRowStyle: SxProps<Theme> = {
  bgcolor: '#f8f9fa',
  '& .MuiTableCell-root': {
    fontWeight: 'bold'
  }
};
