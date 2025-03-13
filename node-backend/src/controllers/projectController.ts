import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/error';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser & {
    id: string;
  };
}
/*
// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  req.body.createdBy = req.user?.id;
  const project = await Project.create(req.body) as IProject & { _id: mongoose.Types.ObjectId };

  res.status(201).json({
    success: true,
    data: project
  });
});

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const projects = await Project.find()
    .populate('projectManager', 'username email')
    .populate('team', 'username email')
    .populate('createdBy', 'username email');

  res.json({
    success: true,
    count: projects.length,
    data: projects
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id)
    .populate('projectManager', 'username email')
    .populate('team', 'username email')
    .populate('createdBy', 'username email');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.json({
    success: true,
    data: project
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Make sure user is project manager or admin
  if (project.projectManager.toString() !== req.user?.id && req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this project');
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('projectManager', 'username email')
    .populate('team', 'username email')
    .populate('createdBy', 'username email');

  res.json({
    success: true,
    data: project
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Make sure user is project manager or admin
  if (project.projectManager.toString() !== req.user?.id && req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this project');
  }

  await project.deleteOne();

  res.json({
    success: true,
    data: {}
  });
});

// @desc    Add team member to project
// @route   POST /api/projects/:id/team
// @access  Private
export const addTeamMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Make sure user is project manager or admin
  if (project.projectManager.toString() !== req.user?.id && req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify team');
  }

  // Check if member already exists
  if (project.team.includes(req.body.userId)) {
    res.status(400);
    throw new Error('User already in team');
  }

  project.team.push(req.body.userId);
  await project.save();

  res.json({
    success: true,
    data: project
  });
});

// @desc    Remove team member from project
// @route   DELETE /api/projects/:id/team/:userId
// @access  Private
export const removeTeamMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Make sure user is project manager or admin
  if (project.projectManager.toString() !== req.user?.id && req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify team');
  }

  project.team = project.team.filter(
    member => member.toString() !== req.params.userId
  );

  await project.save();

  res.json({
    success: true,
    data: project
  });
});
*/