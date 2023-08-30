const Sequelize = require('sequelize');

const db = new Sequelize('test', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});


const Course = db.define('Course', {
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

Course.sync()
  .then((data) => {
    console.log("Table created");
  })
  .catch((err) => {
    console.error("Table not added:", err);
  });




module.exports = Course;