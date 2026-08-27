import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { createUser, findUserByEmail, type UserRecord } from "./db/users.js";

const JWT_EXPIRES = "7d";

type PublicUser = { id: string; email: string; name: string };

function toPublic(user: UserRecord): PublicUser {
  return { id: user.id, email: user.email, name: user.name };
}

function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505",
  );
}

const router = Router();

router.post("/register", async (req, res, next) => {
  const { email, password, name } = req.body as Partial<{
    email: string;
    password: string;
    name: string;
  }>;

  const normalizedEmail = email?.toLowerCase().trim();
  const normalizedName = name?.trim();
  if (!normalizedEmail || !password || !normalizedName) {
    res.status(400).json({ error: "Email, password and name are required" });
    return;
  }
  if (password.length < 6 || password.length > 128) {
    res.status(400).json({ error: "Password must contain 6 to 128 characters" });
    return;
  }
  if (normalizedEmail.length > 254 || normalizedName.length > 100) {
    res.status(400).json({ error: "Email or name is too long" });
    return;
  }

  try {
    if (await findUserByEmail(normalizedEmail)) {
      res.status(409).json({ error: "Email is already in use" });
      return;
    }

    const user = await createUser({
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      name: normalizedName,
    });
    const publicUser = toPublic(user);
    const token = jwt.sign(publicUser, config.jwtSecret, { expiresIn: JWT_EXPIRES });
    res.status(201).json({ token, user: publicUser });
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "Email is already in use" });
      return;
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body as Partial<{
    email: string;
    password: string;
  }>;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const publicUser = toPublic(user);
    const token = jwt.sign(publicUser, config.jwtSecret, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: publicUser });
  } catch (error) {
    next(error);
  }
});

router.get("/me", (req, res) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(
      authorization.slice(7),
      config.jwtSecret,
    ) as PublicUser;
    res.json({ id: payload.id, email: payload.email, name: payload.name });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;
