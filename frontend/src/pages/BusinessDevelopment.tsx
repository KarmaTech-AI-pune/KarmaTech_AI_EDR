import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  Button,
  Divider,
  IconButton,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { OpportunityList } from '../components/projects/OpportunityList';
import { OpportunityForm } from '../components/forms/OpportunityForm';
import { Pagination } from '../components/Pagination';
import { authApi } from '../dummyapi/authApi';
import { UserWithRole} from '../types';
import { OpportunityTracking } from  '../models';
import { PermissionType } from '../models';
import { opportunityApi } from '../dummyapi/opportunityApi';
import { UserRole } from '../models';
import { HistoryLoggingService } from '../services/historyLoggingService';

const NAVBAR_HEIGHT = '64px';

export const BusinessDevelopment: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [canViewOpportunities, setCanViewOpportunities] = useState(false);
  const [canCreateOpportunity, setCanCreateOpportunity] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [opportunities, setOpportunities] = useState<OpportunityTracking[]>([]);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [opportunitiesPerPage] = useState(5);

  const fetchOpportunities = async () => {
    try {
      if (!currentUser) {
        return;
      }

      let response: OpportunityTracking[] = [];
      
      if (currentUser.roles.some(role => role.name === UserRole.BusinessDevelopmentManager)) {
        response = await opportunityApi.getByUserId(currentUser.id);
      } else if (currentUser.roles.some(role => role.name === UserRole.RegionalManager)) {
        response = await opportunityApi.getByReviewManagerId(currentUser.id);
      }  
      else if (currentUser.roles.some(role => role.name === UserRole.RegionalDirector)) {
        response = await opportunityApi.getByApprovalManagerId(currentUser.id);
      } else {
        response = await opportunityApi.getAll();
      }
      
      setOpportunities(response);
      setError(undefined);
    } catch (err: any) {
      console.error('Error fetching opportunities:', err);
      setError(err.message || 'Failed to fetch opportunities');
    }
  };

  useEffect(() => {
    const checkUserPermissions = async () => {
      try {
        const user = await authApi.getCurrentUser();
        
        if (!user) {
          setError('Please log in to access Business Development');
          return;
        }

        setCurrentUser(user);

        if (user.roleDetails) {
          const hasOpportunityViewPermission = user.roleDetails.permissions.includes(
            PermissionType.VIEW_BUSINESS_DEVELOPMENT
          );
          const hasOpportunityCreatePermission = user.roleDetails.permissions.includes(
            PermissionType.CREATE_BUSINESS_DEVELOPMENT
          );
          
          setCanViewOpportunities(hasOpportunityViewPermission);
          setCanCreateOpportunity(hasOpportunityCreatePermission);

          if (!hasOpportunityViewPermission) {
            setError('You do not have permission to view opportunities');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error checking user permissions');
        console.error(err);
      }
    };

    checkUserPermissions();
  }, []);

  useEffect(() => {
    if (currentUser && canViewOpportunities) {
      fetchOpportunities();
    }
  }, [currentUser, canViewOpportunities]);

  const initialOpportunityData: Partial<OpportunityTracking> = {
    client: '',
    status: 'Bid Under Preparation',
    projectId: "0",
    stage: 'A',
    strategicRanking: 'M',
    bidManagerId: "0",
    operation: '',
    workName: '',
    clientSector: '',
    likelyStartDate: new Date().toISOString().split('T')[0],
    currency: 'INR',
    capitalValue: 0,
    durationOfProject: 0,
    fundingStream: 'Government Budget',
    contractType: 'EPC'
  };

  const handleCreateOpportunity = () => {
    if (canCreateOpportunity) {
      setIsCreatingOpportunity(true);
      setFormError(undefined);
    }
  };

  const handleSubmitOpportunity = async (opportunityData: OpportunityTracking) => {
    try {
      if (!currentUser?.name) {
        throw new Error('User not authenticated');
      }

      const submissionData = {
        ...opportunityData,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        lastModifiedBy: currentUser.name,
        lastModifiedAt: new Date().toISOString()
      };

      const createdOpportunity = await opportunityApi.create(submissionData);

      if (createdOpportunity.id) {
        await HistoryLoggingService.logNewProject(
          createdOpportunity.id,
          createdOpportunity.workName || 'Unnamed Opportunity',
          currentUser.name
        );
      }

      await fetchOpportunities();
      setIsCreatingOpportunity(false);
      setFormError(undefined);
    } catch (err: any) {
      console.error('Error creating opportunity:', err);
      setFormError(err.message || 'Failed to create opportunity');
    }
  };

  const handleOpportunityUpdated = async () => {
    await fetchOpportunities();
  };

  const handleOpportunityDeleted = async (opportunityId: string) => {
    try {
      await opportunityApi.delete(opportunityId);
      await fetchOpportunities();
    } catch (err: any) {
      console.error('Error deleting opportunity:', err);
      setError(err.message || 'Failed to delete opportunity');
    }
  };

  const handleCancelOpportunity = () => {
    setIsCreatingOpportunity(false);
    setFormError(undefined);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const searchTermLower = searchTerm.toLowerCase();
    const workName = opportunity.workName?.toLowerCase() || '';
    const client = opportunity.client?.toLowerCase() || '';
    
    return client.includes(searchTermLower) ||
           workName.includes(searchTermLower);
  });

  const indexOfLastOpportunity = currentPage * opportunitiesPerPage;
  const indexOfFirstOpportunity = indexOfLastOpportunity - opportunitiesPerPage;
  const currentOpportunities = filteredOpportunities.slice(indexOfFirstOpportunity, indexOfLastOpportunity);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (error) {
    return (
      <Box sx={{ pt: `${NAVBAR_HEIGHT}`, p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{ 
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT})`,
        pt: `${NAVBAR_HEIGHT}`,
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{ 
          p: 3,
          bgcolor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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
            Business Development
          </Typography>
          
          {canCreateOpportunity && (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleCreateOpportunity}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 3
              }}
            >
              New Opportunity
            </Button>
          )}
        </Box>

        <OpportunityForm
          open={isCreatingOpportunity}
          onSubmit={handleSubmitOpportunity}
          onClose={handleCancelOpportunity}
          project={initialOpportunityData}
          error={formError}
        />

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
            placeholder="Search opportunities"
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

        <OpportunityList
          opportunities={currentOpportunities}
          emptyMessage="No business development opportunities found"
          onOpportunityDeleted={handleOpportunityDeleted}
          onOpportunityUpdated={handleOpportunityUpdated}
        />

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 3 
        }}>
          <Pagination
            projectsPerPage={opportunitiesPerPage}
            totalProjects={filteredOpportunities.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default BusinessDevelopment;
