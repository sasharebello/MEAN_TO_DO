// const API_URL = 'https://sasha-mean-to-do-joqs9.ondigitalocean.app'; // Use your live URL here

document.getElementById('showLogin').addEventListener('click', () => {
    document.getElementById('loginFormContainer').style.display = 'block';
    document.getElementById('registerFormContainer').style.display = 'none';
});

document.getElementById('showRegister').addEventListener('click', () => {
    document.getElementById('registerFormContainer').style.display = 'block';
    document.getElementById('loginFormContainer').style.display = 'none';
});

// Handle registration form submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch('https://sasha-mean-to-do-joqs9.ondigitalocean.app/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (response.ok) {
            alert('Registration successful! You can now log in.');
            document.getElementById('showLogin').click();
        } else {
            const errorData = await response.json();
            alert(`Registration failed: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error during registration:', error);
    }
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('https://sasha-mean-to-do-joqs9.ondigitalocean.app/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            alert('Login successful!');
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('todo-section').style.display = 'block';
            fetchTasks();
        } else {
            const errorData = await response.json();
            alert(`Login failed: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});

// Handle adding a new task
document.getElementById('add-task-btn').addEventListener('click', async () => {
    const task = document.getElementById('new-task').value;
    const token = localStorage.getItem('token');

    if (!task) {
        alert('Please enter a task.');
        return;
    }

    try {
        const response = await fetch('https://sasha-mean-to-do-joqs9.ondigitalocean.app/api/todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ task }),
        });

        if (response.ok) {
            const newTask = await response.json();
            addTaskToUI(newTask);
            document.getElementById('new-task').value = '';
        } else {
            const errorData = await response.json();
            alert(`Failed to add task: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error adding task:', error);
    }
});

// Function to add a new task to the UI
function addTaskToUI(task) {
    const taskList = document.getElementById('task-list');
    const li = document.createElement('li');
    li.innerHTML = `
        ${task.task} 
        <button class="complete-task-btn" data-id="${task._id}" ${task.status ? 'disabled' : ''}>Mark as Complete</button>
        <button class="delete-task-btn" data-id="${task._id}">Delete</button>
    `;
    if (task.status) {
        li.style.textDecoration = 'line-through';
    }
    taskList.appendChild(li);

    // Add event listeners for the new buttons
    li.querySelector('.complete-task-btn').addEventListener('click', markTaskComplete);
    li.querySelector('.delete-task-btn').addEventListener('click', deleteTask);
}

async function fetchTasks() {
    const token = localStorage.getItem('token');
    console.log('Fetching tasks with token:', token);  // Check if the token is present

    try {
        const response = await fetch('https://sasha-mean-to-do-joqs9.ondigitalocean.app/api/todos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);  // Log the response status
        if (response.ok) {
            const tasks = await response.json();
            console.log('Tasks fetched:', tasks);  // Log the fetched tasks
            displayTasks(tasks);
        } else {
            const errorData = await response.json();
            console.error('Error fetching tasks:', errorData.message);
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Function to display tasks in the UI
function displayTasks(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.innerHTML = `
            ${task.task} 
            <button class="complete-task-btn" data-id="${task._id}" ${task.status ? 'disabled' : ''}>Mark as Complete</button>
            <button class="delete-task-btn" data-id="${task._id}">Delete</button>
        `;
        if (task.status) {
            taskItem.style.textDecoration = 'line-through';
        }
        taskList.appendChild(taskItem);
    });

    // Add event listeners for task actions
    document.querySelectorAll('.complete-task-btn').forEach(button => {
        button.addEventListener('click', markTaskComplete);
    });

    document.querySelectorAll('.delete-task-btn').forEach(button => {
        button.addEventListener('click', deleteTask);
    });
}

// Handle task completion (strikethrough the task and trigger confetti)
async function markTaskComplete(e) {
    const taskId = e.target.dataset.id;
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`https://sasha-mean-to-do-joqs9.ondigitalocean.app/api/todo/${taskId}/complete`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        if (response.ok) {
            const taskItem = e.target.parentElement;
            taskItem.style.textDecoration = 'line-through';
            taskItem.querySelector('.complete-task-btn').disabled = true;

            // Trigger confetti after task is completed
            triggerConfetti();
        } else {
            alert('Failed to complete task.');
        }
    } catch (error) {
        console.error('Error completing task:', error);
    }
}

// Function to trigger confetti
function triggerConfetti() {
    confetti({
        particleCount: 100,  // Adjust particle count for more or less confetti
        spread: 70,          // Spread out the confetti particles
        origin: { y: 0.6 },  // Confetti starts at the middle of the screen
    });
}


// Handle task deletion
async function deleteTask(e) {
    const taskId = e.target.dataset.id;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`https://sasha-mean-to-do-joqs9.ondigitalocean.app/api/todo/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (response.ok) {
            alert('Task deleted!');
            location.reload();
        } else {
            alert('Failed to delete task.');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Check token on page load and display tasks if logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        fetchTasks();
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('todo-section').style.display = 'block';
    }
});

// // Handle logout
// document.getElementById('logout-btn').addEventListener('click', () => {
//     localStorage.removeItem('token');
//     document.getElementById('auth-section').style.display = 'block';
//     document.getElementById('todo-section').style.display = 'none';
//     alert('You have logged out!');
// });


// Handle logout
document.getElementById('logout-btn').addEventListener('click', () => {
    // Remove the token from local storage
    localStorage.removeItem('token');

    // Hide the login, register, and todo sections
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('registerFormContainer').style.display = 'none';
    document.getElementById('todo-section').style.display = 'none';

    // Show the "home" page where the user can choose login or register
    document.getElementById('auth-section').style.display = 'block';

    // Optionally, clear any tasks from the UI
    document.getElementById('task-list').innerHTML = '';

    // Give a logout alert
    alert('You have logged out!');
});

