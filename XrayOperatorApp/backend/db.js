// D:/MajorProject/XrayOperatorApp/backend/db.js
require('dotenv').config();
const { Pool } = require('pg'); // Use require

const pool = new Pool({
   user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.DBPWD,
  port: parseInt(process.env.DBPORT),
});

pool.on("connect", () => {
  console.log("Connected to the database successfully");
});

module.exports = pool; // Use module.exports