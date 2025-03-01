import mongoose from "mongoose";
import { z } from 'zod';

export const signUpValidationSchema = z.object({
  firstName: z.string().min(2, "First name should have at least 2 characters"),
  lastName: z.string().min(2, "Last name should have at least 2 characters"),
  password: z.string().min(6, "Password should have at least 6 characters"),
  email: z.string().email("Invalid email address")
});

export const loginValidationSchema = z.object({
  password: z.string().min(6, "Password should have at least 6 characters"),
  email: z.string().email("Invalid email address")
});

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		role: {
			type: String,
            required: true,
			default: "customer",
			enum: ["customer", "admin"]
		},
		
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
