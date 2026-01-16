const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.use(authMiddleware);
router.use(roleMiddleware(['USER']));

router.get('/stores', userController.getStores);
router.post('/ratings', userController.submitRating);
router.put('/password', userController.updatePassword);

module.exports = router;