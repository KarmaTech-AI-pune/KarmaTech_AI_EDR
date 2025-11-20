import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  styled,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { CheckReviewRow, Employee } from "../../../models";
import { User } from "../../../models";
import * as userApi from "../../../services/userApi";
import { projectManagementAppContext } from '../../../App';
import { WBSStructureAPI } from '../../../features/wbs/services/wbsApi';
import { ResourceAPI } from '../../../services/resourceApi';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(1),
  },
  '& .MuiDialogTitle-root': {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2, 3),
    borderTop: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
  },
}));

interface CheckReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<CheckReviewRow, 'projectId' | 'activityNo'>) => void;
  nextActivityNo: string;
  editData?: CheckReviewRow;
}

export const CheckReviewDialog = ({ open, onClose, onSave, nextActivityNo, editData }: CheckReviewDialogProps) => {
  const [formData, setFormData] = useState<Omit<CheckReviewRow, 'projectId' | 'activityNo'>>({
    activityName: '',
    objective: '',
    references: '',
    documentNumber: '',
    documentName: '',
    fileName: '',
    qualityIssues: '',
    completion: 'N',
    checkedBy: '',
    approvedBy: '',
    actionTaken: '',
    maker: '',
    checker: ''
  });

  const [_users, setUsers] = useState<User[]>([]);
  const context = useContext(projectManagementAppContext);
  const [activityOptions, setActivityOptions] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [_loading, setLoading] = useState<boolean>(false);
  const [_loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [_error, setError] = useState<string | null>(null);
  const [_employeesError, setEmployeesError] = useState<string | null>(null);
  const [activityToUserMap, setActivityToUserMap] = useState<Map<string, string>>(new Map());

  // Fetch WBS data and users when dialog opens
  useEffect(() => {
    if (open) {
      // Load users for dropdowns
      const loadUsers = async () => {
        try {
          const allUsers = await userApi.getAllUsers();
          setUsers(allUsers);
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      };

      // Load WBS data if project is selected
      if (context?.selectedProject?.id) {
        fetchWBSData(context.selectedProject.id.toString());
      }

      loadUsers();
    }
  }, [open, context?.selectedProject?.id]);


  const fetchWBSData = async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Use WBSStructureAPI to fetch WBS data
      const wbsData = await WBSStructureAPI.getProjectWBS(projectId);

      // Extract level3 titles from WBS data and remove duplicates using a Set
      const uniqueLevel3TitlesSet = new Set(
        wbsData
          .filter(task => task.level === 3)
          .map(task => task.title)
          .filter(title => title && title.trim() !== '')
      );

      // Convert Set back to array
      const uniqueLevel3Titles = Array.from(uniqueLevel3TitlesSet);

      setActivityOptions(uniqueLevel3Titles);

      // Find level3 tasks with assigned users
      const level3TasksWithUsers = wbsData
        .filter(task => task.level === 3 && task.assignedUserId);

      // Create a map of activity names to assigned users
      const newActivityToUserMap = new Map<string, string>();
      level3TasksWithUsers.forEach(task => {
        if (task.title && task.assignedUserId) {
          newActivityToUserMap.set(task.title, task.assignedUserId);
        }
      });

      // Update the activity to user map
      setActivityToUserMap(newActivityToUserMap);

      // Get all assigned user IDs from WBS data and remove duplicates
      const uniqueAssignedUserIdsSet = new Set(
        level3TasksWithUsers
          .map(task => task.assignedUserId)
          .filter(id => id !== null && id !== undefined) as string[]
      );

      // Convert Set back to array
      const uniqueAssignedUserIds = Array.from(uniqueAssignedUserIdsSet);

      // If we have assigned users, fetch their details
      if (uniqueAssignedUserIds.length > 0) {
        setLoadingEmployees(true);
        try {
          // Fetch all employees to ensure we have complete data
          const allEmployees = await ResourceAPI.getAllEmployees();

          // Filter employees to only include those assigned in WBS
          const wbsEmployees = allEmployees.filter(emp =>
            uniqueAssignedUserIds.includes(emp.id)
          );

          // If we have WBS employees, update the employees list
          if (wbsEmployees.length > 0) {
            // Create a Map to ensure uniqueness by employee ID
            const uniqueEmployeesMap = new Map(
              wbsEmployees.map(emp => [emp.id, emp])
            );

            // Convert Map values back to array
            const uniqueEmployees = Array.from(uniqueEmployeesMap.values());

            setEmployees(uniqueEmployees);
          }

          // If we have a current activity selected, update the maker field
          if (formData.activityName && newActivityToUserMap.has(formData.activityName)) {
            setFormData(prevData => ({
              ...prevData,
              maker: newActivityToUserMap.get(formData.activityName) || ''
            }));
          }
        } catch (err) {
          console.error('Error fetching employee details:', err);
          setEmployeesError('Failed to load employee details from WBS.');
        } finally {
          setLoadingEmployees(false);
        }
      }
    } catch (err) {
      console.error('Error fetching WBS data:', err);
      setError('Failed to load activity options. Using default options.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = event.target.name as keyof typeof formData;
    const value = event.target.value as string;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const name = event.target.name as keyof typeof formData;
    const value = event.target.value;

    // Create updated form data
    const updatedFormData = {
      ...formData,
      [name]: value
    };

    // If activity name changed, update the maker field based on the activity-to-user mapping
    if (name === 'activityName' && value && activityToUserMap.has(value)) {
      updatedFormData.maker = activityToUserMap.get(value) || '';
    }

    setFormData(updatedFormData);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      completion: event.target.checked ? 'Y' : 'N'
    });
  };

  // Initialize form data when editData changes
  React.useEffect(() => {
    if (editData) {
      setFormData({
        activityName: editData.activityName,
        objective: editData.objective,
        references: editData.references || '',

         documentNumber: editData.documentNumber || '', // Ensure documentNumber is always a string
        documentName: editData.documentName || '',     // Ensure documentName is always a string

        fileName: editData.fileName || '',
        qualityIssues: editData.qualityIssues || '',
        completion: editData.completion,
        checkedBy: editData.checkedBy || '',
        approvedBy: editData.approvedBy || '',
        actionTaken: editData.actionTaken || '',
        maker: editData.maker || '',
        checker: editData.checker || ''
      });
    } else { 
      // Reset form when not editing
      setFormData({
        activityName: '',
        objective: '',
        references: '',

         documentNumber: '', // Initialize for new forms
        documentName: '',   // Initialize for new forms

        fileName: '',
        qualityIssues: '',
        completion: 'N',
        checkedBy: '',
        approvedBy: '',
        actionTaken: '',
        maker: '',
        checker: ''
      });
    }
  }, [editData, open]);

  const handleSubmit = () => {
    onSave(formData);
    setFormData({
      activityName: '',
      objective: '',
      references: '',
      documentNumber: '',
      documentName: '',
      fileName: '',
      qualityIssues: '',
      completion: 'N',
      checkedBy: '',
      approvedBy: '',
      actionTaken: '',
      maker: '',
      checker: ''
    });
    onClose();
  };

  const textFieldStyle = {
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

  const sectionTitleStyle = {
    color: '#1976d2',
    fontWeight: 500,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 2,
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ color: '#1976d2', fontWeight: 500 }}>
          {editData ? 'Edit Check Review' : `Add Check Review - Activity No: ${nextActivityNo}`}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={textFieldStyle}>
                <InputLabel id="activity-name-label">Activity Name</InputLabel>
                <Select
                  labelId="activity-name-label"
                  id="activity-name"
                  value={formData.activityName}
                  name="activityName"
                  label="Activity Name"
                  onChange={handleSelectChange}
                >
                  {activityOptions.map((option: string) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={textFieldStyle}>
                <InputLabel id="maker-label">Maker</InputLabel>
                <Select
                  labelId="maker-label"
                  id="maker"
                  value={formData.maker}
                  name="maker"
                  label="Maker"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={textFieldStyle}>
                <InputLabel id="checker-label">Checker</InputLabel>
                <Select
                  labelId="checker-label"
                  id="checker"
                  value={formData.checker}
                  name="checker"
                  label="Checker"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Objective"
                value={formData.objective}
                name='objective'
                onChange={handleTextFieldChange}
                fullWidth
                multiline
                rows={2}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Document Details
          </Typography>
          <Grid container spacing = {2}>
            <Grid item xs={12} md={6}>
              <TextField 
              label="Document Number"
              value={formData.documentNumber}
              name='documentNumber'
              onChange={handleTextFieldChange}
              fullWidth
              type="text"
                inputProps={{ 
                  inputMode: 'numeric', 
                  pattern: '[0-9]*',
                  onInput: (e: React.FormEvent<HTMLInputElement>) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                  }
                }}
              sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Document Name"
                value={formData.documentName}
                name='documentName'
                onChange={handleTextFieldChange}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
          </Box>

        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Reference Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="References and Standards"
                value={formData.references}
                name='references'
                onChange={handleTextFieldChange}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="File Name"
                value={formData.fileName}
                name='fileName'
                onChange={handleTextFieldChange}
                fullWidth
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Quality Assessment
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Specific Quality Issues"
                value={formData.qualityIssues}
                name='qualityIssues'
                onChange={handleTextFieldChange}
                fullWidth
                multiline
                rows={2}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.completion === 'Y'}
                    onChange={handleCheckboxChange}
                    sx={{ '&.Mui-checked': { color: '#1976d2' } }}
                  />
                }
                label="Completion"
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography sx={sectionTitleStyle}>
            Review Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Checked by"
                type="date"
                value={formData.checkedBy}
                name='checkedBy'
                onChange={handleTextFieldChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Approved by"
                type="date"
                value={formData.approvedBy}
                name='approvedBy'
                onChange={handleTextFieldChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography sx={sectionTitleStyle}>
            Action Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Action Taken"
                value={formData.actionTaken}
                name='actionTaken'
                onChange={handleTextFieldChange}
                fullWidth
                multiline
                rows={2}
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: '#1976d2',
            '&:hover': {
              bgcolor: '#1565c0'
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};
