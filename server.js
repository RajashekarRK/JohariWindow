const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.error("MongoDB connection error: ", err));

// Import routes
const johariRoutes = require('./routes/johari');

// Use routes
app.use('/api/johari', johariRoutes);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});