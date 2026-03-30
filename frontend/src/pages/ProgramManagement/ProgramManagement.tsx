import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Edit, Delete, Assessment as AssessmentIcon } from '@mui/icons-material';
import { usePrograms } from '../../hooks/usePrograms';
import { Pagination } from '../../components/Pagination';
import CreateProgramDialog from '../../components/ProgramManagement/CreateProgramDialog';
import EditProgramDialog from '../../components/ProgramManagement/EditProgramDialog';
import { programApi } from '../../services/api/programApi';
import { Program } from '../../types/program';
import { useProject } from '../../context/ProjectContext';

const ProgramManagement: React.FC = () => {
  const navigate = useNavigate();
  const { programId, setProgramId } = useProject();
  const { programs, isLoading, error, refetch } = usePrograms();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [programsPerPage] = useState(5);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<Program | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Helper function to format date as dd-MM-yyyy
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return 'N/A';
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditClick = (program: Program) => {
    setProgramToEdit(program);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
  };

  const handleDeleteClick = (program: Program) => {
    setProgramToDelete(program);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!programToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      await programApi.delete(programToDelete.id);
      setDeleteDialogOpen(false);
      setProgramToDelete(null);
      refetch();
    } catch (err) {
      setDeleteError('Failed to delete program. Please try again.');
      console.error('Error deleting program:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProgramToDelete(null);
    setDeleteError(null);
  };

  // Filter programs based on search term
  const filteredPrograms = programs.filter((program) => {
    const searchTermLower = searchTerm.toLowerCase();
    const name = program.name?.toLowerCase() || '';
    const description = program.description?.toLowerCase() || '';
    return name.includes(searchTermLower) || description.includes(searchTermLower);
  });

  // Pagination
  const indexOfLastProgram = currentPage * programsPerPage;
  const indexOfFirstProgram = indexOfLastProgram - programsPerPage;
  const currentPrograms = filteredPrograms.slice(indexOfFirstProgram, indexOfLastProgram);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (error) {
    return (
      <Box sx={{ p: 3, mt: '64px' }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={refetch}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: '64px' }}>
      <Box
        sx={{
          p: 2,
          bgcolor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          m: 2
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: '#1a237e'
            }}
          >
            Program Management
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setIsCreateDialogOpen(true)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 3
              }}
            >
              Create Program
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search programs"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              endAdornment: (
                <IconButton size="small">
                  <SearchIcon />
                </IconButton>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: 'background.paper'
              }
            }}
            sx={{
              width: 250,
            }}
          />
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Programs List */}
        {!isLoading && currentPrograms.length > 0 && (
          <List sx={{
            width: '100%',
            '& > *:not(:last-child)': {
              mb: 1
            }
          }}>
            {currentPrograms.map((program) => (
              <ListItem
                key={program.id}
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateX(4px)',
                    boxShadow: 2
                  }
                }}
                onClick={() => {
                  // Store programId in context and sessionStorage
                  setProgramId(program.id.toString());
                  sessionStorage.setItem('programId', program.id.toString());
                  // Navigate to project management page
                  navigate(`/program-management/projects`);
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>
                    {program.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {program.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      <strong>Start:</strong> {formatDate(program.startDate)}
                    </Typography>
                    {program.endDate && (
                      <Typography variant="caption" color="text.secondary">
                        <strong>End:</strong> {formatDate(program.endDate)}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{
                  display: 'flex',
                  gap: 1,
                  ml: 2
                }}>

                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(program);
                    }}
                    sx={{
                      minWidth: 'auto',
                      p: 1,
                      color: 'primary.main'
                    }}
                  >
                    <Edit />
                  </Button>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(program);
                    }}
                    sx={{
                      minWidth: 'auto',
                      p: 1,
                      color: 'error.main'
                    }}
                  >
                    <Delete />
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}

        {/* Empty State */}
        {!isLoading && filteredPrograms.length === 0 && (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
            width="100%"
          >
            <Typography variant="body1">
              {searchTerm ? 'No programs found matching your search' : 'No programs found'}
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {!isLoading && filteredPrograms.length > 0 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3
          }}>
            <Pagination
              projectsPerPage={programsPerPage}
              totalProjects={filteredPrograms.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </Box>
        )}
      </Box>

      {/* Create Program Dialog */}
      <CreateProgramDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Program Dialog */}
      {programToEdit && (
        <EditProgramDialog
          open={isEditDialogOpen}
          program={programToEdit}
          onClose={() => {
            setIsEditDialogOpen(false);
            setProgramToEdit(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the program <strong>"{programToDelete?.name}"</strong>?
            This action cannot be undone and will permanently remove the program along with ALL its associated projects and related data.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgramManagement;
