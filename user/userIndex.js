const createError = require('http-errors'),
express = require('express'),
path = require('path'),
logger = require('morgan'),
mongoose = require('mongoose'),
port = parseInt(process.env.PORT, 10) || 3000
//impoorting the routers
const userRouter = require('./route/userRoute')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/bettapoint_test');

app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => console.log(`App started on port ${port}`));

module.exports = app;

