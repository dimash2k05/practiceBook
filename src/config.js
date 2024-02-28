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

const collection = new mongoose.model("users", LoginSchema);

module.exports = collection;
