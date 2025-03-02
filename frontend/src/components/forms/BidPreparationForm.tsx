import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Checkbox,
  Button,
  IconButton,
  Typography,
  Container,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const DOCUMENT_CATEGORIES = [
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

interface ChecklistItem {
  id: string;
  srNo: number;
  description: string;
  remarks: string;
  enclosed: boolean;
  date: Date | null;
  isSubItem?: boolean;
  hasSubcategories?: boolean;
  parentId?: string;
  categoryIndex?: number;
}

const initializeChecklist = (): ChecklistItem[] => {
  let srNo = 1;
  const items: ChecklistItem[] = [];
  
  DOCUMENT_CATEGORIES.forEach((category, index) => {
    const categoryId = `main-${srNo}`;
    items.push({
      id: categoryId,
      srNo: srNo,
      description: category.name,
      remarks: '',
      enclosed: false,
      date: null,
      hasSubcategories: category.subcategories.length > 0,
      categoryIndex: index
    });

    category.subcategories.forEach((subcat, subIndex) => {
      items.push({
        id: `sub-${srNo}-${subIndex}`,
        srNo: srNo,
        description: subcat,
        remarks: '',
        enclosed: false,
        date: null,
        isSubItem: true,
        parentId: categoryId,
        categoryIndex: index
      });
    });

    srNo++;
  });

  return items;
};

const BidPreparationForm: React.FC = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initializeChecklist());
  const [nextSrNo, setNextSrNo] = useState(DOCUMENT_CATEGORIES.length + 1);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string>('');

  const handleAddItem = () => {
    const newItem: ChecklistItem = {
      id: String(Date.now()),
      srNo: nextSrNo,
      description: '',
      remarks: '',
      enclosed: false,
      date: null
    };
    setChecklist([...checklist, newItem]);
    setNextSrNo(nextSrNo + 1);
  };

  const findInsertionIndex = (parentId: string): number => {
    const parentIndex = checklist.findIndex(item => item.id === parentId);
    const parentItem = checklist[parentIndex];
    
    if (parentItem.hasSubcategories) {
      let lastSubItemIndex = parentIndex;
      for (let i = parentIndex + 1; i < checklist.length; i++) {
        if (!checklist[i].isSubItem) break;
        lastSubItemIndex = i;
      }
      return lastSubItemIndex;
    }
    
    return parentIndex;
  };

  const handleAddSubItem = (parentId: string, categoryIndex: number) => {
    const insertAfterIndex = findInsertionIndex(parentId);
    const parentItem = checklist.find(item => item.id === parentId)!;
    
    const newItem: ChecklistItem = {
      id: `new-${Date.now()}`,
      srNo: parentItem.srNo,
      description: '',
      remarks: '',
      enclosed: false,
      date: null,
      isSubItem: true,
      parentId: parentItem.hasSubcategories ? parentId : undefined,
      categoryIndex
    };

    const newChecklist = [
      ...checklist.slice(0, insertAfterIndex + 1),
      newItem,
      ...checklist.slice(insertAfterIndex + 1)
    ];

    setChecklist(newChecklist);
  };

  const handleDeleteItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id && item.parentId !== id));
  };

  const handleUpdateItem = <T extends keyof ChecklistItem>(id: string, field: T, value: ChecklistItem[T]) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async () => {
    try {
      // TODO: Implement submission logic
      console.log('Submitting checklist:', checklist);
      setError('');
    } catch {
      setError('Failed to save checklist data');
    }
  };

  const formContent = (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 2,
        minHeight: '100vh',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '& .MuiPaper-root': {
          boxShadow: 'none',
          border: '1px solid rgba(224, 224, 224, 1)',
          borderRadius: 1,
          mb: 2
        }
      }}
    >
      <Box sx={{ 
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        pr: 1
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 2,
          gap: 2, 
          alignItems: 'center' 
        }}>
          {editMode && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              size="small"
            >
              Add New Item
            </Button>
          )}
          <FormControlLabel
            control={
              <Switch
                checked={editMode}
                onChange={() => setEditMode(!editMode)}
                color="primary"
              />
            }
            label="Edit Mode"
          />
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ 
          flex: 1,
          mb: 2,
          '& > div': {
            overflowX: 'auto'
          }
        }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>Sr. No.</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Remarks</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Enclosed</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Date</TableCell>
                {editMode && (
                  <TableCell sx={{ fontWeight: 'bold', width: '100px' }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {checklist.map((item) => (
                <TableRow 
                  key={item.id}
                  sx={item.isSubItem ? { 
                    '& > td:first-of-type': { pl: 4 },
                    '& > td': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
                  } : {}}
                >
                  <TableCell>{item.isSubItem ? '' : item.srNo}</TableCell>
                  <TableCell>
                    {item.hasSubcategories ? (
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {item.description}
                      </Typography>
                    ) : editMode ? (
                      <TextField
                        fullWidth
                        variant="standard"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      />
                    ) : (
                      <Typography>{item.description}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {!item.hasSubcategories && (
                      editMode ? (
                        <TextField
                          fullWidth
                          variant="standard"
                          value={item.remarks}
                          onChange={(e) => handleUpdateItem(item.id, 'remarks', e.target.value)}
                        />
                      ) : (
                        <Typography>{item.remarks}</Typography>
                      )
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {!item.hasSubcategories && (
                      editMode ? (
                        <Checkbox
                          checked={item.enclosed}
                          onChange={(e) => handleUpdateItem(item.id, 'enclosed', e.target.checked)}
                        />
                      ) : (
                        <Typography>{item.enclosed ? 'Yes' : 'No'}</Typography>
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {!item.hasSubcategories && (
                      editMode ? (
                        <DatePicker
                          value={item.date}
                          onChange={(newValue) => handleUpdateItem(item.id, 'date', newValue)}
                          slotProps={{
                            textField: {
                              variant: "standard",
                              fullWidth: true
                            }
                          }}
                        />
                      ) : (
                        <Typography>
                          {item.date ? format(item.date, 'dd/MM/yyyy') : ''}
                        </Typography>
                      )
                    )}
                  </TableCell>
                  {editMode && (
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        gap: 1,
                        minWidth: '80px'
                      }}>
                        {!item.isSubItem && (
                          <IconButton
                            size="small"
                            onClick={() => handleAddSubItem(item.id, item.categoryIndex!)}
                            color="primary"
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'rgba(25, 118, 210, 0.04)' 
                              }
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        )}
                        {!item.hasSubcategories && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteItem(item.id)}
                            sx={{ 
                              color: 'error.main',
                              '&:hover': { 
                                backgroundColor: 'rgba(211, 47, 47, 0.04)' 
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                        {item.hasSubcategories && (
                          <Box sx={{ width: 32 }} />
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: 2
          }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSubmit}
              disabled={checklist.length === 0}
            >
              Save Checklist
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
     
        {formContent}
    </LocalizationProvider>
  );
};

export default BidPreparationForm;
