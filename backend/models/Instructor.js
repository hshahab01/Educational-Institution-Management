const Sequelize = require('sequelize');
const Course = require('./Course');
const Classroom = require('./Classroom');

const db = new Sequelize('test', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});


const Instructor = db.define('Instructor', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
}, {
    timestamps: true,
});

Instructor.sync()
  .then((data) => {
    console.log("Table modified");
  })
  .catch((err) => {
    console.error("Table not added:", err);
  });

Instructor.hasMany(Course);
Course.belongsTo(Instructor);

Course.sync({alter: true})
  .then((data) => {
    console.log("Table modified");
  })
  .catch((err) => {
    console.error("Table not added:", err);
  });

Instructor.hasOne(Classroom);
Classroom.belongsTo(Instructor);

Classroom.sync({alter: true})
  .then((data) => {
    console.log("Table modified");
  })
  .catch((err) => {
    console.error("Table not added:", err);
  });




module.exports = Instructor;