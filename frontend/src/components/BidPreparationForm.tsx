import React, { useState } from 'react';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Checkbox,
  FormControlLabel,
  Paper,
  Container,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Define a type for document categories
interface DocumentCategory {
  name: string;
  subcategories: string[];
}

// Predefined categories and subcategories with proper typing
const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    name: 'Earnest Money Deposit',
    subcategories: []
  },
  {
    name: 'Covering Letter',
    subcategories: []
  },
  {
    name: 'Company Information',
    subcategories: [
      'Company registration certificate',
      'Service tax registration certificate',
      'PAN card',
      'List of Directors and details',
      'Authorization from parent company',
      'Power of Attorney',
      'ISO 9001 certificate'
    ]
  },
  {
    name: 'Company Brochure',
    subcategories: []
  },
  {
    name: 'Annual Turnover Form',
    subcategories: [
      'CA Certificate',
      'Balance Sheets'
    ]
  },
  {
    name: 'Bidder Information',
    subcategories: [
      'Information regarding status of Bidder',
      'Experience Certificates',
      'Project Data Sheets',
      'List of Expertise',
      'CVs',
      'Approach and Methodology'
    ]
  },
  {
    name: 'Legal Documents',
    subcategories: [
      'Form for de-bar declaration',
      'Indemnity Bond'
    ]
  },
  {
    name: 'Project Planning',
    subcategories: [
      'Work schedule',
      'Employee schedule'
    ]
  },
  {
    name: 'Tender Documents',
    subcategories: [
      'Tender Doc and Addenda',
      'Tender Costing'
    ]
  }
];

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f4f4f4'
    }
  },
  components: {
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          marginBottom: '16px',
          '&:before': {
            display: 'none',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          padding: '12px 24px',
        }
      }
    }
  }
});

interface HeaderInfo {
  projectName: string;
  bidNumber: string;
  businessDevelopmentHead: string;
  client: string;
  regionalBusinessDevelopmentHead: string;
  submissionDate: string;
  submissionMode: string;
}

interface FooterInfo {
  preparedBy: string;
  reviewedBy: string;
  approvedBy: string;
  date: string;
}

interface DocumentEntry {
  category: string;
  subcategory?: string;
  isRequired: boolean;
  isEnclosed: boolean;
  date?: string;
  remarks?: string;
}

const BidPreparationForm: React.FC = () => {
  const [header, setHeader] = useState<HeaderInfo>({
    projectName: '',
    bidNumber: '',
    businessDevelopmentHead: '',
    client: '',
    regionalBusinessDevelopmentHead: '',
    submissionDate: '',
    submissionMode: ''
  });

  const [footer, setFooter] = useState<FooterInfo>({
    preparedBy: '',
    reviewedBy: '',
    approvedBy: '',
    date: ''
  });

  const [documentEntries, setDocumentEntries] = useState<DocumentEntry[]>([]);

  const handleHeaderChange = (field: keyof HeaderInfo, value: string) => {
    setHeader(prev => ({ ...prev, [field]: value }));
  };

  const handleFooterChange = (field: keyof FooterInfo, value: string) => {
    setFooter(prev => ({ ...prev, [field]: value }));
  };

  const handleAddDocumentEntry = () => {
    setDocumentEntries([
      ...documentEntries, 
      { 
        category: '', 
        subcategory: '', 
        isRequired: false, 
        isEnclosed: false, 
        date: '', 
        remarks: '' 
      }
    ]);
  };

  const updateDocumentEntry = (index: number, updates: Partial<DocumentEntry>) => {
    const updatedEntries = [...documentEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      ...updates
    };
    setDocumentEntries(updatedEntries);
  };

  const removeDocumentEntry = (index: number) => {
    const updatedEntries = documentEntries.filter((_, i) => i !== index);
    setDocumentEntries(updatedEntries);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box sx={{ 
          backgroundColor: 'background.default', 
          minHeight: '100vh', 
          py: 4 
        }}>
          <Paper elevation={3} sx={{ 
            p: 4, 
            borderRadius: 2,
            backgroundColor: 'white'
          }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                textAlign: 'center', 
                mb: 4,
                fontWeight: 'bold',
                color: 'primary.main'
              }}
            >
              Bid Preparation Form
            </Typography>

            {/* Header Section */}
            <Card sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Header Information
                </Typography>
                <Grid container spacing={3}>
                  {(Object.keys(header) as Array<keyof HeaderInfo>).map((field) => (
                    <Grid item xs={12} sm={6} key={field}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        value={header[field]}
                        onChange={(e) => handleHeaderChange(field, e.target.value)}
                        type={field.includes('Date') ? 'date' : 'text'}
                        InputLabelProps={field.includes('Date') ? { shrink: true } : {}}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Document Entries Section */}
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                color: 'primary.main',
                display: 'flex', 
                alignItems: 'center' 
              }}
            >
              Document Entries
              <IconButton 
                color="primary" 
                onClick={handleAddDocumentEntry}
                sx={{ ml: 2 }}
              >
                <AddIcon />
              </IconButton>
            </Typography>

            {documentEntries.map((entry, index) => (
              <Card key={index} sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={entry.category}
                          onChange={(e) => {
                            const selectedCategory = DOCUMENT_CATEGORIES.find(
                              cat => cat.name === e.target.value
                            );
                            updateDocumentEntry(index, { 
                              category: e.target.value as string,
                              subcategory: selectedCategory && selectedCategory.subcategories.length ? '' : undefined
                            });
                          }}
                          label="Category"
                        >
                          {DOCUMENT_CATEGORIES.map((category) => (
                            <MenuItem key={category.name} value={category.name}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {DOCUMENT_CATEGORIES.find(cat => cat.name === entry.category)?.subcategories.length && (
                      <Grid item xs={12} sm={5}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Subcategory</InputLabel>
                          <Select
                            value={entry.subcategory || ''}
                            onChange={(e) => updateDocumentEntry(index, { subcategory: e.target.value as string })}
                            label="Subcategory"
                          >
                            {DOCUMENT_CATEGORIES.find(cat => cat.name === entry.category)?.subcategories.map((subcategory: string) => (
                              <MenuItem key={subcategory} value={subcategory}>
                                {subcategory}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    <Grid item xs={6} sm={1}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={entry.isRequired}
                            onChange={(e) => updateDocumentEntry(index, { isRequired: e.target.checked })}
                            color="primary"
                          />
                        }
                        label="Required"
                      />
                    </Grid>

                    <Grid item xs={6} sm={1}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={entry.isEnclosed}
                            onChange={(e) => updateDocumentEntry(index, { isEnclosed: e.target.checked })}
                            color="primary"
                          />
                        }
                        label="Enclosed"
                      />
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={entry.date || ''}
                        onChange={(e) => updateDocumentEntry(index, { date: e.target.value })}
                      />
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Remarks"
                        value={entry.remarks || ''}
                        onChange={(e) => updateDocumentEntry(index, { remarks: e.target.value })}
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <IconButton 
                        color="error" 
                        onClick={() => removeDocumentEntry(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            {/* Footer (Signature) Section */}
            <Card sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Signature (Footer)
                </Typography>
                <Grid container spacing={3}>
                  {(Object.keys(footer) as Array<keyof FooterInfo>).map((field) => (
                    <Grid item xs={12} sm={6} key={field}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        value={footer[field]}
                        onChange={(e) => handleFooterChange(field, e.target.value)}
                        type={field === 'date' ? 'date' : 'text'}
                        InputLabelProps={field === 'date' ? { shrink: true } : {}}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
              >
                Submit Bid Preparation Form
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default BidPreparationForm;
