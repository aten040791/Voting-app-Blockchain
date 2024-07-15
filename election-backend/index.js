const express = require('express');
const db = require('./db-connect');
var cors = require('cors');
const bodyParser = require('body-parser');
const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.get('/candidates', (req, res) => {
  // Query all rows from the candidates table
  db.all('SELECT * FROM person', [], (err, rows) => {
    if (err) {
        throw err;
    }
    return res.status(200).json({
      success: true,
      data: rows,
      message: 'ok'
    })
  });
})

app.post('/login', (req, res) => {
  const {username ,password} = req.body
  // Query all rows from the candidates table
  db.get(`SELECT * FROM users WHERE username = '${username}' AND password='${password}'`, [], (err, row) => {
    if (err) {
        throw err;
    }
    if (!row) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'ok'
      })
    }
    return res.status(200).json({
      success: true,
      data: row,
      message: 'ok'
    })
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})