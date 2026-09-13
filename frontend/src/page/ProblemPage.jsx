import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { useProblemStore } from "../store/useProblemStore";
import { useExecutionStore } from "../store/useExecutionStore";
import { usesubmissionStore } from "../store/useSubmissionStore";
import { useAuthStore } from "../store/useAuthStore";

import { getLanguageIdByName } from "../lib/getLanguage";
import ProblemHeader from "../components/problems/ProblemHeader";
import ProblemDescription from "../components/problems/ProblemDescription";
import CodeEditor from "../components/problems/CodeEditor";
import ConsolePanel from "../components/problems/ConsolePanel";

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

    const { executeCode, submitCode, clearSubmission, submission, isExecuting, isRunning, isSubmitting } = useExecutionStore();
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

    useEffect(() => {
        getProblemById(id);
        getSubmissionCountForProblem(id);
        if (authUser) {
            getSubmissionForProblem(id);
        }
        clearSubmission();
    }, [id, getProblemById, getSubmissionCountForProblem, clearSubmission, authUser, getSubmissionForProblem]);

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
            <ProblemHeader
                problem={problem}
                prevProblem={prevProblem}
                nextProblem={nextProblem}
                handlePrevProblem={handlePrevProblem}
                handleNextProblem={handleNextProblem}
                handleRandomProblem={handleRandomProblem}
                handleRunCode={handleRunCode}
                handleSubmitCode={handleSubmitCode}
                isRunning={isRunning}
                isSubmitting={isSubmitting}
                isExecuting={isExecuting}
                isBookmarked={isBookmarked}
                setIsBookmarked={setIsBookmarked}
                authUser={authUser}
                initials={initials}
                setIsAuthModalOpen={setIsAuthModalOpen}
            />

            {/* WORKSPACE PANELS */}
            <main className="flex-1 flex flex-row overflow-hidden w-full relative">
                
                {/* LEFT PANEL: Problem description / Submissions tabs */}
                <section
                    style={{ width: `${leftWidth}%` }}
                    className="h-full flex flex-col overflow-hidden bg-[#1e1e1e]"
                >
                    <ProblemDescription
                        problem={problem}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        submissionCount={submissionCount}
                        submissions={submissions}
                        isSubmissionLoading={isSubmissionLoading}
                        authUser={authUser}
                        setIsAuthModalOpen={setIsAuthModalOpen}
                        id={id}
                    />
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
                        <CodeEditor
                            selectedLanguage={selectedLanguage}
                            handleLanguageChange={handleLanguageChange}
                            code={code}
                            setCode={setCode}
                            problem={problem}
                            handleResetCode={handleResetCode}
                            authUser={authUser}
                            setIsAuthModalOpen={setIsAuthModalOpen}
                        />
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
                        <ConsolePanel
                            consoleTab={consoleTab}
                            setConsoleTab={setConsoleTab}
                            testCases={testCases}
                            setTestCases={setTestCases}
                            activeTestCaseIndex={activeTestCaseIndex}
                            setActiveTestCaseIndex={setActiveTestCaseIndex}
                            activeResultCaseIndex={activeResultCaseIndex}
                            setActiveResultCaseIndex={setActiveResultCaseIndex}
                            isExecuting={isExecuting}
                            submission={submission}
                            handleAddTestCase={handleAddTestCase}
                        />
                    </div>
                </section>
            </main>

            {/* AUTH gate modal */}
            <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                <DialogContent className="sm:max-w-md bg-card text-card-foreground border-primary/20">
                    <div className="flex flex-col items-center text-center p-2">
                        <div className="bg-primary/10 p-4 rounded-full mb-4 animate-bounce">
                            <Code2 className="w-10 h-10 text-primary" />
                        </div>
                        <DialogHeader className="space-y-2 text-center">
                            <DialogTitle className="text-2xl font-bold text-center">Join FireCode</DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm text-center">
                                Sign up or log in to submit your solution, verify all test cases, track your coding stats, and join the leaderboard!
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-6">
                            <Button
                                asChild
                                className="flex-1 shadow-lg shadow-primary/20"
                            >
                                <Link
                                    to="/login"
                                    state={{ from: `/problem/${id}` }}
                                >
                                    Log In
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                asChild
                                className="flex-1"
                            >
                                <Link
                                    to="/signup"
                                    state={{ from: `/problem/${id}` }}
                                >
                                    Sign Up
                                </Link>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProblemPage;