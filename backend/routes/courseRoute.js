const express = require('express');
const router = express.Router();
const {createCourse, deleteCourse, getCourse, updateCourse} = require('../controller/courseController')
const idValidator = require('../middleware/validation')


const validateCourseId = idValidator.validateCourseId();
const courseValidation = idValidator.courseValidation();
router.post('/', courseValidation, createCourse);
router.get('/get', getCourse);
router.put('/update', validateCourseId, updateCourse);
router.delete('/delete', validateCourseId, deleteCourse);

module.exports = router