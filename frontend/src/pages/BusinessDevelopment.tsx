import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField,
  Button,
  Divider,
  IconButton,
  Alert,
  Dialog,
  DialogContent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { OpportunityList } from '../components/project/OpportunityList';
import { OpportunityForm } from '../components/forms/OpportunityForm';
import { Pagination } from '../components/Pagination';
import { authApi } from '../services/authApi';
import { UserWithRole } from '../types';
import BusinessDevelopmentCharts from '../components/dashboard/BusinessDevelopmentCharts';

import { PermissionType, OpportunityTracking } from '../models';
import { opportunityApi } from '../services/opportunityApi';
import { HistoryLoggingService } from '../services/historyLoggingService';

const NAVBAR_HEIGHT = '64px';

export const BusinessDevelopment: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [canViewOpportunities, setCanViewOpportunities] = useState(false);
  const [canCreateOpportunity, setCanCreateOpportunity] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [opportunities, setOpportunities] = useState<OpportunityTracking[]>([]);
  const [isCreatingOpportunity, setIsCreatingOpportunity] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [opportunitiesPerPage] = useState(5);

 
  const fetchOpportunities = async () => {
    try {
      if (!currentUser) {
        console.log('No current user, skipping opportunity fetch');
        return;
      }

      console.log('Current User:', currentUser);
      console.log('User Roles:', currentUser.roles);

      let response: OpportunityTracking[] = [];
      
      if (currentUser.roles.some(role => role.name === "Business Development Manager")) {
        response = (await opportunityApi.getByUserId(currentUser.id)) as OpportunityTracking[];
      } else if (currentUser.roles.some(role => role.name ===  "Regional Manager")) {
        response = (await opportunityApi.getByReviewManagerId(currentUser.id)) as OpportunityTracking[];
      }  
      else if (currentUser.roles.some(role => role.name ===  "RegionalDirector")) {
        response = (await opportunityApi.getByApprovalManagerId(currentUser.id)) as OpportunityTracking[];
      } else {
        response = (await opportunityApi.getAll()) as OpportunityTracking[];
      }
      
      console.log('Fetched Opportunities:', response);
      setOpportunities(response);
      setError(undefined);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch opportunities';
      console.error('Error fetching opportunities:', err);
      setError(errorMessage);
    }
  };

  const initialOpportunityData: Partial<OpportunityTracking> = {
    client: '',
    status: 'Bid Under Preparation',
    id: undefined,
    stage: 'A',
    strategicRanking: 'M',
    bidManagerId: '',
    operation: '',
    workName: '',
    clientSector: '',
    likelyStartDate: undefined,
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

  const handleSubmitOpportunity = async (opportunityData: Partial<OpportunityTracking>) => {
    try {
      if (!currentUser?.name) {
        throw new Error('User not authenticated');
      }

      // Construct a valid OpportunityHistory object
      const currentHistory = {
        id: 0, // Provide a default value
        opportunityId: 0, // Provide a default value
        action: 'Created', // Provide a default value
        status: opportunityData.status || '', // Use the status from the form
        statusId: 1, // Provide a default value
        assignedToId: currentUser.id, // Provide a default value
        date: new Date().toISOString(), // Provide a default value
        description: 'Opportunity Created', // Provide a default value
      };

      const submissionData = {
        ...opportunityData,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
        updatedBy: currentUser.name,
        updatedAt: new Date().toISOString(),
        currentHistory: currentHistory, // Assign the constructed OpportunityHistory object
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create opportunity';
      console.error('Error creating opportunity:', err);
      setFormError(errorMessage);
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

  useEffect(() => {
    const checkUserPermissions = async () => {
      try {
        const user = await authApi.getCurrentUser();
        
        if (!user) {
          console.log('No user found, setting error');
          setError('Please log in to access Business Development');
          return;
        }

        console.log('Authenticated User:', user);

        setCurrentUser(user);

        if (user.roleDetails) {
          console.log('User Role Details:', user.roleDetails);

          const hasOpportunityViewPermission = user.roleDetails.permissions.includes(
            PermissionType.VIEW_BUSINESS_DEVELOPMENT
          );
          const hasOpportunityCreatePermission = user.roleDetails.permissions.includes(
            PermissionType.CREATE_BUSINESS_DEVELOPMENT
          );
          
          console.log('View Permission:', hasOpportunityViewPermission);
          console.log('Create Permission:', hasOpportunityCreatePermission);
          
          setCanViewOpportunities(hasOpportunityViewPermission);
          setCanCreateOpportunity(hasOpportunityCreatePermission);

          if (!hasOpportunityViewPermission) {
            setError('You do not have permission to view opportunities');
          }
        } else {
          console.log('No role details found for user');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Error checking user permissions';
        console.error('Full error in permission check:', err);
        setError(errorMessage);
      }
    };

    checkUserPermissions();
    fetchOpportunities();
  }, []);

  useEffect(() => {
      if (currentUser && canViewOpportunities) {
      console.log('Attempting to fetch opportunities');
      fetchOpportunities();
    } else {
      console.log('Cannot fetch opportunities', { 
        currentUser: !!currentUser, 
        canViewOpportunities 
      });
    }
  }, [currentUser, canViewOpportunities]);

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

        {isCreatingOpportunity && (
          <Dialog 
            open={isCreatingOpportunity} 
            onClose={handleCancelOpportunity}
            maxWidth="md"
            fullWidth
          >
            <DialogContent>
              <OpportunityForm
                onSubmit={handleSubmitOpportunity}
                project={initialOpportunityData}
                error={formError}
              />
            </DialogContent>
          </Dialog>
        )}

        <BusinessDevelopmentCharts />
        
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
  onOpportunityDeleted={fetchOpportunities}
  onOpportunityUpdated={fetchOpportunities}
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
