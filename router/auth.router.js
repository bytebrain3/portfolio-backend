import express from 'express'
import { 
    login,
    logout,
    verify_otp,
    change_super
} from '../controllers/controllers.js'
import refreshAccessToken from '../utils/refreshAccessToken.js'
import {
    verifiedAuth
} from '../middleware/verify.admin.js'


const router = express.Router();


router.post('/admin/login',login)
router.post('/admin/logout',logout)
router.post('/refresh-access-token', refreshAccessToken);
router.post('/admin/verify-otp', verify_otp);
router.post('/admin/change-power',verifiedAuth,change_super);


export default router;