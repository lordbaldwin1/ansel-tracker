import { headers } from "next/headers"
import { auth } from "./auth"


export async function getUser() {
  return await auth.api.getSession({
    headers: await headers()
  })
}