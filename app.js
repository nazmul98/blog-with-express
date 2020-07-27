const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session'); 
const flash = require('connect-flash');
const config = require('config');
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();

const setRoutes = require('./routes/routes')

// Import Middlewa
const { bindUserWithRequest } = require('./middleware/bindUseriWithRequest');
const setLocals = require('./middleware/setLocals');

const app = express();

// View Enngine Setup
app.set('view engine', 'ejs');
app.set('views', 'views');

// Required Info
const PORT = process.env.PORT || 8000;
const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.tamdy.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

// Connect MongoDB Session Store
const store = new MongoDBStore({
    uri: uri,
    collection: 'auth_sessions',
    expires: 1000 * 60 * 60 * 2
});

// Middlewares
const middlewares = [
    morgan('dev'),
    express.static('public'),
    express.urlencoded({ extended: true }),
    express.json(),
    session({
        secret: process.env.SECRET_KEY || "blog_express",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7200000 // 2hour
        },
        store: store
    }),
    bindUserWithRequest(),
    setLocals(), 
    flash()
]
app.use(middlewares)

// Using Route from Routes directory
setRoutes(app);

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        app.listen(PORT, () => console.log("Server is Running at Port " + PORT));
    })
    .catch(err => {
        console.log(err);
    })

