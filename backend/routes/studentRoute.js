const express = require('express');
const router = express.Router();
const {createStudent, deleteStudent, getStudent, updateStudent, studentAggregator, rawAgg, dateCheck, ageCheck, updateAge} = require('../controller/studentController')
const idValidator = require('../middleware/validation')
const auth = require('../middleware/authMiddleware');

const protect = auth.protect;
const regen = auth.regenerateAccessToken;
const validateStdId = idValidator.validateStdId();
const studentValidation = idValidator.studentValidation();
router.post('/', studentValidation, createStudent);
router.post('/regen', auth.regenerateAccessToken);
router.get('/get', getStudent);
router.get('/aggregate', studentAggregator);
router.get('/raw', rawAgg);
router.get('/date', dateCheck);
router.get('/checkAge', ageCheck);
router.put('/update', validateStdId, protect, updateStudent);
router.put('/updateAge', updateAge);
router.delete('/delete',  validateStdId, protect, deleteStudent);

module.exports = router