const express = require('express');
const { supplairDetail, getAllsupplairDetail, getByIdsupplairDetail, deleteByIdsupplairDetail } = require('../controller/supplairDetail')
const { requiredsignin } = require('../common-middleware/index');
const router = express.Router();


router.post('/supplairDetail', requiredsignin, supplairDetail);
router.get('/supplairDetails', requiredsignin, getAllsupplairDetail);
router.get('/supplairDetail', requiredsignin, getByIdsupplairDetail);
router.delete('/supplairDetail', requiredsignin, deleteByIdsupplairDetail);


module.exports = router;