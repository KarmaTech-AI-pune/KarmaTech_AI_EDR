import { useState, useContext, useEffect } from 'react'
import { Navigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    Alert,
    Container,
    Link
} from '@mui/material';
import { authApi } from '../services/authApi';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType, Credentials } from '../types';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { OTPVerification } from '../components/OTPVerification';
import UserSubscriptionContext from '../context/UserSubscriptionContext'; // Import UserSubscriptionContext
import { VersionDisplay } from '../components/VersionDisplay';
import ReleaseNotesModal from '../components/ReleaseNotesModal';
import { releaseNotesApi } from '../services/releaseNotesApi';
import { versionApi } from '../services/versionApi';

const MANUAL_VERSION_OVERRIDE = '1.3.0'; // Set this to e.g. '1.5.0' to force a version display

export const LoginScreen: React.FC = () => {
    const [email, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [requiresOtp, setRequiresOtp] = useState(false);
    const [isReleaseNotesModalOpen, setIsReleaseNotesModalOpen] = useState(false);
    const [currentVersion, setCurrentVersion] = useState('');
    const { isAuthenticated, setIsAuthenticated, setUser } = useContext(projectManagementAppContext) as projectManagementAppContextType;
    const { refreshSubscription } = useContext(UserSubscriptionContext)!; // Access refreshSubscription
    const navigation = useAppNavigation();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Background preloading of release notes for current version
    useEffect(() => {
        const preloadReleaseNotes = async () => {
            try {
                // First get the current version
                const versionInfo = await versionApi.getCurrentVersion();
                if (versionInfo?.version) {
                    // Preload release notes for this version in the background
                    // This will cache the data for instant display when modal opens
                    await releaseNotesApi.getReleaseNotes(versionInfo.version);
                    console.log(`Preloaded release notes for version ${versionInfo.version}`);
                }
            } catch (error) {
                // Silently fail - preloading is not critical
                console.log('Background preloading of release notes failed:', error);
            }
        };

        // Start preloading after a short delay to not block UI
        const timeoutId = setTimeout(preloadReleaseNotes, 1000);

        return () => clearTimeout(timeoutId);
    }, []); // Run once when component mounts

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const credentials: Credentials = {
            email,
            password
        };

        try {
            const result = await authApi.login(credentials);
            // debugger;
            if (result.success) {
                if (result.requiresOtp) {
                    // 2FA is required, show OTP verification
                    setRequiresOtp(true);
                } else if (result.token && result.user) {
                    // Normal login without 2FA
                    localStorage.setItem('token', result.token);
                    const storedToken = localStorage.getItem('token');
                    if (storedToken) {
                        setUser(result.user);
                        setIsAuthenticated(true);
                        navigation.navigateToHome();
                        await refreshSubscription(); // Call refreshSubscription from context
                    } else {
                        setError('Failed to set authentication token');
                    }
                } else {
                    setError(result.message || 'Invalid username or password');
                }
            } else {
                setError(result.message || 'Invalid username or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpVerificationSuccess = async (response: any) => { // Made async
        if (response.success) {
            // Token and user are already stored in localStorage by twoFactorApi.verifyOtp
            setUser(response.user);
            setIsAuthenticated(true);
            navigation.navigateToHome();
            await refreshSubscription(); // Call refreshSubscription after OTP success
        } else {
            setError(response.message || 'OTP verification failed');
        }
    };

    const handleBackToLogin = () => {
        setRequiresOtp(false);
        setError('');
    };

    const handleVersionClick = (version: string) => {
        setCurrentVersion(version);
        setIsReleaseNotesModalOpen(true);
    };

    const handleCloseReleaseNotesModal = () => {
        setIsReleaseNotesModalOpen(false);
    };

    // Show OTP verification if required
    if (requiresOtp) {
        return (
            <OTPVerification
                email={email}
                onVerificationSuccess={handleOtpVerificationSuccess}
                onBackToLogin={handleBackToLogin}
            />
        );
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            padding={3}
            sx={{ backgroundColor: 'background.default' }}
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
                    color="primary"
                    sx={{
                        mb: 1,
                        fontWeight: 'bold',
                    }}
                >
                    KarmaTech-AI EDR(Enterprise Digital Runner)
                </Typography>
                <VersionDisplay
                    variant="h6"
                    color="text.secondary"
                    sx={{
                        mb: 1,
                    }}
                    showBuildDate={true}
                    showDevIndicator={true}
                    fetchVersionFromAPI={true}
                    clickable={true}
                    onVersionClick={handleVersionClick}
                    forceVersion={MANUAL_VERSION_OVERRIDE}
                />
            </Container>

            <Card
                sx={{
                    maxWidth: 450,
                    width: '100%',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" component="h2" align="center" gutterBottom>
                        Login to your account
                    </Typography>
                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            margin="normal"
                            value={email}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={isLoading}
                            sx={{
                                mt: 2,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </Button>
                    </form>
                    <Typography variant="body2" align="center" sx={{ mt: 2, color: '#666' }}>
                        <Link
                            href="/forgot-password"
                            sx={{
                                color: '#1976d2',
                                textDecoration: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Forgot password?
                        </Link>
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
                        <Link href="/enhanced-login" color="primary" sx={{ textDecoration: 'none' }}>
                            🚀 Try Enhanced Multi-Tenant Login
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
            {error && (
                <Alert
                    severity="error"
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        maxWidth: 300,
                        boxShadow: 2
                    }}
                >
                    {error}
                </Alert>
            )}

            <ReleaseNotesModal
                version={currentVersion}
                isOpen={isReleaseNotesModalOpen}
                onClose={handleCloseReleaseNotesModal}
            />
        </Box>
    );
};

export default LoginScreen;
