import express from 'express';
import {
    write_blog,
    edit_blog,
    save_blog,
    delete_blog,
    blog_list
} from '../controllers/controllers.js';

import {
    verifiedAuth
} from '../middleware/verify.admin.js';


const router = express.Router();


router.post('/admin/create-blog',verifiedAuth,write_blog)
router.get('/admin/edit-blog/:bid',verifiedAuth,edit_blog)
router.post('/admin/save-blog',verifiedAuth,save_blog)
router.delete('/admin/delete-blog/:bid',verifiedAuth,delete_blog)
router.get('/admin/blogs',blog_list)

export default router; 