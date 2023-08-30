const Sequelize = require('sequelize');

const db = new Sequelize('test', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});


const Classroom = db.define('Classroom', {
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

Classroom.sync()
    .then((data) => {
        console.log("Table created");
    })
    .catch((err) => {
        console.error("Table not added:", err);
    });

module.exports = Classroom;