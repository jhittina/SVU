const express = require('express');
const { production, getAllProduction, getByIdProduction, deleteByIdProduction } = require('../controller/production')
const { requiredsignin } = require('../common-middleware/index');
const router = express.Router();


router.post('/production', requiredsignin, production);
router.get('/productions', requiredsignin, getAllProduction);
router.get('/production', requiredsignin, getByIdProduction);
router.delete('/production', requiredsignin, deleteByIdProduction);


module.exports = router;