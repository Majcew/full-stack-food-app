import { config } from "dotenv";
import express, { Application, NextFunction, Request, Response } from "express";
import User from "./model/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

require("./config/database").connect();
config();

const app: Application = express();

app.use(express.json());

app.post("/register", async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, username, password } = req.body;

    if (!(first_name && last_name && username && password)) {
      res
        .status(400)
        .send("All input elements are required to create a new user");
    }

    // Check if user exists by this username.
    const user = await User.findOne({ username });

    if (user) {
      return res.status(400).send("User under this username already exists");
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      first_name,
      last_name,
      username,
      password: encryptedPassword,
    });

    const token = jwt.sign(
      {
        user_id: user._id,
        username,
      },
      process.env.TOKEN_SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    user.token = token;

    res.status(201).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Login
app.post("/login", (req: Request, res: Response) => {
  // our login logic goes here
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
