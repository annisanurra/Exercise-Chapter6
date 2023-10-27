const express = require('express');
const userRoutes = require('./routes/users.routes');
const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = app;
