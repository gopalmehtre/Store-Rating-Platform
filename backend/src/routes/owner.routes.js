const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

router.use(authMiddleware);
router.use(roleMiddleware(['OWNER']));

router.get('/my-store/ratings', ownerController.getMyStoreRatings);
router.put('/password', ownerController.updatePassword);

module.exports = router;