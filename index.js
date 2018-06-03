const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const COOKIE_SECRET = 'cookie secret';

const db = new Sequelize('sql7240372', 'sql7240372', 'uDqPbpqsRH', {
    host: 'sql7.freemysqlhosting.net',
    dialect: 'mysql'
});

const Post = db.define('post', {
    title: { type: Sequelize.STRING },
    question: { type: Sequelize.TEXT },
    createdAt: {type: Sequelize.DATE},
    resolvedAt: { type: Sequelize.DATE}
});    

const User = db.define('user', {
    email: { type: Sequelize.STRING },
    lastname: { type: Sequelize.STRING },
    firstname: { type: Sequelize.STRING },
    mdp: { type: Sequelize.TEXT },
    role : { type: Sequelize.ENUM('ADMIN', 'USER' ), defaultValue: 'USER' }
});

passport.use(new LocalStrategy((email, mdp, cb) => {
    User
        .findOne({
            where: {
                email: email,
                mdp: mdp
            }
        })
        .then((user) => {
            if (user){
                cb(null, user);
            } else {
                cb(null, false);
            }
        });
}));


passport.serializeUser((user, cb) => {
    cb(null, user.email);
});

passport.deserializeUser((email, cb) => {
    User
        .findOne({
            where: {
                email: email
            }
        })
        .then((user) => {
            cb(null, user);
        });
});

const app = express();

app.use(express.static("public"));
app.set('view engine', 'pug');
app.use(cookieParser(COOKIE_SECRET));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

db.sync();

app.get('/', (req, res) => {
    Post
        .findAll()
        .then((posts) => {
            res.render('index', { posts });
        });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/inscription', (req, res) => {
    User
    .findAll()
    .then((users) => {
        res.render('inscription', { users:users });
    });
});

app.get('/post/:id', (req, res) => {
    Post.findById(req.params.id)
        .then((post) => {
            res.render('post', {post:post});
        }) 
});

app.post('/', (req, res) => {
    const { title, question } = req.body;
    Post
        .sync()
        .then(() => Post.create({ title, question }))
        .then(() => res.redirect('/'));
});

app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));


app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
app.get('/liste-question', (req, res) => {
    res.render('liste-question');
});

app.post('/inscription', (req, res) => {
    const { email, mdp, firstname, lastname } = req.body;
        User
            .sync()
            .then(() => User.create({ email, mdp, firstname, lastname, role }))
            .then(() => res.redirect('/'));
    });

app.listen(3000, () => {
    console.log('Listening on port 3000');
});