import { auth } from "../src/lib/better-auth/auth";

async function main() {
  const user = await auth.api.createUser({
    body: {
      name: "Admin",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    },
  });

  console.log("User created:", user);
}

main().catch(console.error);
