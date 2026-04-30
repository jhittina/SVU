const express = require('express');
const { maintainesCost, getAllmaintainesCost, getByIdmaintainesCost, deleteByIdmaintainesCost } = require('../controller/maintainesCost')
const { requiredsignin } = require('../common-middleware/index');
const router = express.Router();


router.post('/maintainesCost', requiredsignin, maintainesCost);
router.get('/maintainesCosts', requiredsignin, getAllmaintainesCost);
router.get('/maintainesCost', requiredsignin, getByIdmaintainesCost);
router.delete('/maintainesCost', requiredsignin, deleteByIdmaintainesCost);

module.exports = router;