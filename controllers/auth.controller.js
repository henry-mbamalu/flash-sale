import User, { loginValidationSchema, signUpValidationSchema } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/apiResonse.js";


export const signUpAdmin = async (req, res, next) => {
	try {

		const { firstName, lastName, email, password } = signUpValidationSchema.parse(
			req.body
		)

		const user = await User.findOne({ email });

		if (user) {
			return sendErrorResponse(res, 400, "Email already exists");
		}

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);


		const newUser = new User({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			role: "admin"
		});

		if (newUser) {
			// Generate JWT token here
			const token = generateToken(newUser._id);
			await newUser.save();

			return sendSuccessResponse(res, 201, {
				_id: newUser._id,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				email: newUser.email,
				role: newUser.role,
				token
			},
				"User created successfully");

		} else {
			return sendErrorResponse(res, 400, "Invalid user data" );
		}
	} catch (error) {
		next(error);
	}
}

export const signUp = async (req, res, next) => {
	try {

		const { firstName, lastName, email, password } = signUpValidationSchema.parse(
			req.body
		);


		const user = await User.findOne({ email });

		if (user) {
			return sendErrorResponse(res, 400, "Email already exists" );
		}

		// HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);


		const newUser = new User({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			role: "customer"
		});

		if (newUser) {
			// Generate JWT token here
			const token = generateToken(newUser._id);
			await newUser.save();

			return sendSuccessResponse(res, 201, {
				_id: newUser._id,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				email: newUser.email,
				role: newUser.role,
				token
			},
			 "User created successfully");
		} else {
			return sendErrorResponse(res, 400, "Invalid user data");
		}
	} catch (error) {
		next(error);
	}
}

export const signIn = async (req, res, next) => {
	try {
		const { email, password } = loginValidationSchema.parse(req.body);
		const user = await User.findOne({ email });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ status: "failed", error: "Invalid email or password" });
		}
		const token = generateToken(user._id, res);	

		return sendSuccessResponse(res, 200, {
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			role: user.role,
			token
		},
		 "Logged in successfully");
	} catch (error) {
		next(error);
	}
}

