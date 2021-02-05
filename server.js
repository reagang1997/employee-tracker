const express = require('express');
const mysql = require('mysql');
const inquirer = require('inquirer');

const app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
const PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'reagan01',
    database: 'emp_trackerdb',
  });
  
  connection.connect((err) => {
    if (err) {
      console.error(`error connecting: ${err.stack}`);
      return;
    }
  
    console.log(`connected as id ${connection.threadId}`);
  });