import React, { useState, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
    Play,
    FileText,
    MessageSquare,
    Lightbulb,
    Bookmark,
    Share2,
    Clock,
    ChevronLeft,
    ChevronRight,
    Shuffle,
    BookOpen,
    Terminal,
    Code2,
    Users,
    ThumbsUp,
    Home,
    Send,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Plus
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";

import { useProblemStore } from "../store/useProblemStore";
import { useExecutionStore } from "../store/useExecutionStore";
import { usesubmissionStore } from "../store/useSubmissionStore";
import { useAuthStore } from "../store/useAuthStore";

import { getLanguageIdByName } from "../lib/getLanguage";
import SubmissionResults from "../components/SubmissionResults";
import SubmissionsList from "../components/SubmissionsList";
import LogoutButton from "../components/LogoutButton";

const ProblemPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { getProblemById, problem, getAllProblems, problems } = useProblemStore();
    const [code, setCode] = useState("");
    const [activeTab, setActiveTab] = useState("description");
    const [consoleTab, setConsoleTab] = useState("testcase");
    const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT");
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [testCases, setTestCases] = useState([]);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Resizable split widths
    const [leftWidth, setLeftWidth] = useState(50); // percentage for vertical split
    const [editorHeight, setEditorHeight] = useState(65); // percentage for horizontal split on right

    // Console testcase tracking
    const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
    const [activeResultCaseIndex, setActiveResultCaseIndex] = useState(0);

    const { executeCode, submitCode, clearSubmission, submission, isExecuting } = useExecutionStore();
    const { authUser } = useAuthStore();

    const { 
        isSubmissionLoading, 
        submission: submissions, 
        submissionCount, 
        getSubmissionForProblem, 
        getSubmissionCountForProblem 
    } = usesubmissionStore();

    // Fetch all problems once to allow Prev / Next navigation
    useEffect(() => {
        getAllProblems();
    }, [getAllProblems]);

    // Problem lists navigation calculations
    const currentIndex = problems.findIndex((p) => p.id === id || p._id === id);
    const prevProblem = currentIndex > 0 ? problems[currentIndex - 1] : null;
    const nextProblem = currentIndex < problems.length - 1 ? problems[currentIndex + 1] : null;

    const handlePrevProblem = () => {
        if (prevProblem) {
            navigate(`/problem/${prevProblem.id}`);
        }
    };

    const handleNextProblem = () => {
        if (nextProblem) {
            navigate(`/problem/${nextProblem.id}`);
        }
    };

    const handleRandomProblem = () => {
        if (problems.length > 0) {
            const randomIndex = Math.floor(Math.random() * problems.length);
            const randomProb = problems[randomIndex];
            navigate(`/problem/${randomProb.id}`);
        }
    };

    const handleRunCode = async (e) => {
        e.preventDefault();
        setConsoleTab("result"); // Auto-switch to test result tab
        try {
            const language_id = getLanguageIdByName(selectedLanguage);
            const stdin = testCases.map(tc => tc.input);
            const expected_outputs = testCases.map(tc => tc.output);

            // Wait for Judge0 stateless execution
            await executeCode(code, language_id, stdin, expected_outputs, id);

            // Refresh real submissions if logged in
            if (authUser) {
                await getSubmissionForProblem(id);
            }
            await getSubmissionCountForProblem(id);
        } catch (err) {
            console.error("Error executing code", err);
        }
    };

    const handleSubmitCode = async (e) => {
        e.preventDefault();

        if (!authUser) {
            setIsAuthModalOpen(true);
            return;
        }

        setConsoleTab("result"); // Auto-switch to test result tab
        try {
            const language_id = getLanguageIdByName(selectedLanguage);
            const stdin = problem.testCases.map(tc => tc.input);
            const expected_outputs = problem.testCases.map(tc => tc.output);

            await submitCode(code, language_id, stdin, expected_outputs, id);

            // Refresh submissions
            await getSubmissionForProblem(id);
            await getSubmissionCountForProblem(id);
        } catch (err) {
            console.error("Error submitting code", err);
        }
    };

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setSelectedLanguage(lang);
        setCode(problem.codeSnippets?.[lang] || "");
    };

    const handleResetCode = () => {
        if (window.confirm("Are you sure you want to reset your code template to default?")) {
            setCode(problem.codeSnippets?.[selectedLanguage] || "");
        }
    };

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: "", output: "" }]);
        setActiveTestCaseIndex(testCases.length);
    };

    // Vertical Resizer dragging handler
    const handleVerticalMouseDown = (e) => {
        e.preventDefault();
        const handleMouseMove = (moveEvent) => {
            const percentage = (moveEvent.clientX / window.innerWidth) * 100;
            if (percentage > 25 && percentage < 75) {
                setLeftWidth(percentage);
            }
        };
        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    // Horizontal Resizer dragging handler
    const handleHorizontalMouseDown = (e) => {
        e.preventDefault();
        const container = document.getElementById("right-container");
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const handleMouseMove = (moveEvent) => {
            const relativeY = moveEvent.clientY - rect.top;
            const percentage = (relativeY / rect.height) * 100;
            if (percentage > 20 && percentage < 85) {
                setEditorHeight(percentage);
            }
        };
        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "description":
                return (
                    <div className="prose max-w-none text-neutral-300 select-text">
                        <div className="flex items-center gap-2 mb-4 mt-2">
                            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                                problem.difficulty === "EASY"
                                    ? "bg-[#2cbb5d]/10 text-[#2cbb5d]"
                                    : problem.difficulty === "MEDIUM"
                                    ? "bg-[#feb800]/10 text-[#feb800]"
                                    : "bg-[#ef4743]/10 text-[#ef4743]"
                            }`}>
                                {problem.difficulty}
                            </span>
                            {problem.tags && problem.tags.map((tag, i) => (
                                <span key={i} className="bg-[#2c2c2c] text-neutral-400 px-2.5 py-0.5 rounded text-xs font-semibold border border-neutral-800">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <p className="text-sm leading-relaxed mb-6 font-normal text-neutral-200">
                            {problem.description}
                        </p>

                        {problem.examples && (
                            <div className="mt-8 space-y-6">
                                <h3 className="text-sm font-semibold mb-4 text-neutral-300">Examples:</h3>
                                {Object.entries(problem.examples).map(([key, example], index) => (
                                    <div key={key} className="mb-6">
                                        <p className="font-semibold text-xs mb-2 text-neutral-400">Example {index + 1}:</p>
                                        <div className="bg-[#282828] p-4 rounded-lg font-mono text-xs leading-relaxed border border-[#3e3e3e] select-text">
                                            <div>
                                                <span className="text-[#ffa116] font-semibold">Input: </span>
                                                <span className="text-neutral-200">{example.input}</span>
                                            </div>
                                            <div className="mt-1.5">
                                                <span className="text-[#ffa116] font-semibold">Output: </span>
                                                <span className="text-neutral-200">{example.output}</span>
                                            </div>
                                            {example.explanation && (
                                                <div className="mt-2 text-neutral-400">
                                                    <span className="text-neutral-300 font-semibold">Explanation: </span>
                                                    {example.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {problem.constraints && (
                            <div className="mt-8 border-t border-neutral-800 pt-6">
                                <h3 className="text-sm font-semibold mb-3 text-neutral-300">Constraints:</h3>
                                <ul className="list-disc list-inside space-y-2 text-xs text-neutral-400 font-mono">
                                    {problem.constraints.split("\n").map((constraint, idx) => (
                                        <li key={idx} className="list-none flex items-start gap-2">
                                            <span className="text-[#ffa116] mt-0.5">•</span>
                                            <code className="bg-[#282828] px-2 py-0.5 rounded border border-[#3e3e3e] text-neutral-300">
                                                {constraint}
                                            </code>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            case "submissions":
                if (!authUser) {
                    return (
                        <div className="p-8 text-center text-neutral-500 flex flex-col items-center gap-3">
                            <Users className="w-12 h-12 text-neutral-700" />
                            <p className="text-sm">Please sign in to view your submission history.</p>
                            <button onClick={() => setIsAuthModalOpen(true)} className="btn btn-primary btn-sm mt-2">
                                Sign In
                            </button>
                        </div>
                    );
                }
                return (
                    <div className="overflow-y-auto max-h-full p-2">
                        <SubmissionsList submissions={submissions} isSubmissionLoading={isSubmissionLoading} />
                    </div>
                );

            case "discussion":
                return <div className="p-8 text-center text-neutral-500 text-sm">No discussions yet</div>;
            case "hints":
                return (
                    <div className="p-2">
                        {problem?.hints ? (
                            <div className="bg-[#282828] border border-[#3e3e3e] p-5 rounded-xl">
                                <span className="font-semibold text-xs text-[#ffa116] block mb-2 uppercase tracking-wider">Hint</span>
                                <p className="text-sm text-neutral-300 leading-relaxed font-mono">
                                    {problem.hints}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center text-neutral-500 text-sm mt-8">No hints available</div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    useEffect(() => {
        getProblemById(id);
        getSubmissionCountForProblem(id);
        clearSubmission();
    }, [id, getProblemById, getSubmissionCountForProblem, clearSubmission]);

    useEffect(() => {
        if (problem) {
            setCode(problem.codeSnippets?.[selectedLanguage] || "");

            setTestCases(
                problem.testCases.map((tc) => ({
                    input: tc.input,
                    output: tc.output
                })) || []
            );
            setActiveTestCaseIndex(0);
            setActiveResultCaseIndex(0);
        }
    }, [problem, selectedLanguage]);

    const fetchSubmissions = useCallback(() => {
        if (activeTab === "submissions" && id && authUser) {
            getSubmissionForProblem(id);
        }
    }, [activeTab, id, getSubmissionForProblem, authUser]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    function getInitials(name = "") {
        return name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(word => word[0].toUpperCase())
            .join("");
    }
    const initials = authUser ? getInitials(authUser.name) : "";

    return problem && (
        <div className="h-screen w-screen bg-[#1a1a1a] text-gray-200 flex flex-col overflow-hidden select-none font-sans">
            
            {/* LEETCODE STYLE NAVBAR */}
            <header className="bg-[#282828] border-b border-[#3e3e3e] px-4 h-12 flex items-center justify-between flex-shrink-0 z-20">
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
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333] hover:bg-[#444] border border-neutral-700 rounded-md text-xs font-semibold text-white transition-colors disabled:opacity-50"
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
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2cbb5d] hover:bg-[#229647] rounded-md text-xs font-semibold text-white transition-colors disabled:opacity-50"
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

            {/* WORKSPACE PANELS */}
            <main className="flex-1 flex flex-row overflow-hidden w-full relative">
                
                {/* LEFT PANEL: Problem description / Submissions tabs */}
                <section
                    style={{ width: `${leftWidth}%` }}
                    className="h-full flex flex-col overflow-hidden bg-[#1e1e1e] border-r border-[#282828]"
                >
                    {/* Tabs Header */}
                    <div className="flex items-center bg-[#282828] border-b border-[#3e3e3e] px-2 h-10 select-none flex-shrink-0">
                        <button
                            className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-full border-t-2 ${
                                activeTab === "description"
                                    ? "text-white border-[#ffa116] bg-[#1e1e1e]"
                                    : "text-neutral-400 hover:text-white border-transparent"
                            }`}
                            onClick={() => setActiveTab("description")}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Description
                        </button>
                        <button
                            className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-full border-t-2 ${
                                activeTab === "submissions"
                                    ? "text-white border-[#ffa116] bg-[#1e1e1e]"
                                    : "text-neutral-400 hover:text-white border-transparent"
                            }`}
                            onClick={() => setActiveTab("submissions")}
                        >
                            <Code2 className="w-3.5 h-3.5" />
                            Submissions
                            {submissionCount > 0 && (
                                <span className="bg-[#3a3a3a] text-neutral-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                                    {submissionCount}
                                </span>
                            )}
                        </button>
                        <button
                            className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-full border-t-2 ${
                                activeTab === "discussion"
                                    ? "text-white border-[#ffa116] bg-[#1e1e1e]"
                                    : "text-neutral-400 hover:text-white border-transparent"
                            }`}
                            onClick={() => setActiveTab("discussion")}
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Discussion
                        </button>
                        <button
                            className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-full border-t-2 ${
                                activeTab === "hints"
                                    ? "text-white border-[#ffa116] bg-[#1e1e1e]"
                                    : "text-neutral-400 hover:text-white border-transparent"
                            }`}
                            onClick={() => setActiveTab("hints")}
                        >
                            <Lightbulb className="w-3.5 h-3.5" />
                            Hints
                        </button>
                    </div>

                    {/* Tab Body */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin select-text">
                        {/* Title Header */}
                        {activeTab === "description" && (
                            <h2 className="text-xl font-bold mb-2 text-white">{problem.title}</h2>
                        )}
                        {renderTabContent()}
                    </div>
                </section>

                {/* VERTICAL DRAG RESIZER */}
                <div
                    className="w-1 bg-[#282828] hover:bg-[#ffa116] active:bg-[#ffa116] cursor-col-resize h-full transition-colors flex-shrink-0 relative z-10"
                    onMouseDown={handleVerticalMouseDown}
                >
                    <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize"></div>
                </div>

                {/* RIGHT PANEL: Code Editor & Console split */}
                <section
                    id="right-container"
                    style={{ width: `${100 - leftWidth}%` }}
                    className="h-full flex flex-col overflow-hidden"
                >
                    {/* Top half: Monaco Editor */}
                    <div
                        style={{ height: `${editorHeight}%` }}
                        className="w-full flex flex-col overflow-hidden bg-[#1e1e1e]"
                    >
                        {/* Editor Header Toolbar */}
                        <div className="flex items-center justify-between bg-[#282828] border-b border-[#3e3e3e] px-4 h-10 select-none flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                                    <Code2 className="w-3.5 h-3.5 text-neutral-400" />
                                    Editor
                                </span>
                                <select
                                    className="bg-[#333] border border-neutral-700 rounded px-2.5 py-1 text-xs text-white font-medium cursor-pointer focus:outline-none hover:bg-[#3e3e3e] transition-colors"
                                    value={selectedLanguage}
                                    onChange={handleLanguageChange}
                                >
                                    {Object.keys(problem.codeSnippets || {}).map((lang) => (
                                        <option key={lang} value={lang}>
                                            {lang}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleResetCode}
                                    className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors tooltip tooltip-bottom"
                                    data-tip="Reset default code"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Editor Content Area */}
                        <div className="flex-1 w-full relative bg-[#1e1e1e]">
                            <Editor
                                height={"100%"}
                                language={selectedLanguage.toLowerCase()}
                                defaultValue={problem.codeSnippets?.[selectedLanguage] || ""}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || "")}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 15,
                                    lineNumbers: "on",
                                    roundedSelection: false,
                                    scrollBeyondLastLine: false,
                                    readOnly: false,
                                    automaticLayout: true,
                                }}
                            />
                        </div>

                        {/* Auth Required banner at bottom of editor */}
                        {!authUser && (
                            <div className="bg-[#2c1d11] border-t border-[#f08c3a]/20 text-[#f08c3a] text-xs px-4 py-2 flex items-center justify-between flex-shrink-0">
                                <span>You need to log in or sign up to run or submit solutions.</span>
                                <button onClick={() => setIsAuthModalOpen(true)} className="underline hover:text-[#f39c12] font-semibold">
                                    Log In
                                </button>
                            </div>
                        )}
                    </div>

                    {/* HORIZONTAL DRAG RESIZER */}
                    <div
                        className="h-1 bg-[#282828] hover:bg-[#ffa116] active:bg-[#ffa116] cursor-row-resize w-full transition-colors flex-shrink-0 relative z-10"
                        onMouseDown={handleHorizontalMouseDown}
                    >
                        <div className="absolute inset-x-0 -top-1 -bottom-1 cursor-row-resize"></div>
                    </div>

                    {/* Bottom half: Testcase / Test Result console */}
                    <div
                        style={{ height: `${100 - editorHeight}%` }}
                        className="w-full flex flex-col overflow-hidden bg-[#1e1e1e]"
                    >
                        {/* Console Headers */}
                        <div className="flex items-center justify-between bg-[#282828] border-b border-[#3e3e3e] px-4 h-10 select-none flex-shrink-0">
                            <div className="flex items-center gap-1 h-full">
                                <button
                                    className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-full border-b-2 ${
                                        consoleTab === "testcase"
                                            ? "text-white border-[#ffa116] bg-[#1e1e1e]"
                                            : "text-neutral-400 hover:text-white border-transparent"
                                    }`}
                                    onClick={() => setConsoleTab("testcase")}
                                >
                                    <Terminal className="w-3.5 h-3.5" />
                                    Testcase
                                </button>
                                <button
                                    className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-full border-b-2 ${
                                        consoleTab === "result"
                                            ? "text-white border-[#ffa116] bg-[#1e1e1e]"
                                            : "text-neutral-400 hover:text-white border-transparent"
                                    }`}
                                    onClick={() => setConsoleTab("result")}
                                >
                                    <Play className="w-3.5 h-3.5 text-emerald-500 fill-current" />
                                    Test Result
                                </button>
                            </div>
                        </div>

                        {/* Console Content */}
                        <div className="flex-1 overflow-y-auto p-5 bg-[#1e1e1e]">
                            {consoleTab === "testcase" ? (
                                <div className="space-y-4 h-full flex flex-col select-text">
                                    {/* Testcase Tabs */}
                                    <div className="flex flex-wrap gap-2 items-center mb-1 select-none">
                                        {testCases.map((tc, index) => (
                                            <button
                                                key={index}
                                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                                    activeTestCaseIndex === index
                                                        ? "bg-[#2a2a2a] text-white border-neutral-700"
                                                        : "bg-transparent text-neutral-400 border-transparent hover:text-white"
                                                }`}
                                                onClick={() => setActiveTestCaseIndex(index)}
                                            >
                                                Case {index + 1}
                                            </button>
                                        ))}

                                        <button
                                            onClick={handleAddTestCase}
                                            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Testcase Input fields */}
                                    {testCases[activeTestCaseIndex] ? (
                                        <div className="space-y-4 flex-1">
                                            <div>
                                                <div className="text-neutral-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Input</div>
                                                <textarea
                                                    className="w-full bg-[#2a2a2a] text-white font-mono text-xs p-3.5 rounded-lg border border-neutral-800 focus:outline-none focus:border-neutral-700 select-text"
                                                    rows={3}
                                                    value={testCases[activeTestCaseIndex].input}
                                                    onChange={(e) => {
                                                        const newTestCases = [...testCases];
                                                        newTestCases[activeTestCaseIndex].input = e.target.value;
                                                        setTestCases(newTestCases);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <div className="text-neutral-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Expected Output</div>
                                                <textarea
                                                    className="w-full bg-[#2a2a2a] text-white font-mono text-xs p-3.5 rounded-lg border border-neutral-800 focus:outline-none focus:border-neutral-700 select-text"
                                                    rows={1}
                                                    value={testCases[activeTestCaseIndex].output}
                                                    onChange={(e) => {
                                                        const newTestCases = [...testCases];
                                                        newTestCases[activeTestCaseIndex].output = e.target.value;
                                                        setTestCases(newTestCases);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-neutral-500 text-xs text-center py-6">No testcases. Click + to add one.</div>
                                    )}
                                </div>
                            ) : (
                                /* Test Result Tab */
                                <div className="h-full select-text">
                                    {isExecuting ? (
                                        <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-3 py-6">
                                            <span className="loading loading-spinner loading-md text-[#ffa116]"></span>
                                            <span className="text-xs font-semibold animate-pulse tracking-wide">Executing code against test cases...</span>
                                        </div>
                                    ) : submission ? (
                                        <div className="flex flex-col h-full gap-4 text-sm">
                                            {/* Summary stats */}
                                            <div className="flex flex-wrap items-center gap-6 bg-[#282828] border border-neutral-800 p-4 rounded-xl flex-shrink-0">
                                                <div>
                                                    <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Status</span>
                                                    <span className={`text-base font-bold ${
                                                        submission.status === "Accepted" ? "text-[#2cbb5d]" : "text-[#ef4743]"
                                                    }`}>
                                                        {submission.status}
                                                    </span>
                                                </div>
                                                <div className="w-px h-8 bg-neutral-800 hidden sm:block"></div>
                                                <div>
                                                    <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Success Rate</span>
                                                    <span className="text-neutral-200 font-bold text-sm">
                                                        {((submission.testCases?.filter(t => t.passed).length / (submission.testCases?.length || 1)) * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="w-px h-8 bg-neutral-800 hidden sm:block"></div>
                                                <div>
                                                    <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Avg Runtime</span>
                                                    <span className="text-neutral-200 font-bold text-sm">
                                                        {(JSON.parse(submission.time || "[]").map(t => parseFloat(t)).reduce((a, b) => a + b, 0) / (JSON.parse(submission.time || "[]").length || 1)).toFixed(3)} s
                                                    </span>
                                                </div>
                                                <div className="w-px h-8 bg-neutral-800 hidden sm:block"></div>
                                                <div>
                                                    <span className="text-neutral-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Avg Memory</span>
                                                    <span className="text-neutral-200 font-bold text-sm">
                                                        {(JSON.parse(submission.memory || "[]").map(m => parseFloat(m)).reduce((a, b) => a + b, 0) / (JSON.parse(submission.memory || "[]").length || 1)).toFixed(0)} KB
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Results detailed tabs */}
                                            <div className="flex-1 flex flex-col overflow-hidden min-h-[180px]">
                                                <div className="flex flex-wrap gap-2 items-center mb-3 select-none">
                                                    {submission.testCases?.map((tc, index) => (
                                                        <button
                                                            key={index}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                                                                activeResultCaseIndex === index
                                                                    ? tc.passed
                                                                        ? "bg-[#2cbb5d]/10 text-[#2cbb5d] border-[#2cbb5d]/30"
                                                                        : "bg-[#ef4743]/10 text-[#ef4743] border-[#ef4743]/30"
                                                                    : "bg-transparent text-neutral-400 border-transparent hover:text-white"
                                                            }`}
                                                            onClick={() => setActiveResultCaseIndex(index)}
                                                        >
                                                            <span className={`w-1.5 h-1.5 rounded-full ${tc.passed ? "bg-[#2cbb5d]" : "bg-[#ef4743]"}`}></span>
                                                            Case {index + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                {submission.testCases?.[activeResultCaseIndex] && (
                                                    <div className="flex-1 overflow-y-auto space-y-4">
                                                        {/* Individual case status alert */}
                                                        <div className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                                                            submission.testCases[activeResultCaseIndex].passed 
                                                                ? "bg-[#2cbb5d]/10 text-[#2cbb5d] border border-[#2cbb5d]/20" 
                                                                : "bg-[#ef4743]/10 text-[#ef4743] border border-[#ef4743]/20"
                                                        }`}>
                                                            {submission.testCases[activeResultCaseIndex].passed ? (
                                                                <>
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                    <span>Passed test case {activeResultCaseIndex + 1}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className="w-4 h-4" />
                                                                    <span>Failed test case {activeResultCaseIndex + 1}</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Output block display */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div>
                                                                <span className="text-neutral-400 text-xs font-semibold block mb-1">Input</span>
                                                                <div className="bg-[#2a2a2a] p-3 rounded-lg border border-neutral-800 font-mono text-xs text-neutral-300 min-h-[60px] max-h-[150px] overflow-y-auto select-text">
                                                                    {testCases[activeResultCaseIndex]?.input || "N/A"}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-neutral-400 text-xs font-semibold block mb-1">Your Output</span>
                                                                <div className={`bg-[#2a2a2a] p-3 rounded-lg border border-neutral-800 font-mono text-xs min-h-[60px] max-h-[150px] overflow-y-auto select-text ${
                                                                    submission.testCases[activeResultCaseIndex].passed ? "text-neutral-300" : "text-neutral-300 font-semibold"
                                                                }`}>
                                                                    {submission.testCases[activeResultCaseIndex].stdout || "null"}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-neutral-400 text-xs font-semibold block mb-1">Expected Output</span>
                                                                <div className="bg-[#2a2a2a] p-3 rounded-lg border border-neutral-800 font-mono text-xs text-neutral-300 min-h-[60px] max-h-[150px] overflow-y-auto select-text">
                                                                    {submission.testCases[activeResultCaseIndex].expected || "null"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2 py-6">
                                            <Play className="w-9 h-9 opacity-40 text-neutral-400" />
                                            <span className="text-xs">Run or Submit your solution to see test results.</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* AUTH gate modal */}
            {isAuthModalOpen && (
                <div className="modal modal-open backdrop-blur-md bg-black/60 transition-all duration-300">
                    <div className="modal-box border border-primary/20 bg-[#1e1e1e] text-white shadow-2xl rounded-2xl max-w-md relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ffa116]/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>

                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-neutral-400 hover:text-white"
                            onClick={() => setIsAuthModalOpen(false)}
                        >
                            ✕
                        </button>
                        
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="bg-[#ffa116]/10 p-4 rounded-full mb-4 animate-bounce">
                                <Code2 className="w-12 h-12 text-[#ffa116]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Join FireCode</h3>
                            <p className="text-neutral-400 text-sm mb-6">
                                Sign up or log in to submit your solution, verify all test cases, track your coding stats, and join the leaderboard!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                                <Link
                                    to="/login"
                                    state={{ from: `/problem/${id}` }}
                                    className="btn btn-primary flex-1 shadow-lg shadow-primary/20"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    state={{ from: `/problem/${id}` }}
                                    className="btn btn-outline btn-secondary flex-1"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProblemPage;