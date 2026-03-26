const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({  
    name: {
        type: String,
        required: [ true, 'Name is required for creating a account'],  
    },
    email: {
        type: String,   
        required:[true, 'Email is required for creating a account'],
        trim: true,
        lowercase: true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Invalid email"],
        unique: [true, 'Email already exists']
    },
    password: {
        type: String,
        required: [true, 'Password is required for creating a account'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    systemUser : {
        type: Boolean,
        default: false,
        immutable: true,
        select: false 
    }
},{timestamps: true});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;


});

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model('user', userSchema);

module.exports = User;