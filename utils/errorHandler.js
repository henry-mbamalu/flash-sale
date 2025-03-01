import {z} from "zod"
import { sendErrorResponse } from "./apiResonse.js";

export const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging

 
    if (err instanceof z.ZodError) {
        return sendErrorResponse(res, 400, "Validation failed", err.errors);
      }
  
      return sendErrorResponse(res, 500, "Internal server error");
};