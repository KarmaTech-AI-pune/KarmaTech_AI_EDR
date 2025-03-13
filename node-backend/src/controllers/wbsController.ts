import { Request, Response } from 'express';
import mongoose from 'mongoose';
import WorkBreakdownStructure, { IWorkBreakdownStructure } from '../models/WorkBreakdownStructure';

import { asyncHandler } from '../middleware/error';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser & {
    id: string;
  };
}
/*
// @desc    Create new WBS task
// @route   POST /api/projects/:projectId/wbs
// @access  Private
export const createWBSTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.projectId);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Verify user has permission
  if (project.projectManager.toString() !== req.user?.id && req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to create WBS tasks');
  }

  const wbsTask = await WorkBreakdownStructure.create({
    ...req.body,
    project: req.params.projectId
  }) as IWorkBreakdownStructure & { _id: mongoose.Types.ObjectId };

  res.status(201).json({
    success: true,
    data: wbsTask
  });
});

// @desc    Get all WBS tasks for a project
// @route   GET /api/projects/:projectId/wbs
// @access  Private
export const getWBSTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wbsTasks = await WorkBreakdownStructure.find({ project: req.params.projectId })
    .populate('assignedTo', 'username email')
    .populate('dependencies', 'taskName');

  res.json({
    success: true,
    count: wbsTasks.length,
    data: wbsTasks
  });
});

// @desc    Get single WBS task
// @route   GET /api/projects/:projectId/wbs/:id
// @access  Private
export const getWBSTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wbsTask = await WorkBreakdownStructure.findById(req.params.id)
    .populate('assignedTo', 'username email')
    .populate('dependencies', 'taskName');

  if (!wbsTask) {
    res.status(404);
    throw new Error('WBS task not found');
  }

  res.json({
    success: true,
    data: wbsTask
  });
});

// @desc    Update WBS task
// @route   PUT /api/projects/:projectId/wbs/:id
// @access  Private
export const updateWBSTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  let wbsTask = await WorkBreakdownStructure.findById(req.params.id);

  if (!wbsTask) {
    res.status(404);
    throw new Error('WBS task not found');
  }

  const project = await Project.findById(wbsTask.project);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Verify user has permission
  if (project.projectManager.toString() !== req.user?.id && req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update WBS tasks');
  }

  wbsTask = await WorkBreakdownStructure.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('assignedTo', 'username email')
    .populate('dependencies', 'taskName');

  res.json({
    success: true,
    data: wbsTask
  });
});

// @desc    Delete WBS task
// @route   DELETE /api/projects/:projectId/wbs/:id
// @access  Private
export const deleteWBSTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wbsTask = await WorkBreakdownStructure.findById(req.params.id);

  if (!wbsTask) {
    res.status(404);
    throw new Error('WBS task not found');
  }

  const project = await Project.findById(wbsTask.project);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Verify user has permission
  if (project.projectManager.toString() !== req.user?.id && req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete WBS tasks');
  }

  // Remove this task from dependencies of other tasks
  await WorkBreakdownStructure.updateMany(
    { dependencies: wbsTask._id },
    { $pull: { dependencies: wbsTask._id } }
  );

  await wbsTask.deleteOne();

  res.json({
    success: true,
    data: {}
  });
});

// @desc    Update WBS task progress
// @route   PUT /api/projects/:projectId/wbs/:id/progress
// @access  Private
export const updateTaskProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { progress } = req.body;

  const wbsTask = await WorkBreakdownStructure.findById(req.params.id);

  if (!wbsTask) {
    res.status(404);
    throw new Error('WBS task not found');
  }

  // Verify user is assigned to task or is project manager/admin
  const isAssigned = wbsTask.assignedTo.some(userId => userId.toString() === req.user?.id);
  const project = await Project.findById(wbsTask.project);

  if (!isAssigned && project?.projectManager.toString() !== req.user?.id && req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update task progress');
  }

  wbsTask.progress = progress;
  await wbsTask.save();

  res.json({
    success: true,
    data: wbsTask
  });
});
*/