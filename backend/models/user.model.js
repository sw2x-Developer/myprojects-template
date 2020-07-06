const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

function isUsername(value){
    return value.length > 2 ? true : false;
}

function CheckPassword(value){
    let passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    if(value.match(passw)){
        return true;
    }else{
        return false;
    }
}

let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate: value => {
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email address');
            }
        }
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate: value => {
            if(!isUsername(value)){
                throw new Error('Invalid username length');
            }
        }
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 8,
        validate: value => {
            if(!CheckPassword(value)){
                throw new Error('password is too weak');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});


UserSchema.pre('save' , async function(next) {
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(use.password , 8);
    }
});

UserSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: user.id} , process.env.JWT_KEY);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

UserSchema.statics.findByCredentials = async (email , password) => {
    const user = await User.findOne({email});
    if(!user){
        throw new Error({error : 'Invalid login credentials'});
    }
    const isPasswordMatch = await bcrypt.compare(password , user.password);
    if(!isPasswordMatch){
        throw new Error({error : 'Invalid login credentials'});
    }
    return user;
}


let User = mongoose.model('User' , UserSchema);
module.exports = User;