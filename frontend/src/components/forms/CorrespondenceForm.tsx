import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Typography,
  styled,
  Container,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CorrespondenceDialog from './Correspondancecomponents/CorrespondenceDialog';
import {
  createInwardRow,
  createOutwardRow,
  getInwardRows,
  getOutwardRows
} from '../../dummyapi/correspondenceApi';

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(0),
  '& .MuiButton-root': {
    marginLeft: 'auto'
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: '40px',
  '& .MuiTab-root': {
    minHeight: '40px',
    padding: '0 16px',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none',
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiTabs-indicator': {
    height: '2px',
  },
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
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const CorrespondenceForm: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inwardRows, setInwardRows] = useState<any[]>([]);
  const [outwardRows, setOutwardRows] = useState<any[]>([]);

  useEffect(() => {
    const projectId = "dummy-project-id";
    setInwardRows(getInwardRows(projectId));
    setOutwardRows(getOutwardRows(projectId));
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSave = (data: any) => {
    const projectId = "dummy-project-id";
    const newData = { ...data, projectId };

    if (tabValue === 0) {
      const newRow = createInwardRow(newData);
      setInwardRows([...inwardRows, newRow]);
    } else {
      const newRow = createOutwardRow(newData);
      setOutwardRows([...outwardRows, newRow]);
    }
  };

  const renderInwardAccordions = () => {
    return inwardRows.map((row, index) => (
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
            <Grid item xs={2}>
              <Typography fontWeight="medium">{row.incomingLetterNo}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography color="text.secondary">{row.letterDate}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography>{row.from}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography noWrap>{row.subject}</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  Letter Information
                </Typography>
                <Typography variant="body2" paragraph>
                  NJS Inward No: {row.njsInwardNo}
                </Typography>
                <Typography variant="body2" paragraph>
                  Receipt Date: {row.receiptDate}
                </Typography>
                <Typography variant="body2" paragraph>
                  Attachment Details: {row.attachmentDetails}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  Action Information
                </Typography>
                <Typography variant="body2" paragraph>
                  Action Taken: {row.actionTaken}
                </Typography>
                <Typography variant="body2" paragraph>
                  Storage Path: {row.storagePath}
                </Typography>
                <Typography variant="body2" paragraph>
                  Replied Date: {row.repliedDate}
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
    ));
  };

  const renderOutwardAccordions = () => {
    return outwardRows.map((row, index) => (
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
            <Grid item xs={2}>
              <Typography fontWeight="medium">{row.letterNo}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography color="text.secondary">{row.letterDate}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography>{row.to}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography noWrap>{row.subject}</Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  Letter Information
                </Typography>
                <Typography variant="body2" paragraph>
                  Attachment Details: {row.attachmentDetails}
                </Typography>
                <Typography variant="body2" paragraph>
                  Storage Path: {row.storagePath}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary" variant="caption" display="block" gutterBottom>
                  Action Information
                </Typography>
                <Typography variant="body2" paragraph>
                  Action Taken: {row.actionTaken}
                </Typography>
                <Typography variant="body2" paragraph>
                  Acknowledgement: {row.acknowledgement}
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
    ));
  };

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
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#1976d2',
                  fontWeight: 500,
                  mb: 2
                }}
              >
                PMD4. Correspondence Inward-Outward
              </Typography>
              <StyledTabs 
                value={tabValue} 
                onChange={handleTabChange}
              >
                <Tab label="Inward" />
                <Tab label="Outward" />
              </StyledTabs>
            </Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Entry
            </Button>
          </StyledHeaderBox>

          <Box sx={{ mt: 2 }}>
            <TabPanel value={tabValue} index={0}>
              {renderInwardAccordions()}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {renderOutwardAccordions()}
            </TabPanel>
          </Box>

          <CorrespondenceDialog
            open={dialogOpen}
            onClose={handleDialogClose}
            onSave={handleSave}
            type={tabValue === 0 ? 'inward' : 'outward'}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default CorrespondenceForm;
