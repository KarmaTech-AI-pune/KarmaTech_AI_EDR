import express, { RequestHandler } from 'express';
/*import {
  createWBSTask,
  getWBSTasks,
  getWBSTask,
  updateWBSTask,
  deleteWBSTask,
  updateTaskProgress
} from '../controllers/wbsController'; */
//import { protect, authorize } from '../middleware/auth';

const router = express.Router({ mergeParams: true }); // Enable access to parent router params

// Protect all routes
//router.use(protect as RequestHandler);
/*
// WBS routes
router.route('/')
  .get(getWBSTasks as RequestHandler)
  .post(authorize('admin', 'project_manager') as RequestHandler, createWBSTask as RequestHandler);

router.route('/:id')
  .get(getWBSTask as RequestHandler)
  .put(authorize('admin', 'project_manager') as RequestHandler, updateWBSTask as RequestHandler)
  .delete(authorize('admin', 'project_manager') as RequestHandler, deleteWBSTask as RequestHandler);

// Task progress route
router.route('/:id/progress')
  .put(updateTaskProgress as RequestHandler);
*/
export default router;
