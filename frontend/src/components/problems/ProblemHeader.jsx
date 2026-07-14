import React from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Send,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Home,
  Users,
  Code2,
} from "lucide-react";
import LogoutButton from "../LogoutButton";

const ProblemHeader = ({
  problem,
  prevProblem,
  nextProblem,
  handlePrevProblem,
  handleNextProblem,
  handleRandomProblem,
  handleRunCode,
  handleSubmitCode,
  isExecuting,
  isBookmarked,
  setIsBookmarked,
  authUser,
  initials,
  setIsAuthModalOpen,
}) => {
  return (
    <header className="bg-[#282828] border-b border-[#3e3e3e] px-4 h-12 flex items-center justify-between flex-shrink-0 z-20 select-none">
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <Link to={"/"} className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors">
          <img src="/firecode.svg" alt="Firecode Logo" className="h-6 w-6" />
          <span className="font-bold text-sm tracking-tight hidden sm:inline">Firecode</span>
        </Link>
        
        <div className="w-px h-5 bg-neutral-700 hidden sm:block"></div>

        <div className="flex items-center gap-1">
          <Link to="/" className="flex items-center gap-1 hover:text-white text-neutral-400 text-xs transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Problem List</span>
          </Link>
          
          <div className="flex items-center ml-2 border border-neutral-700 rounded bg-[#202020] px-0.5 py-0.5">
            <button
              disabled={!prevProblem}
              onClick={handlePrevProblem}
              className="p-0.5 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!nextProblem}
              onClick={handleNextProblem}
              className="p-0.5 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleRandomProblem}
            className="p-1.5 ml-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors tooltip tooltip-bottom"
            data-tip="Random Problem"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Exec Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleRunCode}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333] hover:bg-[#444] border border-neutral-700 rounded-md text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isExecuting ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Play className="w-3.5 h-3.5 text-neutral-400 fill-current" />
          )}
          <span>Run</span>
        </button>

        <button
          onClick={handleSubmitCode}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2cbb5d] hover:bg-[#229647] rounded-md text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isExecuting ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Submit</span>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <button
          className={`btn btn-ghost btn-xs btn-circle ${isBookmarked ? "text-[#ffa116]" : "text-neutral-400 hover:text-white"}`}
          onClick={() => setIsBookmarked(!isBookmarked)}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
        </button>
        
        <button className="text-neutral-400 hover:text-white hover:bg-neutral-800 p-1 rounded transition-colors">
          <Share2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-neutral-700"></div>

        {authUser ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar flex items-center justify-center w-8 h-8 min-h-8">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-neutral-700">
                {authUser.avatar ? (
                  <img src={authUser.avatar} alt={authUser.name} className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-[#ffa116] text-black flex items-center justify-center font-bold text-xs">
                    {initials}
                  </div>
                )}
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[100] p-2 bg-[#282828] border border-neutral-800 rounded-box w-52 shadow-xl space-y-2 text-white"
            >
              <li className="px-3 py-1">
                <span className="font-semibold text-xs text-neutral-400">{authUser.name}</span>
              </li>
              <hr className="border-neutral-800" />
              <li>
                <Link to="/profile" className="hover:bg-neutral-800 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
              </li>
              {authUser?.role === "ADMIN" && (
                <li>
                  <Link to="/add-problem" className="hover:bg-neutral-800 py-2">
                    <Code2 className="w-4 h-4 mr-2" />
                    Add Problem
                  </Link>
                </li>
              )}
              <li>
                <LogoutButton className="hover:bg-neutral-800 py-2 text-red-400 w-full text-left">
                  Logout
                </LogoutButton>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-neutral-400 hover:text-white text-xs font-semibold"
            >
              Log In
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/20 px-3 py-1 rounded text-xs font-bold hover:bg-[#ffa116]/20 transition-all cursor-pointer"
            >
              Premium
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default ProblemHeader;
