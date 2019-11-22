import 'babel-polyfill';

import app from './index'; // The express app we just created

const port = parseInt(process.env.PORT, 10) || 8000;

app.listen(port, () => console.log(`App started on port ${port}`));

module.exports = app;