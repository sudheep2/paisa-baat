import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { ModeToggle } from "./ModeToggle";

interface User {
  name: string;
  email: string;
}

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  useEffect(() => {
    axios
      .get<User>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/details`)
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Failed to load user details", err);
        router.push("/");
      });
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
    <header className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <NavigationMenu>
      <NavigationMenuList className="flex items-center">
        <NavigationMenuItem>
            <Link href="/dashboard" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Dashboard
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/updateWallet" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Wallet
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
      </NavigationMenuList>
      </NavigationMenu>
      <ModeToggle />
        {user && (
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold text-lg mr-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center">
              <h2 className="text-base font-medium mr-2">{user.name}</h2>
              <p className="text-gray-600 text-xs ml-2">{user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ml-4"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;