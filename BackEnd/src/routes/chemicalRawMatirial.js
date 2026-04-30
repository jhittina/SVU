const express = require('express');
const { chemicalRawMatirial, getAllchemicalRawMatirial, getByIdchemicalRawMatirial, deleteByIdchemicalRawMatirial } = require('../controller/chemicalRawMatirial')
const { requiredsignin } = require('../common-middleware/index');
const router = express.Router();


router.post('/chemicalRawMatirial', requiredsignin, chemicalRawMatirial);
router.get('/chemicalRawMatirials', requiredsignin, getAllchemicalRawMatirial);
router.get('/chemicalRawMatirial', requiredsignin, getByIdchemicalRawMatirial);
router.delete('/chemicalRawMatirial', requiredsignin, deleteByIdchemicalRawMatirial);


module.exports = router;