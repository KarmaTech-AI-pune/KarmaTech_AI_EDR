// import React, { useState, useEffect } from 'react';
// import {
//     Box,
//     Paper,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Typography,
//     IconButton,
//     Chip,
//     Alert,
//     Button
// } from '@mui/material';
// import EditIcon from '@mui/icons-material/Edit';
// import SecurityIcon from '@mui/icons-material/Security';
// import AddIcon from '@mui/icons-material/Add';
// import { TenantUser } from '../../../models/tenantModel';
// //import { tenantApi } from '../../../services/tenantApi';
// import AssignRoleDialog from './AssignRoleDialog';
// import AddTenantUserDialog from './AddTenantUserDialog';
// import { useParams } from 'react-router-dom';
// import * as tenantApi from '../../../services/tenantApi';
// import { Role } from '../../../models/roleModel';
// export const TenantUserManagement: React.FC = () => {
//     const { tenantId } = useParams<{ tenantId: string }>();
//     const [users, setUsers] = useState<TenantUser[]>([]);
//     const [roles, setRoles] = useState<Role[]>([]);
//     const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
//     const [isAssignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
//     const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         if (tenantId) {
//             loadUsers();
//             //loadRoles();
//         }
//     }, [tenantId]);

//     const loadUsers = async () => {
//         try {
//             const response = await tenantApi.getTenantUsers(parseInt(tenantId!));
//             setUsers(response);
//         } catch (error) {
//             setError('Failed to load users');
//             console.error('Error loading users:', error);
//         }
//     };

//     // const loadRoles = async () => {
//     //     try {
//     //         const response = await tenantApi.getAvailableRoles(parseInt(tenantId!));
//     //         // Filter out system roles (like SuperAdmin)
//     //         const tenantRoles = response.filter(role => !role.isSystemRole);
//     //         setRoles(tenantRoles);
//     //     } catch (error) {
//     //         setError('Failed to load roles');
//     //         console.error('Error loading roles:', error);
//     //     }
//     // };

//     // const handleRoleAssign = async (userId: string, roleId: string, isSystemAdmin: boolean) => {
//     //     try {
//     //         await tenantApi.assignRole(parseInt(tenantId!), userId, roleId, isSystemAdmin);
//     //         await loadUsers();
//     //         setAssignRoleDialogOpen(false);
//     //     } catch (error) {
//     //         setError('Failed to assign role');
//     //         console.error('Error assigning role:', error);
//     //     }
//     // };

//     return (
//         <Box sx={{ p: 3 }}>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//                 <Typography variant="h5">
//                     User Management
//                 </Typography>
//                 <Button
//                     variant="contained"
//                     color="primary"
//                     startIcon={<AddIcon />}
//                     onClick={() => setAddUserDialogOpen(true)}
//                 >
//                     Add User
//                 </Button>
//             </Box>

//             {error && (
//                 <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
//                     {error}
//                 </Alert>
//             )}

//             <TableContainer component={Paper}>
//                 <Table>
//                     <TableHead>
//                         <TableRow>
//                             <TableCell>Name</TableCell>
//                             <TableCell>Email</TableCell>
//                             <TableCell>Role</TableCell>
//                             <TableCell>System Admin</TableCell>
//                             <TableCell>Permissions</TableCell>
//                             <TableCell>Status</TableCell>
//                             <TableCell>Actions</TableCell>
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {users.map((user) => (
//                             <TableRow key={user.id}>
//                                 <TableCell>{user.user.name}</TableCell>
//                                 <TableCell>{user.user.email}</TableCell>
//                                 <TableCell>
//                                     <Chip 
//                                         label={user.roleName}
//                                         color="primary"
//                                         variant="outlined"
//                                     />
//                                 </TableCell>
//                                 <TableCell>
//                                     {user.isSystemAdmin && (
//                                         <Chip
//                                             icon={<SecurityIcon />}
//                                             label="System Admin"
//                                             color="secondary"
//                                         />
//                                     )}
//                                 </TableCell>
//                                 <TableCell>
//                                     {user.permissions.map((permission) => (
//                                         <Chip
//                                             key={permission}
//                                             label={permission}
//                                             size="small"
//                                             sx={{ m: 0.5 }}
//                                         />
//                                     ))}
//                                 </TableCell>
//                                 <TableCell>
//                                     <Chip
//                                         label={user.isActive ? 'Active' : 'Inactive'}
//                                         color={user.isActive ? 'success' : 'error'}
//                                     />
//                                 </TableCell>
//                                 <TableCell>
//                                     <IconButton
//                                         onClick={() => {
//                                             setSelectedUser(user);
//                                             setAssignRoleDialogOpen(true);
//                                         }}
//                                     >
//                                         <EditIcon />
//                                     </IconButton>
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>

//             <AssignRoleDialog
//                 open={isAssignRoleDialogOpen}
//                 onClose={() => {
//                     setAssignRoleDialogOpen(false);
//                     setSelectedUser(null);
//                 }}
//                 user={selectedUser}
//                 availableRoles={roles}
//                 onAssign={handleRoleAssign}
//             />

//             <AddTenantUserDialog
//                 open={isAddUserDialogOpen}
//                 onClose={() => setAddUserDialogOpen(false)}
//                 tenantId={parseInt(tenantId!)}
//                 onUserAdded={loadUsers}
//             />
//         </Box>
//     );
// };