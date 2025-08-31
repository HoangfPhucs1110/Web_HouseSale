import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";


export const test = (req, res) => {
    res.json({
        message: 'appi ',
    });
};

// export  const updateUser =async(req,res,next)=>{
//     if(req.user.id !==req.params.id) return next(errorHandler(401,"bạn chỉ có thể update tài khoản mà bạn sở hữu!"))
//         try{
//             if(req.body.password){
//                 req.body.password = bcrypt.hashSync(req.body.password, 10);
//             }

//         const updateUser = await User.findByIdAndUpdate(req.params.id,{
//             $set:{
//                 username:   req.body.username,
//                 email:      req.body.email,
//                 password: req.body.password,
//                 avatar: req.body.avatar,
//             }
//         },{new: true})

//         const {password, ...rest}=updateUser._doc
//         res.status(200).json({ rest });

//         }catch(error){
//             next(error)
//         }
// };



export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) return next(errorHandler(401, "bạn chỉ có thể update tài khoản mà bạn sở hữu!"));
  try {
    // Nếu có avatar là link Google thì upload lên Cloudinary
    let avatarUrl = req.body.avatar;
    if (avatarUrl && avatarUrl.includes('googleusercontent.com')) {
      const uploadResult = await cloudinary.v2.uploader.upload(avatarUrl, {
        folder: 'avatars',
        fetch_format: 'auto',
        quality: 'auto',
      });
      avatarUrl = uploadResult.secure_url;
    }

    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    const updateUser = await User.findByIdAndUpdate(req.params.id, {
      $set: {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        avatar: avatarUrl || req.body.avatar,
      }
    }, { new: true });

    const { password, ...rest } = updateUser._doc;
    res.status(200).json({ rest });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
    if (req.user.id !== req.params.id) return next(errorHandler(401, "Bạn chỉ có thể xóa tài khoản của mình!"));
    try {
        await User.findByIdAndDelete(req.params.id);
        res.clearCookie("access_token");
        res.status(200).json({ message: "Tài khoản đã được xóa thành công" });
    } catch (error) {
        next(error);
    }
};

export const getUserListings = async (req, res, next) => {
    if (req.user.id === req.params.id) {
      try {
        const listings = await Listing.find({ userRef: req.params.id });
        res.status(200).json(listings);
      } catch (error) {
        next(error);
      }
    } else {
      return next(errorHandler(401, 'Bạn chỉ có thể xem bài đăng của mình!'));
    }
  };
  
  export const getUser = async (req, res, next) => {
    try {
      
      const user = await User.findById(req.params.id);
    
      if (!user) return next(errorHandler(404, 'Không tìm thấy tài khoản!'));
    
      const { password: pass, ...rest } = user._doc;
    
      res.status(200).json(rest);
    } catch (error) {
      next(error);
    }
  };