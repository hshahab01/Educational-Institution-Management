const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;
connectDB();

const {errorHandler} = require('./middleware/errorMiddleware')
const colors = require('colors');

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: false}))




app.use('/api/student', require('./routes/studentRoute'));
app.use('/api/course', require('./routes/courseRoute'));
app.use('/api/instructor', require('./routes/instructorRoute'));
app.use('/api/classroom', require('./routes/classroomRoute'));

app.use(errorHandler);

app.listen(port, console.log('Server started on  port ' + port ))
