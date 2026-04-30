const express = require('express');
const { vehicalDetail, getAllvehicalDetail, getByIdvehicalDetail, deleteByIdvehicalDetail } = require('../controller/vehicalDetail')
const { requiredsignin } = require('../common-middleware/index');
const router = express.Router();


router.post('/vehicalDetail', requiredsignin, vehicalDetail);
router.get('/vehicalDetails', requiredsignin, getAllvehicalDetail);
router.get('/vehicalDetail', requiredsignin, getByIdvehicalDetail);
router.delete('/vehicalDetail', requiredsignin, deleteByIdvehicalDetail);


module.exports = router;