const express = require('express');
const { cementRawMatirial, getAllcementRawMatirial, getByIdcementRawMatirial, deleteByIdcementRawMatirial } = require('../controller/cementRawMatirial')
const { requiredsignin } = require('../common-middleware/index');
const router = express.Router();


router.post('/cementRawMatirial', requiredsignin, cementRawMatirial);
router.get('/cementRawMatirials', requiredsignin, getAllcementRawMatirial);
router.get('/cementRawMatirial', requiredsignin, getByIdcementRawMatirial);
router.delete('/cementRawMatirial', requiredsignin, deleteByIdcementRawMatirial);


module.exports = router;