// app.js
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const dataFilePath = path.join(__dirname, 'data.json');

// ... (other code remains the same)

// GET route to retrieve the list from the JSON file
app.get('/api/data', async (req, res) => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const parsedData = JSON.parse(data);
    res.json(parsedData);
  } catch (error) {
    console.error('Error reading data file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST route to update the list in the JSON file
app.post('/api/data', async (req, res) => {
  try {
    const newData = req.body;
    // Write the updated data back to the file
    await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), 'utf-8');
    res.json({ message: 'List updated successfully', list: newData });
  } catch (error) {
    console.error('Error updating data file:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`);
});