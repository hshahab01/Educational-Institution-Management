const asyncHandler = require('express-async-handler');
const Model = require('../models/index');
const { validationResult } = require('express-validator');
const fs = require('fs');
Classroom = Model.Classroom;

//POST /api/classroom
//Creates new classroom
const createClassroom = asyncHandler(async (req, res) => {
    const { name } = req.body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const user = await Classroom.create({
        name,
    })

    if (user) {
        const userData = JSON.stringify({
            id: user.id,
            classroom: user.name,
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
            classroom: user.name,
        });
    }
    else {
        res.status(400);
        throw new Error('Invalid input data');
    }
})


//POST /api/classroom/get
//Returns details on a certain classroom
const getClassroom = asyncHandler(async (req, res) => {
    const { id } = req.body;

    const user = await Classroom.findOne({ id });

    if (user) {
        res.json({
            id: user.id,
            name: user.name,
        })
    }
    else {
        res.status(400);
        throw new Error('Room not found')
    }
})

//POST /api/classroom/update/:id
//Modifies classroom details
const updateClassroom = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }


    const user = await Classroom.findByPk(req.body.id);
    await user.update({
        name: req.body.name,
    });
    await user.save();
    if (!user) {
        res.status(400);
        throw new Error('Classroom not found');
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
        classroom: user.name,
    });
});

//POST /api/classroom/delete/:id
//Deletes classroom
const deleteClassroom = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const user = await Classroom.findByPk(req.body.id);

    if (user) {
        const fileName = `${user.name}.json`;
        await Classroom.destroy({
            where: {
                id: req.body.id,
            }
        });
        fs.unlink('./files/' + fileName, function (err) {
            if (err) throw err;
            console.log('File deleted!');
        });
        res.status(200).json({ message: 'Classroom deleted successfully' });
    } else {
        res.status(400);
        throw new Error('Classroom not deleted');
    }
});


module.exports = {
    createClassroom,
    deleteClassroom,
    updateClassroom,
    getClassroom,
}