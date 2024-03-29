const express = require('express');
const fs = require('fs/promises'); // Import fs module for file operations
const bearerToken = require('express-bearer-token');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;

import path from 'path';
try {
  const dataFilePath = path.join(process.cwd(), 'tmp', 'data.json');
} catch (error) {
  console.error('Error finding data file:', error);
}


// Middleware to parse JSON requests
app.use(express.json());
app.use(bearerToken());

// Authentication middleware

app.use((req, res, next) => {
  const apiKey = req.token || req.query.apiKey;
  const expectedApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== expectedApiKey) {
    console.log(expectedApiKey);
    console.log(apiKey);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
});

// GET route to retrieve the list from the JSON file
app.get('/', async (req, res) => {
  try {
    const path = `/api/data`;
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const parsedData = JSON.parse(data);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.json(parsedData);
  } catch (error) {
    console.error('Error reading data file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST route to update the list in the JSON file
app.post('/', async (req, res) => {
  try {
    const newData = req.body;

    // Validate that the request body is an array
    if (!Array.isArray(newData)) {
      return res.status(400).json({ error: 'Invalid request body. Expecting an array.' });
    }

    const currentData = await fs.readFile(dataFilePath, 'utf-8');
    let parsedCurrentData = JSON.parse(currentData);

    // Update the list with the new data
    parsedCurrentData = newData;
    
    await fs.writeFile(dataFilePath, JSON.stringify(parsedCurrentData, null, 2), 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.json({ message: 'List updated successfully', list: newData });
  } catch (error) {
    console.error('Error updating data file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;


app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`);
});
