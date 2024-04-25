const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const logger       = require('morgan');
const timeout      = require('connect-timeout');
const cors         = require('cors');

const indexRouter     = require('./routes/index');
const usersRouter     = require('./routes/users');
const questionsRouter = require('./routes/questions');
const formsRouter     = require('./routes/forms');

const app = express();
app.use(cors());

app.options('/*', (_, res) => {

    res.sendStatus(200);

});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(timeout('5s'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/questions', questionsRouter);
app.use('/forms', formsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {

    next(createError(404));

});
  
// error handler, set locals, only providing error in development
app.use(function(err, req, res, next) {

    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    // res.render('error');
    res.send(err);

});
  
module.exports = app;
