const asyncHandler = require('express-async-handler');
const Model = require('../models/index');
const { validationResult } = require('express-validator');
const fs = require('fs');
Course = Model.Course;

//POST /api/course
//Creates new course
const createCourse = asyncHandler(async (req, res) => {
    const { name } = req.body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const user = await Course.create({
        name,
    })

    if (user) {
        const userData = JSON.stringify({
            id: user.id,
            name: user.name,
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


//POST /api/course/get
//Returns details on a certain course
const getCourse = asyncHandler(async (req, res) => {
    const { id } = req.body;

    const user = await Course.findOne({ id });

    if (user) {
        res.json({
            id: user.id,
            name: user.name,
        })
    }
    else {
        res.status(400);
        throw new Error('User not found')
    }
})

//POST /api/course/update/:id
//Modifies course details
const updateCourse = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }


    const user = await Course.findByPk(req.body.id);
    await user.update({
        name: req.body.name,
    });
    await user.save();
    if (!user) {
        res.status(400);
        throw new Error('Course not found');
    }
    const userData = JSON.stringify({
        id: user.id,
        name: user.name,
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
    });
});

//POST /api/course/delete/:id
//Deletes course
const deleteCourse = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const user = await Course.findByPk(req.body.id);

    if (user) {
        const fileName = `${user.name}.json`;
        await Course.destroy({
            where: {
                id: req.body.id,
            }
        });
        fs.unlink('./files/' + fileName, function (err) {
            if (err) throw err;
            console.log('File deleted!');
        });
        res.status(200).json({ message: 'Course deleted successfully' });
    } else {
        res.status(400);
        throw new Error('Course not deleted');
    }
});


module.exports = {
    createCourse,
    deleteCourse,
    updateCourse,
    getCourse,
}