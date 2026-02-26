const express = require("express");
const app = express(); // ✅ Initialize Express
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require("path");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // ✅ Serve static files
// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "8096", // Add your MySQL password
    database: "user_auth"
});
db.connect((err) => {
    if (err) {
        console.error("Database connection error:", err);
        return;
    }
    console.log("Connected to MySQL Database.");
});
// User Registration Route
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
console.log("Received Registration Data:", username, email, password); // Debugging
    if (!username || !email || !password) {
        return res.status(400).send("All fields are required!");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) {
            console.error("Error inserting data into MySQL:", err);
            return res.status(500).send("Database error!");
        }
        console.log("User registered successfully!");
        res.send("Registration Successful!");
    });
});
// User Login Route with Redirection
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Received Login Data:", email, password); // Debugging
    if (!email || !password) {
        return res.status(400).send("All fields are required!");
    }
const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).send("Database error!");
        }
        if (results.length === 0) {
            return res.status(401).send("User not found!");
        }
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log("Login successful! Redirecting...");
            res.sendFile(path.join(__dirname, "weather-frame-division.html")); // ✅ Redirects user
        } else {
            res.status(401).send("Invalid credentials!");
        }
    });
});
// Start Server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
