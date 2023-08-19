const express = require('express');
const bodyParser = require('body-parser');
const { connect, findUser } = require('./DBfunctions');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

connect(); // Connect to the database

// define API endpoints

// adds data to the database
app.post('/addData', async (req, res) => {
  const { collectionName, data } = req.body;
  await addToDB(collectionName, data);
  res.status(200).json({ message: 'Data added successfully' });
});

// finds a user in the database
app.get('/findUser', async (req, res) => {
  const { username, password } = req.query;
  const user = await findUser(username, password);
  res.status(200).json({ user });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
