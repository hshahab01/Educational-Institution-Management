const express = require('express');
const router = express.Router();
const {createInstructor, deleteInstructor, getInstructor, updateInstructor, insCount} = require('../controller/instructorController')
const idValidator = require('../middleware/validation')


const validateInstructorId = idValidator.validateInstructorId();
const instructorValidation = idValidator.instructorValidation();
router.post('/', instructorValidation, createInstructor);
router.get('/get', getInstructor);
router.get('/count', insCount);
router.put('/update', validateInstructorId, updateInstructor);
router.delete('/delete', validateInstructorId, deleteInstructor);

module.exports = router