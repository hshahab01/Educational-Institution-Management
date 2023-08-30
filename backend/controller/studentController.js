const asyncHandler = require('express-async-handler');
const Model = require('../models/index');
const jwt = require('jsonwebtoken');
const {Sequelize, QueryTypes} = require('sequelize');
const { validationResult } = require('express-validator');
const fs = require('fs');
const { generateAccessToken, generateRefreshToken } = require('../middleware/authMiddleware');
Student = Model.Student;
Course = Model.Course;
Instructor = Model.Instructor
Classroom = Model.Classroom
const sequelize = new Sequelize('test', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

//POST /api/student
//Creates new student user
const createStudent = asyncHandler(async (req, res) => {
  const { name, age, courses } = req.body

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  console.log(courses)

  //Find in courses collecion; courses that have the same "name" value ones in courses array
  const coursesFound = await Course.findAll({
    where: {
      name: courses,
    }
  });
  console.log(coursesFound)
  //Error if no matching courses are found
  if (coursesFound.length === 0) {
    res.status(400);
    throw new Error('Invalid courses')
  }
  // Extract the ObjectIds of the found courses
  const courseObjectIds = coursesFound.map((course) => course.id);

  const user = await Student.create({
    name,
    age,
  })
  user.save();
  console.log(courseObjectIds)
  user.addCourses(courseObjectIds);
  if (user) {
    const userData = JSON.stringify({
      id: user.id,
      name: user.name,
      courses: courses,
    });

    const fileName = `${user.id}.json`;

    fs.access('./files/' + fileName, fs.constants.F_OK, (err) => {
      if (!err) {
        res.status(400);
        throw new Error('User data file already exists');
      }

      fs.writeFile('./files/' + fileName, userData, (writeErr) => {
        if (writeErr) {
          res.status(500);
          throw new Error('Failed to save user data');
        }
      });
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      courses: courses,
    });
  }
  else {
    res.status(400);
    throw new Error('Invalid input data');
  }
})


//POST /api/student/get
//Returns details on said user
const getStudent = asyncHandler(async (req, res) => {
  const { id } = req.body;

  //Find student matched by id, extract details of courses in courses array
  const user = await Student.findByPk(id);

  if (user) {
    //single out course names from other course details
    const courses = await user.getCourses();
    const courseNames = courses.map((course) => course.name);

    res.json({
      id: user.id,
      name: user.name,
      courses: courseNames,
      token: generateAccessToken(user.id),
      refreshToken: generateRefreshToken(user.id),
    })
  }
  else {
    res.status(400);
    throw new Error('User not found')
  }
})

//POST /api/student/update
//Updates details for specific student
const updateStudent = asyncHandler(async (req, res) => {
  const { name, age, courses } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const coursesFound = await Course.findAll({
    where: {
      name: courses,
    }
  });
  console.log(coursesFound)
  //Error if no matching courses are found
  if (coursesFound.length === 0) {
    res.status(400);
    throw new Error('Invalid courses')
  }
  // Extract the ObjectIds of the found courses
  const courseObjectIds = coursesFound.map((course) => course.id);

  const user = await Student.findByPk(req.body.id);
  const currCourses = await user.getCourses();
  const courseIds = currCourses.map((course) => course.id);

  await user.removeCourses(courseIds);

  await user.update({
    name: name,
    age: age,
  });
  await user.save();
  user.addCourses(courseObjectIds);

  if (!user) {
    res.status(400);
    throw new Error('User not found');
  }
  const userData = JSON.stringify({
    id: user.id,
    name: user.name,
    courses: courses,
  });

  const fileName = `${user.id}.json`;

  fs.appendFile('./files/' + fileName, "\n" + userData, (writeErr) => {
    if (writeErr) {
      res.status(500);
      throw new Error('Failed to save user data');
    }
    else {
      console.log('updated')
    }
  });
  res.status(200).json({
    id: user.id,
    name: user.name,
    courses: courses,
  });
});

//POST /api/student/delete
//Delete certain student
const deleteStudent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  const user = await Student.findByPk(req.body.id);

  if (user) {
    const fileName = `${user.id}.json`;
    await Student.destroy({
      where: {
        id: req.body.id,
      }
    });
    fs.unlink('./files/' + fileName, function (err) {
      if (err) throw err;
      console.log('File deleted!');
    });
    res.status(200).json({ message: 'User deleted successfully' });
  } else {
    res.status(400);
    throw new Error('User not deleted');
  }
});

const studentAggregator = asyncHandler(async (req, res) => {

  //get data on all students
  const getData = await Student.findAll({
    //eager load to referred course model
    include: {
      model: Course,
      //Select what data is taken from pivot table: none.
      through: {
        attributes: []
      },
      //only name taken from course table
      attributes: ['name'],
      //eager load to referred instructor model, only name taken
      include: {
        model: Instructor,
        attributes: ['name'],
        include: {
          model: Model.Classroom,
          attributes: ['name']
        }
      }
    },
    //concat function on "name" column in students table to gather all students studying one course
    //count number of students through count
    attributes: [[sequelize.fn('GROUP_CONCAT', sequelize.col('Student.name')), 'students'], [Sequelize.fn("COUNT", Sequelize.col("Student.name")), "studentCount"]],
    raw: true,
    //group student data through obtained course names
    group: ['Courses.name']
  });

  if (getData) {
    res.json(getData);
  }
  else res.json("error")
});

const rawAgg = asyncHandler(async (req, res) => {

  //get data on all students
  const getData = await sequelize.query("call aggregator()", { type: QueryTypes.SELECT }); 

  if (getData) {
    res.json(getData);
  }
  else res.json("error")
});

const dateCheck = asyncHandler(async (req, res) => {

  const getData = await sequelize.query("call datecheck(:date)", {
    replacements: {date: req.body.date},
    type: QueryTypes.SELECT }); 

  if (getData) {
    res.json(getData);
  }
  else res.json("error")
});

const ageCheck = asyncHandler(async (req, res) => {

  const getData = await sequelize.query("call agecheck(:age)", {
    replacements: {age: req.body.age},
    type: QueryTypes.SELECT }); 

  if (getData) {
    res.json(getData);
  }
  else res.json("error")
});

const updateAge = asyncHandler(async (req, res) => {

  const getData = await sequelize.query("call updateage()", {
    type: QueryTypes.SELECT }); 

  if (getData) {
    res.json(getData);
  }
  else res.json("error")
});



module.exports = {
  createStudent,
  deleteStudent,
  updateStudent,
  getStudent,
  studentAggregator,
  rawAgg,
  dateCheck,
  ageCheck,
  updateAge,
}