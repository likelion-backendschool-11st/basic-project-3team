const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');
const ErrorCode = require('./utils/errorCode');

const app = express();

app.use(express.json());
// Refresh Token 쿠키를 읽는다 (docs/auth.md)
app.use(cookieParser());

app.use('/api', routes);

app.use((req, res, next) => {
  next(new AppError(ErrorCode.API_NOT_FOUND));
});

app.use(errorHandler);

if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  app.listen(port, () => {
    console.log(`Dev in API server listening on port ${port}`);
  });
}

module.exports = app;
