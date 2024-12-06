import React, { useState } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Typography,
  styled
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: '#1976d2',
  color: 'white',
  fontSize: 15,
  padding: '16px 20px',
  whiteSpace: 'nowrap',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f5f5f5',
  },
  '&:hover': {
    backgroundColor: '#e3f2fd',
  },
  '& td': {
    padding: '16px 8px',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    height: '45px',
    '& fieldset': {
      borderColor: '#e0e0e0',
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderColor: '#1976d2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
  },
  '& input': {
    padding: '12px 16px',
    fontSize: '15px',
  },
  '& input[type="date"]': {
    padding: '8px 16px',
  },
});

const WideTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    height: '45px',
    width: '300px',
    '& fieldset': {
      borderColor: '#e0e0e0',
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderColor: '#1976d2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
  },
  '& input': {
    padding: '12px 16px',
    fontSize: '15px',
  },
});

const AddButton = styled(Button)(({ theme }) => ({
  marginTop: '20px',
  padding: '10px 30px',
  backgroundColor: '#2196f3',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#1976d2',
  },
  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`correspondence-tabpanel-${index}`}
      aria-labelledby={`correspondence-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface InwardRow {
  srNo: number;
  incomingLetterNo: string;
  letterDate: string;
  njsInwardNo: string;
  receiptDate: string;
  from: string;
  subject: string;
  attachmentDetails: string;
  actionTaken: string;
  storagePath: string;
  remarks: string;
  repliedDate: string;
}

interface OutwardRow {
  srNo: number;
  letterNo: string;
  letterDate: string;
  to: string;
  subject: string;
  attachmentDetails: string;
  actionTaken: string;
  storagePath: string;
  remarks: string;
  acknowledgement: string;
}

const CorrespondenceForm: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [inwardRows, setInwardRows] = useState<InwardRow[]>([
    {
      srNo: 1,
      incomingLetterNo: '',
      letterDate: '',
      njsInwardNo: '',
      receiptDate: '',
      from: '',
      subject: '',
      attachmentDetails: '',
      actionTaken: '',
      storagePath: '',
      remarks: '',
      repliedDate: ''
    }
  ]);
  const [outwardRows, setOutwardRows] = useState<OutwardRow[]>([
    {
      srNo: 1,
      letterNo: '',
      letterDate: '',
      to: '',
      subject: '',
      attachmentDetails: '',
      actionTaken: '',
      storagePath: '',
      remarks: '',
      acknowledgement: ''
    }
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddInwardRow = () => {
    const newRow: InwardRow = {
      srNo: inwardRows.length + 1,
      incomingLetterNo: '',
      letterDate: '',
      njsInwardNo: '',
      receiptDate: '',
      from: '',
      subject: '',
      attachmentDetails: '',
      actionTaken: '',
      storagePath: '',
      remarks: '',
      repliedDate: ''
    };
    setInwardRows([...inwardRows, newRow]);
  };

  const handleAddOutwardRow = () => {
    const newRow: OutwardRow = {
      srNo: outwardRows.length + 1,
      letterNo: '',
      letterDate: '',
      to: '',
      subject: '',
      attachmentDetails: '',
      actionTaken: '',
      storagePath: '',
      remarks: '',
      acknowledgement: ''
    };
    setOutwardRows([...outwardRows, newRow]);
  };

  const handleInwardChange = (index: number, field: keyof InwardRow, value: string) => {
    const newRows = [...inwardRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setInwardRows(newRows);
  };

  const handleOutwardChange = (index: number, field: keyof OutwardRow, value: string) => {
    const newRows = [...outwardRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setOutwardRows(newRows);
  };

  return (
    <Paper sx={{ p: 4, backgroundColor: '#fff' }} elevation={3}>
      <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3, fontSize: '24px' }}>
        PMD4. Correspondence Inward-Outward
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              fontSize: '16px',
              fontWeight: 'bold',
              textTransform: 'none',
              minHeight: '50px',
            },
            '& .Mui-selected': {
              color: '#1976d2',
            },
          }}
        >
          <Tab label="Inward" />
          <Tab label="Outward" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Sr. No.</StyledTableCell>
                <StyledTableCell sx={{ minWidth: '150px' }}>Incoming Letter No.</StyledTableCell>
                <StyledTableCell>Letter Date</StyledTableCell>
                <StyledTableCell sx={{ minWidth: '150px' }}>NJS Inward No</StyledTableCell>
                <StyledTableCell>Receipt date</StyledTableCell>
                <StyledTableCell>From</StyledTableCell>
                <StyledTableCell sx={{ minWidth: '250px' }}>Subject</StyledTableCell>
                <StyledTableCell>Attachment Details</StyledTableCell>
                <StyledTableCell>Action taken</StyledTableCell>
                <StyledTableCell>Storage path</StyledTableCell>
                <StyledTableCell>Remarks</StyledTableCell>
                <StyledTableCell>Replied date</StyledTableCell>
              </TableRow>
</TableHead>
            <TableBody>
              {inwardRows.map((row, index) => (
                <StyledTableRow key={row.srNo}>
                  <TableCell sx={{ fontSize: '15px' }}>{row.srNo}</TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      value={row.incomingLetterNo}
                      onChange={(e) => handleInwardChange(index, 'incomingLetterNo', e.target.value)}
                      placeholder="Enter letter no."
                    />
                  </TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      type="date"
                      value={row.letterDate}
                      onChange={(e) => handleInwardChange(index, 'letterDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      value={row.njsInwardNo}
                      onChange={(e) => handleInwardChange(index, 'njsInwardNo', e.target.value)}
                      placeholder="Enter NJS no."
                    />
                  </TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      type="date"
                      value={row.receiptDate}
                      onChange={(e) => handleInwardChange(index, 'receiptDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <WideTextField
                      fullWidth
                      value={row.from}
                      onChange={(e) => handleInwardChange(index, 'from', e.target.value)}
                      placeholder="From"
                    />
                  </TableCell>
                  <TableCell>
                    <WideTextField
                      fullWidth
                      value={row.subject}
                      onChange={(e) => handleInwardChange(index, 'subject', e.target.value)}
                      placeholder="Enter subject"
                    />
                  </TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      value={row.attachmentDetails}
                      onChange={(e) => handleInwardChange(index, 'attachmentDetails', e.target.value)}
                      placeholder="Attachment details"
                    />
                  </TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      value={row.actionTaken}
                      onChange={(e) => handleInwardChange(index, 'actionTaken', e.target.value)}
                      placeholder="Action taken"
                    />
                  </TableCell>
                  <TableCell>
                    <WideTextField
                      fullWidth
                      value={row.storagePath}
                      onChange={(e) => handleInwardChange(index, 'storagePath', e.target.value)}
                      placeholder="Storage path"
                    />
                  </TableCell>
                  <TableCell>
                    <WideTextField
                      fullWidth
                      value={row.remarks}
                      onChange={(e) => handleInwardChange(index, 'remarks', e.target.value)}
                      placeholder="Enter remarks"
                    />
                  </TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      type="date"
                      value={row.repliedDate}
                      onChange={(e) => handleInwardChange(index, 'repliedDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <AddButton
            variant="contained"
            onClick={handleAddInwardRow}
            startIcon={<AddCircleOutlineIcon />}
          >
            Add Row
          </AddButton>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Sr. No.</StyledTableCell>
                <StyledTableCell sx={{ minWidth: '150px' }}>Letter No.</StyledTableCell>
                <StyledTableCell>Letter Date</StyledTableCell>
                <StyledTableCell>To</StyledTableCell>
                <StyledTableCell sx={{ minWidth: '250px' }}>Subject</StyledTableCell>
                <StyledTableCell>Attachment Details</StyledTableCell>
                <StyledTableCell>Action taken</StyledTableCell>
                <StyledTableCell>Storage path</StyledTableCell>
                <StyledTableCell>Remarks</StyledTableCell>
                <StyledTableCell>Acknowledgement</StyledTableCell>
              </TableRow>
</TableHead>
            <TableBody>
              {outwardRows.map((row, index) => (
                <StyledTableRow key={row.srNo}>
                  <TableCell sx={{ fontSize: '15px' }}>{row.srNo}</TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      value={row.letterNo}
                      onChange={(e) => handleOutwardChange(index, 'letterNo', e.target.value)}
                      placeholder="Enter letter no."
                    />
                  </TableCell>
<TableCell>
                    <StyledTextField
                      fullWidth
                      type="date"
                      value={row.letterDate}
                      onChange={(e) => handleOutwardChange(index, 'letterDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <WideTextField
                      fullWidth
                      value={row.to}
                      onChange={(e) => handleOutwardChange(index, 'to', e.target.value)}
                      placeholder="To"
                    />
                  </TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      value={row.subject}
                      onChange={(e) => handleOutwardChange(index, 'subject', e.target.value)}
                      placeholder="Enter subject"
                    />
                  </TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      value={row.attachmentDetails}
                      onChange={(e) => handleOutwardChange(index, 'attachmentDetails', e.target.value)}
                      placeholder="Attachment details"
                    />
                  </TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      value={row.actionTaken}
                      onChange={(e) => handleOutwardChange(index, 'actionTaken', e.target.value)}
                      placeholder="Action taken"
                    />
                  </TableCell>
                  <TableCell>
                    <WideTextField
                      fullWidth
                      value={row.storagePath}
                      onChange={(e) => handleOutwardChange(index, 'storagePath', e.target.value)}
                      placeholder="Storage path"
                    />
                  </TableCell>
                  <TableCell>
                    <WideTextField
                      fullWidth
                      value={row.remarks}
                      onChange={(e) => handleOutwardChange(index, 'remarks', e.target.value)}
                      placeholder="Enter remarks"
                    />
                  </TableCell>
                  <TableCell>
                    <StyledTextField
                      fullWidth
                      value={row.acknowledgement}
                      onChange={(e) => handleOutwardChange(index, 'acknowledgement', e.target.value)}
                      placeholder="Enter acknowledgement"
                    />
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <AddButton
            variant="contained"
            onClick={handleAddOutwardRow}
            startIcon={<AddCircleOutlineIcon />}
          >
            Add Row
          </AddButton>
        </Box>
      </TabPanel>
    </Paper>
  );
};

export default CorrespondenceForm;
