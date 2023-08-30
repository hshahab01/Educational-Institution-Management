const asyncHandler = require('express-async-handler');
const Model = require('../models/index')
const { validationResult } = require('express-validator');
const fs = require('fs');
const { QueryTypes, Sequelize } = require('sequelize');
Course = Model.Course;
Instructor = Model.Instructor;
Classroom = Model.Classroom;
const sequelize = new Sequelize('test', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
  });

//POST /api/instructor
//Creates new instructor
const createInstructor = asyncHandler(async (req, res) => {
    const { name, courses, classroom } = req.body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const room = await Classroom.findOne({
        where: {
            name: classroom,
        }
    });

    if (!room) {
        res.status(400);
        throw new Error('Invalid room')
    }

    const coursesFound = await Course.findAll({
        where: {
            name: courses,
        }
    });

    if (coursesFound.length === 0) {
        res.status(400);
        throw new Error('Invalid courses')
    }

    const courseObjectIds = coursesFound.map((course) => course.id);

    const user = await Instructor.create({
        name,
    })

    user.save();
    user.addCourses(courseObjectIds);
    user.setClassroom(room.id)

    if (user) {
        const userData = JSON.stringify({
            id: user.id,
            name: user.name,
            coursesTaught: courses,
            classroom: room.name,
        });

        const fileName = `${name}.json`;

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
        });
    }
    else {
        res.status(400);
        throw new Error('Invalid input data');
    }
})


//POST /api/instructor/get
//Returns details on a certain instructor
const getInstructor = asyncHandler(async (req, res) => {
    const { id } = req.body;

    const user = await Instructor.findOne({ id });

    const courses = await user.getCourses();
    const courseNames = courses.map((course) => course.name);
    const classroom = await user.getClassroom();

    if (user) {
        res.json({
            id: user.id,
            name: user.name,
            coursesTaught: courseNames,
            classroom: classroom.name,
        })
    }
    else {
        res.status(400);
        throw new Error('User not found')
    }
})

//POST /api/instructor/update/:id
//Modifies instructor details
const updateInstructor = asyncHandler(async (req, res) => {
    const { name, courses, id, classroom } = req.body;

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

    if (coursesFound.length === 0) {
        res.status(400);
        throw new Error('Invalid courses')
    }
    // Extract the ObjectIds of the found courses
    const courseObjectIds = coursesFound.map((course) => course.id);

    const room = await Classroom.findOne({
        where: {
            name: classroom,
        }
    });

    if (!room) {
        res.status(400);
        throw new Error('Invalid room')
    }

    const user = await Instructor.findByPk(req.body.id);

    const currCourses = await user.getCourses();
    const courseIds = currCourses.map((course) => course.id);

    await user.removeCourses(courseIds);
    await user.setClassroom(null);
    await user.update({
        name: req.body.name,
    });
    await user.save();
    user.addCourses(courseObjectIds);
    user.setClassroom(room.id)

    if (!user) {
        res.status(400);
        throw new Error('Instructor not found');
    }
    const userData = JSON.stringify({
        id: user.id,
        name: user.name,
        coursesTaught: courses,
        classroom: room.name
    });

    const fileName = `${name}.json`;

    fs.appendFile('./files/' + fileName, userData, (writeErr) => {
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
        classroom: room.name,
    });
});

//POST /api/instructor/delete/:id
//Deletes instructor
const deleteInstructor = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const user = await Instructor.findByPk(req.body.id);

    if (user) {
        const fileName = `${user.name}.json`;
        await Instructor.destroy({
            where: {
                id: req.body.id,
            }
        });
        fs.unlink('./files/' + fileName, function (err) {
            if (err) throw err;
            console.log('File deleted!');
        });
        res.status(200).json({ message: 'Instructor deleted successfully' });
    } else {
        res.status(400);
        throw new Error('Instructor not deleted');
    }
});

const insCount = asyncHandler(async (req, res) => {

    const getData = await sequelize.query("call inscount(:iname)", {
        replacements: { iname: req.body.name },
        type: QueryTypes.SELECT
    });

    if (getData) {
        res.json(getData);
    }
    else res.json("error")
});


module.exports = {
    createInstructor,
    deleteInstructor,
    updateInstructor,
    getInstructor,
    insCount,
}