import express from 'express';
import {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    searchUsers,
    getUsersByRole,
    login,
    getRoles,
    getPermissions
} from '../controllers/userController';

const router = express.Router();

// Base routes
router.route('/')
    .get(getAllUsers);

// Auth routes
router.post('/login', login);

// Role and permission routes
router.get('/roles', getRoles);
router.get('/permissions', getPermissions);

// Create user route matching C# endpoint
router.post('/Create', createUser);

// User by ID routes
router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

// Search route
router.get('/search', searchUsers);

// Get users by role route matching C# endpoint
router.get('/by-role/:role', getUsersByRole);

export default router;
