const express = require('express');
const { flyAshRawMatirial, getAllflyAshRawMatirial, getByIdflyAshRawMatirial, deleteByIdflyAshRawMatirial } = require('../controller/flyAshRawMatirial')
const { requiredsignin } = require('../common-middleware/index');
const router = express.Router();


router.post('/flyAshRawMatirial', requiredsignin, flyAshRawMatirial);
router.get('/flyAshRawMatirials', requiredsignin, getAllflyAshRawMatirial);
router.get('/flyAshRawMatirial', requiredsignin, getByIdflyAshRawMatirial);
router.delete('/flyAshRawMatirial', requiredsignin, deleteByIdflyAshRawMatirial);


module.exports = router;