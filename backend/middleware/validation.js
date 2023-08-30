
const { param, body, validationResult, checkSchema } = require('express-validator');
const Model = require('../models/index');

const Student = Model.Student;
const Course = Model.Course;
const Instructor = Model.Instructor;
const Classroom = Model.Classroom;

module.exports = {
  validateStdId: () => {
    return [
      body('id').custom(async value => {
        const user = await Student.findByPk(value);
        if (!user) {
          throw new Error('User does not exist');
        }
      }),
    ];
  },
  validateCourseId: () => {
    return [
      body('id').custom(async value => {
        const user = await Course.findByPk(value);
        if (!user) {
          throw new Error('Course does not exist');
        }
      }),
    ];
  },
  validateInstructorId: () => {
    return [
      body('id').custom(async value => {
        const user = await Instructor.findByPk(value);
        if (!user) {
          throw new Error('Instructor does not exist');
        }
      }),
    ];
  },
  validateClassroomId: () => {
    return [
      body('id').custom(async value => {
        const user = await Classroom.findByPk(value);
        if (!user) {
          throw new Error('Classroom does not exist');
        }
      }),
    ];
  },
  studentValidation: () => {
    return [
      body('data').custom(async (value, { req }) => {
        await Promise.all([
          body('name').notEmpty().withMessage('Name is mandatory').run(req),
          body('age').notEmpty().withMessage('Age is mandatory').run(req),
          body('courses').custom(arrayNotEmpty).withMessage('Courses are mandatory').run(req),
        ]);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new Error('Invalid input data');
        }
      })
    ]
  },
  courseValidation: () =>{
    return [
      body('data').custom(async (value, { req }) => {
        await Promise.all([
          body('name').notEmpty().withMessage('Name is mandatory').run(req),
        ]);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new Error('Invalid input data');
        }
      })
    ]
  },
  instructorValidation: () =>{
    return [
      body('data').custom(async (value, { req }) => {
        await Promise.all([
          body('name').notEmpty().withMessage('Name is mandatory').run(req),
        ]);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new Error('Invalid input data');
        }
      })
    ]
  },
  classroomValidation: () =>{
    return [
      body('data').custom(async (value, { req }) => {
        await Promise.all([
          body('name').notEmpty().withMessage('Name is mandatory').run(req),
        ]);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          throw new Error('Invalid input data');
        }
      })
    ]
  }
}

const arrayNotEmpty = (value) => {
  if (Array.isArray(value) && value.length === 0) {
    throw new Error('Array must not be empty.');
  }
  return true;
};
