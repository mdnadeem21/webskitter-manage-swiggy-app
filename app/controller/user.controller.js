const User = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadFileOnCloudinary } = require("../utils/upload.file.on.cloudinary")

class UserController{
     getUserId  (req){
         req.user?._id || req.user?.id;
    } 

    createToken (user) {jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );}

async register(req, res) {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email, and password are required.' });
		}
		if (password.length < 8) {
			return res.status(400).json({ message: 'Password must be at least 8 characters.' });
		}

		const normalizedEmail = email.trim().toLowerCase();
		const existingUser = await User.findOne({ email: normalizedEmail });
		if (existingUser) return res.status(409).json({ message: 'An account with this email already exists.' });

        const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });
		
        if (req.file) {
            const cloudinaryResponse = await uploadFileOnCloudinary(req.file.path);
            user.profileImage = cloudinaryResponse.url; 
            await user.save();
      }
        return res.status(201).json({
			message: 'Registration successful.',
			token: createToken(user),
			user: { id: user._id, name: user.name, email: user.email },
		});
	} catch (error) {
		
		return res.status(500).json({ message: 'Unable to register user.', error:error.message });
	}
};

async login (req, res)  {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

		const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({ message: 'Invalid email or password.' });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({
			status: false,
			message: "Invalid email or password",
			});
		}
		const userToken = createToken(user);
		const hashedToken = await bcrypt.hash(userToken,10)
		user.refreshToken = hashedToken
		await user.save();

		 res.cookie("accessToken", userToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production", // Set to true in production
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
     	 });
		return res.status(200).json({
			message: 'Login successful.',
			token: hashedToken,
			user: { id: user._id, name: user.name, email: user.email },
		});
	} catch (error) {
		return res.status(500).json({ message: 'Unable to log in.' });
	}
};

async getProfile (req, res) {
	try {
		const user = await User.findById(getUserId(req)).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found.' });
		return res.status(200).json({ user });
	} catch (error) {
		return res.status(500).json({ message: 'Unable to retrieve profile.' });
	}
};

async updateProfile  (req, res) {
	try {
		const allowedFields = ['name', 'phone', 'address', 'profileImage'];
		const updates = {};
		for (const field of allowedFields) {
			if (req.body[field] !== undefined) updates[field] = req.body[field];
		}
		if (typeof updates.name === 'string') updates.name = updates.name.trim();
		if (!Object.keys(updates).length) return res.status(400).json({ message: 'No profile fields provided to update.' });

		const user = await User.findByIdAndUpdate(getUserId(req), { $set: updates }, {
			new: true,
			runValidators: true,
		}).select('-password');
		if (!user) return res.status(404).json({ message: 'User not found.' });
		return res.status(200).json({ message: 'Profile updated successfully.', user });
	} catch (error) {
		return res.status(500).json({ message: 'Unable to update profile.' });
	}
};

async changePassword (req, res) {
	try {
		const { currentPassword, newPassword } = req.body;
		if (!currentPassword || !newPassword) {
			return res.status(400).json({ message: 'Current and new passwords are required.' });
		}
		if (newPassword.length < 8) {
			return res.status(400).json({ message: 'New password must be at least 8 characters.' });
		}

		const user = await User.findById(getUserId(req)).select('+password');
		if (!user) return res.status(404).json({ message: 'User not found.' });
		if (!(await bcrypt.compare(currentPassword, user.password))) {
			return res.status(401).json({ message: 'Current password is incorrect.' });
		}
        const salt = await bcrypt.genSalt(10)
		user.password = await bcrypt.hash(newPassword, salt);
		await user.save();
		return res.status(200).json({ message: 'Password changed successfully.' });
	} catch (error) {
		return res.status(500).json({ message: 'Unable to change password.' });
	}
};

async deleteAccount  (req, res) {
	try {
		const user = await User.findByIdAndDelete(getUserId(req));
		if (!user) return res.status(404).json({ message: 'User not found.' });
		return res.status(200).json({ message: 'Account deleted successfully.' });
	} catch (error) {
		return res.status(500).json({ message: 'Unable to delete account.' });
	}
};
async logout(req,res){
	try {
		const userId = req.user?._id || req.user?.id;
		if (!userId) {
			return res.status(401).json({ message: 'Authentication required.' });
		}

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: 'User not found.' });

		user.refreshToken = null;
		await user.save();
		res.clearCookie('accessToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
		});

		return res.status(200).json({ message: 'Logout successful.' });
	} catch (error) {
		return res.status(500).json({ message: 'Unable to log out.' });
	}
}
}


module.exports = new UserController()
