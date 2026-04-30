const express = require('express');
const { workerSalary, getAllworkerSalary, getByIdworkerSalary, deleteByIdworkerSalary } = require('../controller/workerSalary')
const { requiredsignin } = require('../common-middleware/index');
const router = express.Router();


router.post('/workerSalary', requiredsignin, workerSalary);
router.get('/workerSalarys', requiredsignin, getAllworkerSalary);
router.get('/workerSalary', requiredsignin, getByIdworkerSalary);
router.delete('/workerSalary', requiredsignin, deleteByIdworkerSalary);

module.exports = router;