import { useEffect, useState } from "react";
import axios from "axios";
import DashboardComponent from "../components/Dashboard";
import { Button } from "@/components/ui/button" 
import { useRouter } from "next/router";

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

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logout`);
      router.push("/"); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"> {/* Main container */}
      {user && (
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-xl mr-4"> 
              {user.name.charAt(0).toUpperCase()} {/* Display initial */}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
            Logout
          </button>
        </div>
      )}
      <div>
        <DashboardComponent />
      </div>
    </div>
  );
}
