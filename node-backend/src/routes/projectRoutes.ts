import express, { RequestHandler } from 'express';
/*import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember
} from '../controllers/projectController';*/
//import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Protect all routes
//router.use(protect as RequestHandler);
/*
// Project routes
router.route('/')
  .get(getProjects as RequestHandler)
  .post(authorize('admin', 'project_manager') as RequestHandler, createProject as RequestHandler);

router.route('/:id')
  .get(getProject as RequestHandler)
  .put(authorize('admin', 'project_manager') as RequestHandler, updateProject as RequestHandler)
  .delete(authorize('admin', 'project_manager') as RequestHandler, deleteProject as RequestHandler);

// Team management routes
router.route('/:id/team')
  .post(authorize('admin', 'project_manager') as RequestHandler, addTeamMember as RequestHandler);

router.route('/:id/team/:userId')
  .delete(authorize('admin', 'project_manager') as RequestHandler, removeTeamMember as RequestHandler);
*/
export default router;
