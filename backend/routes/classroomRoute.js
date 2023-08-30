const express = require('express');
const router = express.Router();
const {createClassroom, deleteClassroom, getClassroom, updateClassroom} = require('../controller/classroomController')
const idValidator = require('../middleware/validation')


const validateClassroomId = idValidator.validateClassroomId();
const classroomValidation = idValidator.classroomValidation();
router.post('/', classroomValidation, createClassroom);
router.get('/get', getClassroom);
router.put('/update', validateClassroomId, updateClassroom);
router.delete('/delete', validateClassroomId, deleteClassroom);

module.exports = router