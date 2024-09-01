import { useEffect, useState } from "react";
import axios from "axios";
import DashboardComponent from "../components/Dashboard";
import { Button } from "@/components/ui/button" 
import { useRouter } from "next/router";
import Header from "@/components/Header";

axios.defaults.withCredentials = true;

interface User {
  name: string;
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    axios
      .get<User>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/details`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Failed to load user details", err));
  }, []);


  return (
    <div className="dark:bg-gray-900">
      <Header /> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="dark:text-gray-200">
          <DashboardComponent />
        </div>
      </div>
    </div>
  );
}
