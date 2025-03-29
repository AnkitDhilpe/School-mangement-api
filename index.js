import express from 'express';
import bodyPaser from 'body-parser';
import mysql from 'mysql2';
import pool from './db.js'
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;


// Create School Table if not exists
const createTableQuery = `CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL
)`;
pool.query(createTableQuery, (err) => {
  if (err) {
      console.error("Table creation failed:", err);
  }
});

// Create Users Table if not exists
const createUsersTableQuery = `CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL,
  longitude DECIMAL(9,6) NOT NULL
)`;
pool.query(createUsersTableQuery, (err) => {
  if (err) {
      console.error("Users table creation failed:", err);
  }
});

//add Users
app.post('/users', (req, res) => {
  const { name, latitude, longitude } = req.body;
  const query = 'INSERT INTO users (name, latitude, longitude) VALUES (?, ?, ?)';
  pool.query(query, [name, latitude, longitude], (err, result) => {
      if (err) {
          return res.status(500).send(err);
      }
      res.send({ id: result.insertId, name, latitude, longitude });
  });
});



//Get schools list
app.get('/schools', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
      return res.status(400).send({ error: "User ID is required" });
  }

  const getUserLocationQuery = 'SELECT latitude, longitude FROM users WHERE id = ?';
  pool.query(getUserLocationQuery, [userId], (err, userResults) => {
      if (err) {
          return res.status(500).send(err);
      }
      if (userResults.length === 0) {
          return res.status(404).send({ error: "User not found" });
      }

      const { latitude, longitude } = userResults[0];

      const query = `
          SELECT *, 
          ( 
              6371 * acos( 
                  cos(radians(?)) * cos(radians(latitude)) * 
                  cos(radians(longitude) - radians(?)) + 
                  sin(radians(?)) * sin(radians(latitude)) 
              )
          ) AS distance 
          FROM schools 
          ORDER BY distance+0 ASC`;

      pool.query(query, [latitude, longitude, latitude], (err, results) => {
          if (err) {
              return res.status(500).send(err);
          }
          res.send(results);
      });
  });
});



// Post schools 
app.post('/schools', (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  pool.query(query, [name, address, latitude, longitude], (err, result) => {
      if (err) {
          return res.status(500).send(err);
      }
      res.send({ id: result.insertId, name, address, latitude, longitude });
  });
});







app.listen(port, () => {
    console.log("Server Started at http://localhost:3000");
  });
