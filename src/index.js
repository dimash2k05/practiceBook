const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb+srv://dimachine:VImvqU2005@cluster0.pir3qph.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

connect.then(() => {
    console.log("Database connected successfully");
})
.catch(() => {
    console.log("Database cannot be connected");
});

const LoginSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    publicationYear: {
        type: String,
        required: true
    },
    quantityAvailable: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    }
});

const User = new mongoose.model("users", LoginSchema);
const Book = new mongoose.model("books", BookSchema);

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(session({
    secret: "I am the best",
    resave: false,
    saveUninitialized: false
}));

const loginRequired = (req, res, next) => {
    if (!req.session.username) {
        return res.status(401).redirect('/login');
    }
    next();
}

app.get("/", loginRequired, async (req, res) => {
    const books = await Book.find();
    res.render("home", {books, username: req.session.username});
})

app.get("/profile", loginRequired, async (req, res) => {

})

app.get('/logout', async (req, res) => {
    req.session.username = "";
    res.redirect('/login');
})

app.get("/login", async (req, res) => {
    if (req.session.username) {
        res.redirect('/');
        return;
    }
    res.render("login");
})

app.get("/signup", async (req, res) => {
    if (req.session.username) {
        const LoggedIn = true;
        res.redirect('/', {LoggedIn});
        return;
    }
    res.render("signup");
})

app.post("/signup", async (req, res) => {
    const data = {
        username: req.body.username,
        password: req.body.password
    }

    const existingUser = await User.findOne({username: data.username});

    if (existingUser) {
        res.send("User already exists. Please choose a different username.");
    } 
    else {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;
        const userdata = await User.insertMany(data);
        req.session.username = data.username;
        res.redirect('/');
    }
})

app.post("/login", async (req, res) => {
    try {
        const check = await User.findOne({username: req.body.username});
        console.log(check.password);
        if (!check) {
            res.send("Username cannot be found");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            req.session.username = check.username;
            res.redirect('/');
        }
        else {
            res.send("Wrong username or password");
        }
    } catch {
        res.send("Wrong username or password");
    }
})

app.get('/create', loginRequired, async (req, res) => {
    res.render('createBook');
});

app.post('/create', async (req, res) => {
    const {title, author, genre, publicationYear, quantityAvailable, price} = req.body;
    const newBook = new Book({
        title: title,
        author: author,
        genre: genre,
        publicationYear: publicationYear,
        quantityAvailable: quantityAvailable,
        price: price
    });
    await newBook.save();
    res.redirect(`/${newBook._id}`);
});

app.get('/:bookId', async (req, res) => {
    const bookId = req.params.bookId;
    const book = await Book.findById(bookId);
    if (!book) {
        return res.send("No book found");
    }
    res.render('viewBook', {book});
});

app.post('/update/:bookId', async (req, res) => {
    const bookId = req.params.bookId;
    const {title, author, genre, publicationYear, quantityAvailable, price} = req.body;
    const updatedBook = await Book.findByIdAndUpdate(BookId, {title, author, genre, publicationYear, quantityAvailable, price}, { new: true });
    res.redirect(`/post/${updatedBook._id}`);
});

app.post('/delete/:bookId', async (req, res) => {
    const postId = req.params.postId;
    const deletedPost = await Post.findByIdAndDelete(postId);
    res.redirect('/');
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});