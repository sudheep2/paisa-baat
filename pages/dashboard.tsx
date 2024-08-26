import { useEffect, useState } from "react";
import axios from "axios";
import DashboardComponent from "../components/Dashboard";

axios.defaults.withCredentials = true;

interface User {
  name: string;
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    axios
      .get<User>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/details`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Failed to load user details", err));
  }, []);

  return (
    <div>
      {user && (
        <div>
          <p>Welcome, {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      )}
      <div>
        <h2>Your Bounties</h2>
        <DashboardComponent />;
      </div>
    </div>
  );
}
