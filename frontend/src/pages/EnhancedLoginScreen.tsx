import { useState, useContext, useEffect } from 'react';
import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    Alert,
    Container,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Divider,
    CircularProgress
} from '@mui/material';
import { enhancedAuthApi } from '../services/enhancedAuthApi';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType, Credentials } from '../types';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { Tenant } from '../models/tenantModel';

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
            id={`login-tabpanel-${index}`}
            aria-labelledby={`login-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const EnhancedLoginScreen: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedTenant, setSelectedTenant] = useState('');
    const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
    const [isLoadingTenants, setIsLoadingTenants] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { setIsAuthenticated, setUser } = useContext(projectManagementAppContext) as projectManagementAppContextType;
    const navigation = useAppNavigation();

    // Fetch available tenants from backend
    useEffect(() => {
        const fetchTenants = async () => {
            setIsLoadingTenants(true);
            try {
                const tenants = await enhancedAuthApi.getAvailableTenants();
                setAvailableTenants(tenants);
                if (tenants.length > 0) {
                    setSelectedTenant(tenants[0].domain);
                }
            } catch (error) {
                console.error('Error fetching tenants:', error);
                setError('Failed to load available tenants');
            } finally {
                setIsLoadingTenants(false);
            }
        };

        fetchTenants();
    }, []);

    // Test users for different scenarios
    const testUsers = {
        superAdmin: { email: 'superadmin@example.com', password: 'password' },
        tenantAdmin: { email: 'tenantadmin@example.com', password: 'password' },
        tenantManager: { email: 'tenantmanager@example.com', password: 'password' },
        tenantUser: { email: 'tenantuser@example.com', password: 'password' },
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setError('');
    };

    const handleSuperAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const credentials: Credentials = { email, password };

        try {
            const result = await enhancedAuthApi.superAdminLogin(credentials);

            if (result.success && result.token && result.user) {
                setUser(result.user);
                setIsAuthenticated(true);
                navigation.navigateToHome();
            } else {
                setError(result.message || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Super admin login error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTenantLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const credentials: Credentials = { email, password };

        try {
            const result = await enhancedAuthApi.tenantLogin(credentials, selectedTenant);

            if (result.success && result.token && result.user) {
                setUser(result.user);
                setIsAuthenticated(true);
                // Redirect to tenant-specific dashboard
                //window.location.href = `http://${selectedTenant}.localhost:5000`;
                navigation.navigateToHome();
            } else {
                setError(result.message || 'Invalid credentials or tenant access denied');
            }
        } catch (err) {
            console.error('Tenant login error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickLogin = async (userType: keyof typeof testUsers) => {
        const testUser = testUsers[userType];
        setEmail(testUser.email);
        setPassword(testUser.password);
        
        if (tabValue === 0) {
            // Super admin login
            const credentials: Credentials = { email: testUser.email, password: testUser.password };
            const result = await enhancedAuthApi.superAdminLogin(credentials);
            
            if (result.success && result.token && result.user) {
                setUser(result.user);
                setIsAuthenticated(true);
                navigation.navigateToHome();
            } else {
                setError(result.message || 'Quick login failed');
            }
        } else {
            // Tenant login
            const credentials: Credentials = { email: testUser.email, password: testUser.password };
            const result = await enhancedAuthApi.tenantLogin(credentials, selectedTenant);
            
            if (result.success && result.token && result.user) {
                setUser(result.user);
                setIsAuthenticated(true);
                navigation.navigateToHome();
            } else {
                setError(result.message || 'Quick login failed');
            }
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="#f5f5f5"
            padding={3}
        >
            <Container maxWidth="sm" sx={{ textAlign: 'center', mb: 2 }}>
                <Box sx={{ mb: 1 }}>
                    <img
                        src="/KarmaTech_logo.png"
                        alt="KarmaTech AI"
                        style={{
                            maxWidth: '150px',
                            maxHeight: '150px',
                            marginBottom: '0.5rem'
                        }}
                    />
                </Box>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        mb: 1,
                        fontWeight: 'bold',
                        color: '#1976d2'
                    }}
                >
                    KarmaTech AI Project Management
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 1,
                        color: '#666'
                    }}
                >
                    Multi-Tenant Testing Environment
                </Typography>
            </Container>

            <Card
                sx={{
                    maxWidth: 600,
                    width: '100%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    borderRadius: 2
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="login tabs">
                            <Tab label="Super Admin Login" />
                            <Tab label="Tenant Login" />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <Typography variant="h6" gutterBottom>
                            Super Administrator Access
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            Access the main admin panel to manage all tenants, users, and system settings.
                        </Typography>

                        <form onSubmit={handleSuperAdminLogin}>
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 3 }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={isLoading}
                                sx={{ mb: 2 }}
                            >
                                {isLoading ? 'Logging in...' : 'Super Admin Login'}
                            </Button>
                        </form>

                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle2" gutterBottom>
                            Quick Test Login:
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleQuickLogin('superAdmin')}
                            sx={{ mr: 1, mb: 1 }}
                        >
                            Super Admin
                        </Button>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Typography variant="h6" gutterBottom>
                            Tenant-Specific Access
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            Access tenant-specific features and data isolation.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Select Tenant</InputLabel>
                                <Select
                                    value={selectedTenant}
                                    onChange={(e) => setSelectedTenant(e.target.value)}
                                    label="Select Tenant"
                                    disabled={isLoadingTenants}
                                >
                                {isLoadingTenants ? (
                                    <MenuItem disabled>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        Loading tenants...
                                    </MenuItem>
                                ) : availableTenants.length === 0 ? (
                                    <MenuItem disabled>No tenants available</MenuItem>
                                ) : (
                                    availableTenants.map((tenant) => (
                                        <MenuItem key={tenant.id} value={tenant.domain}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <Chip 
                                                    label={tenant.status === 0 ? 'Active' : 'Inactive'} 
                                                    color={tenant.status === 0 ? 'success' : 'error'} 
                                                    size="small" 
                                                    sx={{ mr: 1 }}
                                                />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                        {tenant.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {tenant.domain}.localhost
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setIsLoadingTenants(true);
                                    enhancedAuthApi.getAvailableTenants()
                                        .then(setAvailableTenants)
                                        .catch(error => {
                                            console.error('Error refreshing tenants:', error);
                                            setError('Failed to refresh tenants');
                                        })
                                        .finally(() => setIsLoadingTenants(false));
                                }}
                                disabled={isLoadingTenants}
                                sx={{ minWidth: 'auto', px: 2 }}
                            >
                                {isLoadingTenants ? <CircularProgress size={20} /> : '🔄'}
                            </Button>
                        </Box>

                        {selectedTenant && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Selected Tenant Information:
                                </Typography>
                                {(() => {
                                    const tenant = availableTenants.find(t => t.domain === selectedTenant);
                                    return tenant ? (
                                        <Box>
                                            <Typography variant="body2">
                                                <strong>Name:</strong> {tenant.name}
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Domain:</strong> {tenant.domain}.localhost
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Status:</strong> 
                                                <Chip 
                                                    label={tenant.status === 0 ? 'Active' : 'Inactive'} 
                                                    color={tenant.status === 0 ? 'success' : 'error'} 
                                                    size="small" 
                                                    sx={{ ml: 1 }}
                                                />
                                            </Typography>
                                            {tenant.companyName && (
                                                <Typography variant="body2">
                                                    <strong>Company:</strong> {tenant.companyName}
                                                </Typography>
                                            )}
                                        </Box>
                                    ) : null;
                                })()}
                            </Box>
                        )}

                        <form onSubmit={handleTenantLogin}>
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 3 }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="secondary"
                                size="large"
                                disabled={isLoading}
                                sx={{ mb: 2 }}
                            >
                                {isLoading ? 'Logging in...' : `Login to ${selectedTenant}`}
                            </Button>
                        </form>

                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle2" gutterBottom>
                            Quick Test Logins:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuickLogin('tenantAdmin')}
                            >
                                Tenant Admin
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuickLogin('tenantManager')}
                            >
                                Tenant Manager
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleQuickLogin('tenantUser')}
                            >
                                Tenant User
                            </Button>
                        </Box>
                    </TabPanel>
                </CardContent>
            </Card>

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        maxWidth: 400,
                        boxShadow: 2
                    }}
                    onClose={() => setError('')}
                >
                    {error}
                </Alert>
            )}

            {/* Testing Information */}
            <Card sx={{ mt: 3, maxWidth: 600, width: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Testing Information
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        <strong>Super Admin:</strong> Can access admin panel at localhost:5173/admin<br/>
                        <strong>Tenant Users:</strong> Will be redirected to tenant-specific subdomains<br/>
                        <strong>Data Isolation:</strong> Each tenant has separate data and user access<br/>
                        <strong>Hosts File:</strong> Ensure tenant1.localhost, tenant2.localhost, etc. are configured
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EnhancedLoginScreen;
