const express = require('express');
const { dustAndPowderRawMatirial, getAlldustAndPowderRawMatirial, getByIddustAndPowderRawMatirial, deleteByIddustAndPowderRawMatirial } = require('../controller/dustAndPowderRawMatirial')
const { requiredsignin } = require('../common-middleware/index');
const router = express.Router();


router.post('/dustAndPowderRawMatirial', requiredsignin, dustAndPowderRawMatirial);
router.get('/dustAndPowderRawMatirials', requiredsignin, getAlldustAndPowderRawMatirial);
router.get('/dustAndPowderRawMatirial', requiredsignin, getByIddustAndPowderRawMatirial);
router.delete('/dustAndPowderRawMatirial', requiredsignin, deleteByIddustAndPowderRawMatirial);


module.exports = router;