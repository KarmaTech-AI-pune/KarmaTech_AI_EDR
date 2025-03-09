import React, { useState, useEffect, useContext } from 'react';
import BidVersionHistory from './BidVersionHistory';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { bidPreparationApi, DocumentCategory } from '../../dummyapi/bidPreparationApi';
import { projectManagementAppContext } from '../../App';
import { projectManagementAppContextType } from '../../types';



const initializeCategories = (): DocumentCategory[] => {
  return [
    {
      id: '1',
      name: 'Earnest Money Deposit',
      level: 0,
      children: [],
      isRequired: true,
      isEnclosed: false
    },
    {
      id: '2',
      name: 'Covering Letter',
      level: 0,
      children: [],
      isRequired: true,
      isEnclosed: false
    },
    {
      id: '3',
      name: 'Company Information',
      level: 0,
      children: [
        {
          id: '3-1',
          name: 'Company registration certificate',
          level: 1,
          parentId: '3',
          children: [],
          isRequired: true,
          isEnclosed: false
        },
        {
          id: '3-2',
          name: 'Service tax registration certificate',
          level: 1,
          parentId: '3',
          children: [],
          isRequired: true,
          isEnclosed: false
        },
        {
          id: '3-3',
          name: 'PAN card',
          level: 1,
          parentId: '3',
          children: [],
          isRequired: true,
          isEnclosed: false
        },
        {
          id: '3-4',
          name: 'List of Directors and details',
          level: 1,
          parentId: '3',
          children: [],
          isRequired: true,
          isEnclosed: false
        },
        {
          id: '3-5',
          name: 'Authorization from parent company',
          level: 1,
          parentId: '3',
          children: [],
          isRequired: true,
          isEnclosed: false
        }
      ],
      isRequired: true,
      isEnclosed: false
    },
    {
      id: '4',
      name: 'Company Brochure',
      level: 0,
      children: [],
      isRequired: true,
      isEnclosed: false
    },
    {
      id: '5',
      name: 'Annual Turnover Form',
      level: 0,
      children: [{
        id: '5-1',
        name: 'Information regarding status of Bidder',
        level: 1,
        parentId: '5',
        children: [],
        isRequired: true,
        isEnclosed: false
      }, {

        id: '5-2',
        name: 'Experience Certificates',
        level: 1,
        parentId: '5',
        children: [],
        isRequired: true,
        isEnclosed: false
      },
      {

        id: '5-3',
        name: 'Project Data Sheets',
        level: 1,
        parentId: '5',
        children: [],
        isRequired: true,
        isEnclosed: false
      },
      {

        id: '5-4',
        name: 'CVs',
        level: 1,
        parentId: '5',
        children: [],
        isRequired: true,
        isEnclosed: false
      },
      {
        id: '5-5',
        name: 'Approach and Methodology',
        level: 1,
        parentId: '5',
        children: [],
        isRequired: true,
        isEnclosed: false
      }

      ],
      isRequired: true,
      isEnclosed: false
    },
    {
      id: '6',
      name: 'Legal Documents',
      level: 0,
      children: [{
        id: '6-1',
        name: 'Form for de-bar declaration',
        level: 1,
        parentId: '6',
        children: [],
        isRequired: true,
        isEnclosed: false
      }, {

        id: '6-2',
        name: 'Indemnity Bond',
        level: 1,
        parentId: '6',
        children: [],
        isRequired: true,
        isEnclosed: false
      }
      ],
      isRequired: true,
      isEnclosed: false
    },

    {
      id: '7',
      name: 'Project Planning',
      level: 0,
      children: [{
        id: '7-1',
        name: 'Work schedule',
        level: 1,
        parentId: '7',
        children: [],
        isRequired: true,
        isEnclosed: false
      }, {

        id: '7-2',
        name: 'Employee schedule',
        level: 1,
        parentId: '7',
        children: [],
        isRequired: true,
        isEnclosed: false
      }
      ],
      isRequired: true,
      isEnclosed: false
    },
    {
      id: '8',
      name: 'Tender Documents',
      level: 0,
      children: [{
        id: '8-1',
        name: 'Tender Doc and Addenda',
        level: 1,
        parentId: '8',
        children: [],
        isRequired: true,
        isEnclosed: false
      }, {

        id: '8-2',
        name: 'Tender Costing',
        level: 1,
        parentId: '8',
        children: [],
        isRequired: true,
        isEnclosed: false
      }
      ],
      isRequired: true,
      isEnclosed: false
    }
    // Add other categories similarly...
  ];
};

const BidPreparationForm: React.FC = () => {
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;
  const [categories, setCategories] = useState<DocumentCategory[]>(initializeCategories());
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<'Business Development Manager' | 'Regional Manager' | 'Regional Director'>('Business Development Manager');
  const [status, setStatus] = useState<'Draft' | 'PendingApproval' | 'Approved' | 'Rejected'>('Draft');
  const [comments, setComments] = useState('');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    loadBidPreparationData();
    setEditMode(false)
  }, []);

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user);
      const role = userData.roles?.[0]?.name || null;
      setCurrentRole(role);
    }
  }, []);

  const loadBidPreparationData = async () => {
    try {
      const data = await bidPreparationApi.getBidPreparationData(context.selectedProject?.id);
      if (data.documentCategoriesJson) {
        setCategories(JSON.parse(data.documentCategoriesJson));
        setEditMode(false)
      }
      else {
        setError('Bid preparation data not found');
      }
      setError('');
    } catch (err) {
      setError('Failed to load bid preparation data');
    }
  };

  const handleAddCategory = (parentId?: string) => {
    const newCategory: DocumentCategory = {
      id: `cat-${Date.now()}`,
      name: '',
      level: parentId ? (findCategory(parentId, categories)?.level ?? 0) + 1 : 0,
      parentId,
      children: [],
      isRequired: false,
      isEnclosed: false
    };

    if (parentId) {
      const parentCategory = findCategory(parentId, categories);
      if (parentCategory) {
        setCategories(updateCategoryChildren(categories, parentId, [...parentCategory.children, newCategory]));
      }
    } else {
      setCategories([...categories, newCategory]);
    }
  };

  const findCategory = (id: string, cats: DocumentCategory[]): DocumentCategory | undefined => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      const found = findCategory(id, cat.children);
      if (found) return found;
    }
    return undefined;
  };

  const updateCategoryChildren = (cats: DocumentCategory[], parentId: string, newChildren: DocumentCategory[]): DocumentCategory[] => {
    return cats.map(cat => {
      if (cat.id === parentId) {
        return { ...cat, children: newChildren };
      }
      if (cat.children.length > 0) {
        return { ...cat, children: updateCategoryChildren(cat.children, parentId, newChildren) };
      }
      return cat;
    });
  };

  const handleUpdateCategory = (id: string, field: keyof DocumentCategory, value: any) => {
    const updateCategory = (cats: DocumentCategory[]): DocumentCategory[] => {
      return cats.map(cat => {
        if (cat.id === id) {
          return { ...cat, [field]: value };
        }
        if (cat.children.length > 0) {
          return { ...cat, children: updateCategory(cat.children) };
        }
        return cat;
      });
    };

    setCategories(updateCategory(categories));
  };

  const handleDeleteCategory = (id: string) => {
    const deleteFromCategories = (cats: DocumentCategory[]): DocumentCategory[] => {
      return cats.filter(cat => {
        if (cat.id === id) return false;
        if (cat.children.length > 0) {
          cat.children = deleteFromCategories(cat.children);
        }
        return true;
      });
    };

    setCategories(deleteFromCategories(categories));
  };

  const handleSubmit = async () => {
    try {
      if (currentRole === 'Regional Director') {
        await bidPreparationApi.approveOrReject(
          context.selectedProject?.id,
          approvalAction === 'approve',
          comments
        );
        setStatus(approvalAction === 'approve' ? 'Approved' : 'Rejected');
      } else {
        await bidPreparationApi.updateBidPreparationData(
          categories,
          context.selectedProject?.id,
          comments
        );
      }
      setError('');
      setShowApprovalDialog(false);
      loadBidPreparationData();
    } catch (err) {
      setError('Failed to save bid preparation data');
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      await bidPreparationApi.submitForApproval(context.selectedProject?.id);
      setStatus('PendingApproval');
      setError('');
    } catch (err) {
      setError('Failed to submit for approval');
    }
  };

  const handleApprovalAction = (action: 'approve' | 'reject') => {
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };


  const renderCategoryRow = (category: DocumentCategory, depth: number = 0) => {
    const isParentCategory = category.children.length > 0;

    return (
      <React.Fragment key={category.id}>
        <TableRow>
          <TableCell></TableCell>
          <TableCell sx={{ pl: depth * 4 }}>
            {editMode && !isParentCategory ? (
              <TextField
                fullWidth
                variant="standard"
                value={category.name}
                onChange={(e) => handleUpdateCategory(category.id, 'name', e.target.value)}
              />
            ) : (
              <Typography
                sx={{
                  fontWeight: isParentCategory ? 'bold' : 'normal',
                  color: isParentCategory ? 'primary.main' : 'text.primary'
                }}
              >
                {category.name}
              </Typography>
            )}
          </TableCell>
          <TableCell>
            {editMode && !isParentCategory ? (
              <TextField
                fullWidth
                variant="standard"
                value={category.remarks || ''}
                onChange={(e) => handleUpdateCategory(category.id, 'remarks', e.target.value)}
              />
            ) : (
              <Typography>{category.remarks}</Typography>
            )}
          </TableCell>
          <TableCell align="center">
            {editMode && !isParentCategory ? (
              <Checkbox
                checked={category.isEnclosed}
                onChange={(e) => handleUpdateCategory(category.id, 'isEnclosed', e.target.checked)}
                disabled={!editMode}
              />
            ) : (
              <Checkbox checked={category.isEnclosed} disabled />
            )}
          </TableCell>
          <TableCell>
            {editMode && !isParentCategory ? (
              <DatePicker
                value={category.date || null}
                onChange={(newValue) => handleUpdateCategory(category.id, 'date', newValue)}
                slotProps={{
                  textField: {
                    variant: 'standard',
                    fullWidth: true
                  }
                }}
              />
            ) : (
              <Typography>
                {category.date ? format(new Date(category.date), 'dd/MM/yyyy') : ''}
              </Typography>
            )}
          </TableCell>
          {editMode && !isParentCategory && (
            <TableCell>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleAddCategory(category.id)}
                  color="primary"
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteCategory(category.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </TableCell>
          )}
        </TableRow>

        {/* Recursively render the children */}
        {category.children.length > 0 && category.children.map(child => renderCategoryRow(child, depth + 1))}
      </React.Fragment>
    );
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <BidVersionHistory opportunityId={context.selectedProject?.id} />
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Status: {status} {currentRole === 'Regional Director' ? '(Reviewer)' : '(Editor)'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {(currentRole === 'Business Development Manager' || currentRole === 'Regional Manager') && status === 'Draft' && (
              <>
                {editMode && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddCategory()}
                    size="small"
                  >
                    Add Category
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitForApproval}
                >
                  Submit for Approval
                </Button>
              </>
            )}

            {currentRole === 'Regional Director' && status === 'PendingApproval' && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleApprovalAction('approve')}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleApprovalAction('reject')}
                >
                  Reject
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="center">Enclosed</TableCell>
                <TableCell>Date</TableCell>
                {editMode && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map(category => renderCategoryRow(category))}
            </TableBody>
          </Table>
        </Paper>

        {(currentRole === 'Business Development Manager' || currentRole === 'Regional Manager') && status === 'Draft' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={categories.length === 0}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Container>

      <Dialog open={showApprovalDialog} onClose={() => setShowApprovalDialog(false)}>
        <DialogTitle>
          {approvalAction === 'approve' ? 'Approve Bid Preparation' : 'Reject Bid Preparation'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comments"
            fullWidth
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {approvalAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default BidPreparationForm;
