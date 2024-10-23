const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    userId: {  // Add userId field to link tasks with the user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    task: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,  // False means incomplete, true means complete
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
