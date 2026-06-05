import { auth } from "../src/lib/better-auth/auth"

async function main() {
  const user = await auth.api.signUpEmail({
    body: {
      name: "Admin",
      email: "admin@example.com",
      password: "password123",
    },
  })

  console.log("User created:", user)
}

main().catch(console.error)
