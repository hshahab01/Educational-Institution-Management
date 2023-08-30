const Classroom = require("./Classroom");
const Course = require("./Course");
const Instructor = require("./Instructor");
const Student = require("./Student");


// Instructor.hasMany(Course);
// Course.belongsTo(Instructor);

// Course.sync({ alter: true })
//     .then((data) => {
//         console.log("Table modifified");
//     })
//     .catch((err) => {
//         console.error("Table not added:", err);
//     });






// // Classroom.sync()
// //     .then((data) => {
// //         console.log("Table modified");
// //     })
// //     .catch((err) => {
// //         console.error("Table not added:", err);
// //     });



// module.exports = {
//     Student,
//     Course,
//     Instructor,
//     Classroom,
// }
