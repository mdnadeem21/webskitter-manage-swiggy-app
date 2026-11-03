
const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    profileImage:{
        type:String,
        default:'default-image.jpg'
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['user','admin','owner'],
        default:'user'
    },
    refreshToken:{
        type:String,
        default:null
    }
},{timestamps:true});

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRE,
    }
  );
};
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        name: this.name,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRE,
      }
    );
  };
const User=mongoose.model('manage-swiggy-user',UserSchema);

module.exports=User;