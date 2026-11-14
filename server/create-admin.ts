import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { db } from "./db.js";
const rl = createInterface({ input: stdin, output: stdout });
try {
  const email = (await rl.question("Administrator email: "))
    .trim()
    .toLowerCase();
  const name = (await rl.question("Administrator name: ")).trim();
  // Read password from environment so it is never echoed by readline or saved in source.
  const password = process.env.ADMIN_PASSWORD;
  if (!email.includes("@") || !name || !password || password.length < 14)
    throw new Error(
      "Provide a valid email, name and ADMIN_PASSWORD of at least 14 characters in the process environment.",
    );
  await db.user.create({
    data: {
      email,
      name,
      role: "admin",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  console.log(
    "Administrator created. Clear ADMIN_PASSWORD from the environment.",
  );
} finally {
  rl.close();
  await db.$disconnect();
}
