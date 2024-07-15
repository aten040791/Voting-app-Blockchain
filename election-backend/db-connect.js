const sqlite3 = require('sqlite3').verbose();

// Connect to the database
let db = new sqlite3.Database('./candidates.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the candidates.db SQlite database.');
});

module.exports = db