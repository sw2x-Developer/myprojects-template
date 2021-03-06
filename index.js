const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const MONGOURI = process.env.MONGOURI || "";

app.use(cors());
app.use(helmet());
app.disable('etag');
app.use(express.json());
app.use(express.urlencoded({extended : false}));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too many requests",
    headers: false
});
app.use(limiter);

if(MONGOURI != ""){
    mongoose.connect(MONGOURI , {useNewUrlParser: true , useUnifiedTopology: true , useCreateIndex: true});
    const connection = mongoose.connection;
    connection.once('open' , () => {
        console.log('MongoDB Database connection established successfully');
    });
}else{
    console.log("Please add MongoDB URI in .env file");
}

const userRouter = require('./backend/routes/user');
app.use('/users' , userRouter);


app.listen(port , () => console.log(`Magic is running on port: ${port}`));