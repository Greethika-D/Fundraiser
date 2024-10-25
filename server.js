const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 3019;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/students', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once('open', () => {
    console.log("MongoDB connection successful");
});

// Define the user schema and model for users
const userSchema = new mongoose.Schema({
    regd_no: String,
    name: String,
    email: String,
    branch: String,
    password: String // Add password field for user authentication
});

const Users = mongoose.model("User", userSchema);

// Define the fund request schema and model
const fundRequestSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    delivery_date: Date,
    address: String,
    Fundss: [String],
    payment_type: String
});

const FundRequests = mongoose.model("FundRequest", fundRequestSchema);

// Serve the form.html file when navigating to the root URL
app.get('/', (req, res) => {
    console.log("Serving form.html");
    res.sendFile(path.join(__dirname, 'form.html'));
});

// Handle form submission from form.html
app.post('/post', async (req, res) => {
    const { regd_no, name, email, branch } = req.body;
    const user = new Users({
        regd_no,
        name,
        email,
        branch
    });
    await user.save();
    console.log("User saved:", user);
    res.send("Form submitted successfully");
});

// Handle form submission from app.html
app.post('/app_post', async (req, res) => {
    const { name, email, password, delivery_date, address, Fundss, payment_type } = req.body;

    // Log the received data
    console.log("Received data from app.html:", { name, email, password, delivery_date, address, Fundss, payment_type });

    // Create a new fund request
    const fundRequest = new FundRequests({
        name,
        email,
        password,
        delivery_date,
        address,
        Fundss: Fundss ? Array.isArray(Fundss) ? Fundss : [Fundss] : [],
        payment_type
    });

    try {
        await fundRequest.save(); // Save to the database
        console.log("Fund request saved:", fundRequest);
        res.send("Fund request submitted successfully");
    } catch (error) {
        console.error("Error saving fund request:", error);
        res.status(500).send("Error submitting fund request");
    }
});

// Handle sign-in form submission from SignIn.html
app.post('/signin_post', async (req, res) => {
    const { email, password } = req.body;

    // Log the received data
    console.log("Received sign-in data:", { email, password });

    // Simple user authentication (this should be improved for production use)
    const user = await Users.findOne({ email, password });
    if (user) {
        console.log("User signed in:", user);
        res.redirect('/'); // Redirect to form.html after successful sign-in
    } else {
        console.log("Sign-in failed for email:", email);
        res.status(401).send("Invalid email or password");
    }
});

// Handle sign-up form submission from SignUp.html
app.post('/signup_post', async (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    // Check if passwords match
    if (password !== confirm_password) {
        return res.status(400).send("Passwords do not match");
    }

    // Check if user already exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
        return res.status(400).send("User already exists");
    }

    // Create a new user
    const user = new Users({
        name,
        email,
        password // Consider hashing this password before saving
    });

    try {
        await user.save();
        console.log("User registered:", user);
        res.redirect('/'); // Redirect to form.html after successful sign-up
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Error during sign-up");
    }
});

// Serve the funds.html file when navigating to /funds
app.get('/funds', (req, res) => {
    console.log("Serving funds.html");
    res.sendFile(path.join(__dirname, 'funds.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
