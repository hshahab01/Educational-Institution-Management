const Sequelize = require('sequelize');

const connectDB = async () => {
  const sequelize = new Sequelize('test', 'root', '', {
    host: 'localhost',
    dialect:'mysql',
    logging: false,
  });
  try {
    await sequelize.authenticate();
    console.log(`MySQL Connected: ${sequelize.config.host}`.cyan.underline)
  } catch (error) {
    console.log("Database connection not authenticated".red.underline, error)
    process.exit(1)
  }
}

module.exports = connectDB