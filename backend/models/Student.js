const Sequelize = require('sequelize');
const Course = require('./Course');

const db = new Sequelize('test', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

const Student = db.define('Student', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true, 
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  age: {
    type: Sequelize.INTEGER,
  },
}, {
  timestamps: true, 
});
Course.belongsToMany(Student, { through: 'StudentCourses' });
Student.belongsToMany(Course, { through: 'StudentCourses' });
db.sync()
  .then((data) => {
    console.log("Table created");
  })
  .catch((err) => {
    console.error("Table not added:", err);
  });

module.exports = Student;
 