require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Todo = require('../models/todo.model');
const authMiddleware = require('../middleware/auth');

// User Registration
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new To-Do item
router.post('/todo', authMiddleware, async (req, res) => {
    const { task } = req.body;
    try {
        const newTodo = new Todo({
            userId: req.user.id,  // Ensure that the user's ID is being used
            task,
            status: false,  // Initially mark task as incomplete
        });
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Get all To-Do items for the logged-in user
router.get('/todos', authMiddleware, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user.id });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a To-Do item
router.put('/todo/:id', authMiddleware, async (req, res) => {
    const { task } = req.body;

    try {
        const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, { task }, { new: true });
        if (!updatedTodo) return res.status(404).json({ message: 'Task not found' });

        res.json(updatedTodo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// // Mark a task as complete
// router.put('/todo/:id/complete', authMiddleware, async (req, res) => {
//     try {
//         const completedTask = await Todo.findByIdAndUpdate(req.params.id, { status: 'complete' }, { new: true });
//         if (!completedTask) return res.status(404).json({ message: 'Task not found' });

//         res.json(completedTask);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });
router.put('/todo/:id/complete', authMiddleware, async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { status: true },  // Set task status to true for completed
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(updatedTodo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a To-Do item
router.delete('/todo/:id', authMiddleware, async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
        if (!deletedTodo) return res.status(404).json({ message: 'Task not found' });

        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
