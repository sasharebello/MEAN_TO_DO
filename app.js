require('dotenv').config();
const express = require('express');

const path = require('path');
const cors = require('cors');
const mongoose = require('./config');
const apiRoutes = require('./routes/api.routes');

const app = express();
// app.get('/',(req,res)=>{
//     res.send("hello world!");
// })

app.use(cors());
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'new-frontend')));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'new-frontend', 'index.html'));
});

app.use('/api', apiRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
// __dirname + '/new-frontend/index.html'