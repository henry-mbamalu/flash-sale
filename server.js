import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js"
import flashSalesRoutes from "./routes/flashSale.routes.js"
import purchasesRoutes from "./routes/purchase.routes.js"
import connectToMongoDB from "./db/connectToMongoDB.js";
import { errorHandler } from "./utils/errorHandler.js";
import cron from "node-cron";
import { updateFlashSaleStatus } from "./utils/updateFlashSaleStatus.js";
import User from "./models/user.model.js";
import bcrypt from "bcryptjs";


dotenv.config();
const app = express();
const port = process.env.PORT || 5000



app.use(express.json()); // to parse the incoming requests with JSON payloads (from req.body)

app.use("/api/auth", authRoutes);
app.use("/api/flash-sale", flashSalesRoutes);
app.use("/api/purchase", purchasesRoutes);

app.use(errorHandler);



app.listen(port, async () => {
    connectToMongoDB();
    // Run the cron job every minute
    cron.schedule("* * * * *", updateFlashSaleStatus);

    const user = await User.findOne({ email: "admin@gmail.com" });

    if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("123456", salt);

        const newUser = new User({
            firstName: "Admin",
            lastName: "Admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            role: "admin"
        });

        if (newUser) {
            await newUser.save();
        }
    }

    console.log(`app running on port ${port}`);

})