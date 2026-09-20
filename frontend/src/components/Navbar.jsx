import React from "react"
import { User, Code, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

const Navbar = () => {
  const { authUser } = useAuthStore();

  function getInitials(name = "") {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join("");
  }
  const initials = getInitials(authUser?.name);

  return (
    <nav className="sticky top-0 z-50 w-full py-5">
      <div className="flex w-full justify-between mx-auto max-w-4xl bg-black/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-gray-200/10 p-4 rounded-2xl">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <img src="/firecode.svg" alt="Firecode Logo" className="h-10 w-10" />
          <span className="text-lg md:text-2xl font-bold tracking-tight md:block">
            Firecode
          </span>
        </Link>

        {/* User Profile and Dropdown / Auth Buttons */}
        <div className="flex items-center gap-4">
          {authUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all p-0"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={authUser.avatar} alt={authUser.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border-border bg-popover">
                <DropdownMenuLabel className="font-semibold text-sm px-2 py-1.5 text-foreground">
                  {authUser?.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 cursor-pointer font-medium text-sm py-2"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>

                {/* Admin Option */}
                {authUser?.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/add-problem"
                      className="flex items-center gap-2 cursor-pointer font-medium text-sm py-2"
                    >
                      <Code className="w-4 h-4 text-muted-foreground" />
                      <span>Add Problem</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <LogoutButton
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 font-medium text-sm px-2 py-2 h-auto"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </LogoutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-sm md:text-base font-semibold">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="text-sm md:text-base font-semibold shadow-md shadow-primary/20">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;