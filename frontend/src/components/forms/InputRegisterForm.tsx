import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Chip,
  Container,
  Alert,
  styled,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InputRegisterDialog from './InputRegisterformcomponents/InputRegisterDialog';
import { deleteInputRegister, getInputRegisterByProject } from '../../dummyapi/inputRegisterApi';
import { projectManagementAppContext } from '../../App';

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  '& .MuiButton-root': {
    marginLeft: 'auto'
  }
}));

interface InputRegisterRow {
  id: number;
  projectId: number;
  dataReceived: string;
  receiptDate: string;
  receivedFrom: string;
  filesFormat: string;
  noOfFiles: number;
  fitForPurpose: boolean;
  check: boolean;
  checkedBy: string;
  checkedDate: string;
  custodian: string;
  storagePath: string;
  remarks: string;
}

const InputRegisterForm: React.FC = () => {
  const theme = useTheme();
  const context = useContext(projectManagementAppContext);
  const [rows, setRows] = useState<InputRegisterRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<InputRegisterRow | undefined>(undefined);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!context?.selectedProject?.id) {
      setError('No project selected');
      return;
    }

    try {
      const data = getInputRegisterByProject(context.selectedProject.id);
      setRows(data);
      setError('');
    } catch (err) {
      setError('Failed to load input register data');
    }
  }, [context?.selectedProject?.id]);

  if (!context?.selectedProject?.id) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="warning">Please select a project to view the input register.</Alert>
      </Container>
    );
  }

  const handleOpenDialog = (row?: InputRegisterRow) => {
    setSelectedRow(row);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedRow(undefined);
    setDialogOpen(false);
  };

  const handleSave = (data: InputRegisterRow) => {
    try {
      if (selectedRow) {
        setRows(rows.map(row => row.id === selectedRow.id ? data : row));
      } else {
        setRows([...rows, data]);
      }
      setError('');
    } catch (err) {
      setError('Failed to save changes');
    }
  };

  const handleDelete = (id: number) => {
    try {
      if (deleteInputRegister(id)) {
        setRows(rows.filter(row => row.id !== id));
        setError('');
      }
    } catch (err) {
      setError('Failed to delete entry');
    }
  };

  const StatusChip = ({ label, status }: { label: string; status: boolean }) => (
    <Chip
      icon={status ? <CheckCircleIcon /> : <CancelIcon />}
      label={label}
      size="small"
      color={status ? "success" : "default"}
      sx={{
        fontSize: '0.75rem',
        '& .MuiChip-icon': {
          fontSize: '1rem',
        },
      }}
    />
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ 
        width: '100%', 
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1,
        pb: 4
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            backgroundColor: '#fff'
          }}
        >
          <StyledHeaderBox>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#1976d2',
                fontWeight: 500,
                mb: 0
              }}
            >
              PMD3. Input Register
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Entry
            </Button>
          </StyledHeaderBox>

          {error && (
            <Box sx={{ mx: 3, mb: 3 }}>
              <Alert severity="error">
                {error}
              </Alert>
            </Box>
          )}
      
          <Box>
            {rows.map((row, index) => (
              <Accordion 
                key={row.id}
                sx={{
                  '&:before': { display: 'none' },
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  '&:last-child': {
                    borderBottom: 'none'
                  },
                  '&.Mui-expanded': {
                    margin: 0,
                  },
                  backgroundColor: '#fff',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '& .MuiAccordionSummary-content': {
                      margin: '12px 0',
                    },
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={1}>
                      <Typography color="primary" fontWeight="bold">
                        #{index + 1}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography fontWeight="medium">{row.dataReceived}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography color="text.secondary">{row.receiptDate}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography>{row.receivedFrom}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <StatusChip label="Fit for Purpose" status={row.fitForPurpose} />
                        <StatusChip label="Checked" status={row.check} />
                      </Box>
                    </Grid>
                    <Grid item xs={1}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(row);
                          }}
                          size="small"
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.id);
                          }}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                          Files Information
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Format: {row.filesFormat}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Number of Files: {row.noOfFiles}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Storage Path: {row.storagePath}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                          Check Information
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Checked By: {row.checkedBy}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Checked Date: {row.checkedDate}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Custodian: {row.custodian}
                        </Typography>
                      </Box>
                    </Grid>
                    {row.remarks && (
                      <Grid item xs={12}>
                        <Box>
                          <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                            Remarks
                          </Typography>
                          <Typography variant="body2">
                            {row.remarks}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Paper>
      </Box>

      <InputRegisterDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        initialData={selectedRow}
        projectId={context.selectedProject.id}
      />
    </Container>
  );
};

export default InputRegisterForm;
