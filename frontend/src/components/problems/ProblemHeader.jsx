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
  Loader2,
} from "lucide-react";
import LogoutButton from "../LogoutButton";
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

const ProblemHeader = ({
  problem,
  prevProblem,
  nextProblem,
  handlePrevProblem,
  handleNextProblem,
  handleRandomProblem,
  handleRunCode,
  handleSubmitCode,
  isRunning,
  isSubmitting,
  isExecuting,
  isBookmarked,
  setIsBookmarked,
  authUser,
  initials,
  setIsAuthModalOpen,
}) => {
  const isAnyExecuting = isRunning || isSubmitting || isExecuting;
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
          disabled={isAnyExecuting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333] hover:bg-[#444] border border-neutral-700 rounded-md text-xs font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 text-neutral-400 fill-current" />
          )}
          <span>Run</span>
        </button>

        <button
          onClick={handleSubmitCode}
          disabled={isAnyExecuting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2cbb5d] hover:bg-[#229647] rounded-md text-xs font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Submit</span>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className={`h-7 w-7 rounded-full p-0 ${isBookmarked ? "text-primary hover:text-primary" : "text-neutral-400 hover:text-white"}`}
          onClick={() => setIsBookmarked(!isBookmarked)}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
        </Button>
        
        <button className="text-neutral-400 hover:text-white hover:bg-neutral-800 p-1 rounded transition-colors">
          <Share2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-neutral-700"></div>

        {authUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full ring-1 ring-neutral-700 hover:ring-primary/40 transition-all p-0"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={authUser.avatar} alt={authUser.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5 shadow-xl border-border bg-popover">
              <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground px-2 py-1.5">
                {authUser.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer text-sm py-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              {authUser?.role === "ADMIN" && (
                <DropdownMenuItem asChild>
                  <Link to="/add-problem" className="flex items-center gap-2 cursor-pointer text-sm py-2">
                    <Code2 className="w-4 h-4 text-muted-foreground" />
                    <span>Add Problem</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <LogoutButton
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-sm px-2 py-2 h-auto"
                >
                  Logout
                </LogoutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
