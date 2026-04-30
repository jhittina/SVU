const express = require('express');
const { dailyTransportDetail, getAlldailyTransportDetail, getByIddailyTransportDetail, deleteByIddailyTransportDetail } = require('../controller/dailyTransportDetail')
const { requiredsignin } = require('../common-middleware/index');
const router = express.Router();


router.post('/dailyTransportDetail', requiredsignin, dailyTransportDetail);
router.get('/dailyTransportDetails', requiredsignin, getAlldailyTransportDetail);
router.get('/dailyTransportDetail', requiredsignin, getByIddailyTransportDetail);
router.delete('/dailyTransportDetail', requiredsignin, deleteByIddailyTransportDetail);


module.exports = router;