import React from "react"
import { User, Code, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";

import LogoutButton from "./LogoutButton";



const Navbar = () => {

  const { authUser } = useAuthStore()
  // console.log("AUTH_USER", authUser)

  function getInitials(name = "") {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join("");
  }
  const initials = getInitials(authUser?.name);
  const hasImage = Boolean(authUser?.avatar);

  return (
    <nav className="sticky top-0 z-50 w-full py-5">
      <div className="flex w-full justify-between mx-auto max-w-4xl bg-black/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-gray-200/10 p-4 rounded-2xl">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <img src="/firecode.svg" alt="Firecode Logo" className="h-10 w-10" />
          <span className="text-lg md:text-2xl font-bold tracking-tight md:block ">
            Firecode
          </span>
        </Link>

        {/* User Profile and Dropdown / Auth Buttons */}
        <div className="flex items-center gap-4">
          {authUser ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar flex flex-row ">
                <div className="w-10 rounded-full ">
                  {hasImage ? (
                    <img
                      src={authUser.avatar}
                      alt={authUser.name} className="object-cover"
                      loading="lazy"
                    />) : (
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-md select-none">
                      {initials}
                    </div>
                  )}
                </div>

              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 space-y-3"
              >

                {/* Common Options */}
                <li>
                  <p className="text-base font-semibold">
                    {authUser?.name}
                  </p>
                  <hr className="border-gray-200/10" />
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="hover:bg-primary hover:text-white text-base font-semibold"
                  >
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </Link>
                </li>

                {/* Admin Option */}

                {authUser?.role === "ADMIN" && (
                  <li>
                    <Link
                      to="/add-problem"
                      className="hover:bg-primary hover:text-white text-base font-semibold"
                    >
                      <Code className="w-4 h-4 mr-1" />
                      Add Problem
                    </Link>
                  </li>
                )}
                <li>
                  <LogoutButton className="hover:bg-primary hover:text-white">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </LogoutButton>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="btn btn-ghost text-base font-semibold hover:bg-base-200"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary text-base font-semibold shadow-md shadow-primary/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
export default Navbar;