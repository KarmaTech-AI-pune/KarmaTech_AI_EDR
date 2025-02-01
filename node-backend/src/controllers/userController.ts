import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

// @desc    Login user
// @route   POST /api/user/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = await User.findOne({ userName: username });
    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    res.json({
        success: true,
        message: 'Login successful',
        user: {
            id: user._id,
            userName: user.userName,
            name: user.name,
            email: user.email,
            roles: user.roles,
            isConsultant: user.isConsultant || undefined,
            standardRate: user.standardRate || undefined
        }
    });
});

// @desc    Get all roles
// @route   GET /api/user/roles
// @access  Public
export const getRoles = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find().select('roles');
    const allRoles = new Set<string>();
    users.forEach(user => {
        user.roles.forEach(role => {
            allRoles.add(role.name);
        });
    });
    res.json(Array.from(allRoles));
});

// @desc    Get all permissions
// @route   GET /api/user/permissions
// @access  Public
export const getPermissions = asyncHandler(async (req: Request, res: Response) => {
    // Since permissions are role-based in this implementation,
    // we'll return the roles as permissions to match the C# API
    const users = await User.find().select('roles');
    const allPermissions = new Set<string>();
    users.forEach(user => {
        user.roles.forEach(role => {
            allPermissions.add(role.name);
        });
    });
    res.json(Array.from(allPermissions));
});

// @desc    Get all users
// @route   GET /api/user
// @access  Public
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find().select('-password');
    
    res.json(users.map(user => ({
        id: user._id,
        userName: user.userName,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isConsultant: user.isConsultant || undefined,
        standardRate: user.standardRate || undefined
    })));
});

// @desc    Create new user
// @route   POST /api/user/Create
// @access  Public
export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { userName, name, email, roles, isConsultant, standardRate } = req.body;
    const password = "Admin@123"; // Default password as per C# backend

    // Check if user already exists
    const userExists = await User.findOne({ userName });
    if (userExists) {
        res.status(400);
        throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        userName,
        name,
        email,
        password: hashedPassword,
        roles,
        ...(isConsultant !== undefined && { isConsultant }),
        ...(standardRate !== undefined && { standardRate })
    });

    if (user) {
        res.status(201).json({
            id: user._id,
            userName: user.userName,
            name: user.name,
            email: user.email,
            roles: user.roles,
            isConsultant: user.isConsultant || undefined,
            standardRate: user.standardRate || undefined
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get user by ID
// @route   GET /api/user/:id
// @access  Public
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
        res.json({
            id: user._id,
            userName: user.userName,
            name: user.name,
            email: user.email,
            roles: user.roles,
            isConsultant: user.isConsultant || undefined,
            standardRate: user.standardRate || undefined
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user
// @route   PUT /api/user/:id
// @access  Public
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if userName is being updated and if it already exists
    if (req.body.userName && req.body.userName !== user.userName) {
        const userNameExists = await User.findOne({ userName: req.body.userName });
        if (userNameExists) {
            res.status(400);
            throw new Error('Username already exists');
        }
    }

    interface UpdateData {
        userName: string;
        name: string;
        email: string;
        roles: typeof user.roles;
        password: string;
        isConsultant?: boolean;
        standardRate?: number;
    }

    const updateData: UpdateData = {
        userName: req.body.userName || user.userName,
        name: req.body.name || user.name,
        email: req.body.email || user.email,
        roles: req.body.roles || user.roles,
        password: req.body.password || user.password
    };

    if (req.body.isConsultant !== undefined) {
        updateData.isConsultant = req.body.isConsultant;
    }
    if (req.body.standardRate !== undefined) {
        updateData.standardRate = req.body.standardRate;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    ).select('-password');

    if (!updatedUser) {
        res.status(404);
        throw new Error('User not found after update');
    }

    res.json({
        id: updatedUser._id,
        userName: updatedUser.userName,
        name: updatedUser.name,
        email: updatedUser.email,
        roles: updatedUser.roles,
        isConsultant: updatedUser.isConsultant || undefined,
        standardRate: updatedUser.standardRate || undefined
    });
});

// @desc    Delete user
// @route   DELETE /api/user/:id
// @access  Public
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
});

// @desc    Search users
// @route   GET /api/user/search
// @access  Public
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;
    if (!query) {
        res.status(400);
        throw new Error('Search query is required');
    }

    const users = await User.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { userName: { $regex: query, $options: 'i' } }
        ]
    }).select('-password');

    res.json(users.map(user => ({
        id: user._id,
        userName: user.userName,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isConsultant: user.isConsultant || undefined,
        standardRate: user.standardRate || undefined
    })));
});

// @desc    Get users by role
// @route   GET /api/user/by-role/:role
// @access  Public
export const getUsersByRole = asyncHandler(async (req: Request, res: Response) => {
    const role = req.params.role;
    const users = await User.find({
        'roles.name': role
    }).select('-password');

    res.json(users.map(user => ({
        id: user._id,
        userName: user.userName,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isConsultant: user.isConsultant || undefined,
        standardRate: user.standardRate || undefined
    })));
});
