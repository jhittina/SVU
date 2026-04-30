const express = require('express');
const { pondAshRawMatirial, getAllpondAshRawMatirial, getByIdpondAshRawMatirial, deleteByIdpondAshRawMatirial } = require('../controller/pondAshRawMatirial')
const { requiredsignin } = require('../common-middleware/index');
const router = express.Router();


router.post('/pondAshRawMatirial', requiredsignin, pondAshRawMatirial);
router.get('/pondAshRawMatirials', requiredsignin, getAllpondAshRawMatirial);
router.get('/pondAshRawMatirial', requiredsignin, getByIdpondAshRawMatirial);
router.delete('/pondAshRawMatirial', requiredsignin, deleteByIdpondAshRawMatirial);


module.exports = router;