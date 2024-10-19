import express from 'express';
import {
    add_project,
    edit_project,
    save_project,
    delete_project,
    project_list
} from '../controllers/controllers.js'
import {
    verifiedAuth
} from '../middleware/verify.admin.js';

const router = express.Router();

router.post('/admin/add-project',verifiedAuth,add_project)
router.get('/admin/projects',project_list)

router.get('/admin/edit-project/:pid',verifiedAuth,edit_project)

router.post('/admin/save-project',verifiedAuth,save_project)
router.delete('/admin/delete-project/:pid',verifiedAuth,delete_project)
export default router; 