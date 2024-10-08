import routes from './routes/index';

const express = require('express');

const app = express();
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
