// authUtils.ts
import axios from "axios";
import { AuthResponse } from "./types";



export async function verifyAuth(): Promise<AuthResponse> {
  const res = await axios.get<AuthResponse>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/checkAuth`
  );
  return res.data;
}