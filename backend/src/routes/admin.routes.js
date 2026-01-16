const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/dashboard', adminController.getDashboard);
router.post('/users', adminController.createUser);
router.post('/stores', adminController.createStore);
router.get('/users', adminController.getUsers);
router.get('/stores', adminController.getStores);

module.exports = router;