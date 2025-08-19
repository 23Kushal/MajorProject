const express = require("express");
const cors = require("cors");
require("dotenv").config();

const modelRoute = require('./routes/modelRoute/modelRoute.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/uploadImg', modelRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port: ${PORT}`);
});