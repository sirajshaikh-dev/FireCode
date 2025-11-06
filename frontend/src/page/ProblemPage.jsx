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
    ChevronRight,
    BookOpen,
    Terminal,
    Code2,
    Users,
    ThumbsUp,
    Home,
    Send
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useProblemStore } from "../store/useProblemStore";
import { useExecutionStore } from "../store/useExecutionStore";
import { usesubmissionStore } from "../store/useSubmissionStore";

import { getLanguageIdByName } from "../lib/getLanguage";
import SubmissionResults from "../components/SubmissionResults";
import SubmissionsList from "../components/SubmissionsList";


const ProblemPage = () => {
    const { id } = useParams()
    const { getProblemById, problem} = useProblemStore()
    const [code, setCode] = useState(problem?.codeSnippets["JAVASCRIPT"])
    const [activeTab, setActiveTab] = useState("description")
    const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT")
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [testCases, setTestCases] = useState([])

    const { executeCode, submission, isExecuting } = useExecutionStore()

    const { isSubmissionLoading, submission: submissions, submissionCount, //naming submission as submissions coz due to deprication
        getSubmissionForProblem, getSubmissionCountForProblem } = usesubmissionStore()

    const handleRunCode = async (e) => {
        e.preventDefault();

        try {
            const language_id = getLanguageIdByName(selectedLanguage);
            const stdin = problem.testCases.map(tc => tc.input);
            const expected_outputs = problem.testCases.map(tc => tc.output);

            // Wait for Judge0 + DB
            await executeCode(code, language_id, stdin, expected_outputs, id);

            // Refresh real submissions
            await getSubmissionForProblem(id);
            await getSubmissionCountForProblem(id);
        } catch (err) {
            console.error("Error executing code", err);
        }
    };


    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setSelectedLanguage(lang)
        setCode(problem.codeSnippets?.[lang] || "")
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "description":
                return (
                    <div className="prose max-w-none">
                        <p className="text-lg mb-6">{problem.description}</p>

                        {problem.examples && (
                            <>
                                <h3 className="text-xl font-bold mb-4">Examples:</h3>
                                {Object.entries(problem.examples).map(([lang, example]) => (
                                    <div key={lang} className="bg-base-200 p-6 rounded-xl mb-6 font-mono">
                                        <div className="mb-4">
                                            <div className="text-indigo-300 mb-2 text-base font-semibold">
                                                Input:
                                            </div>
                                            <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white">
                                                {example.input}
                                            </span>
                                        </div>
                                        <div className="mb-4">
                                            <div className="text-indigo-300 mb-2 text-base font-semibold">
                                                Output:
                                            </div>
                                            <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white">
                                                {example.output}
                                            </span>
                                        </div>
                                        {example.explanation && (
                                            <div>
                                                <div className="text-emerald-300 mb-2 text-base font-semibold">
                                                    Explanation:
                                                </div>
                                                <p className="text-base-content/70 text-lg font-sem">
                                                    {example.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                        {problem.constraints && (
                            <>
                                <h3 className="text-xl font-bold mb-4">Constraints:</h3>
                                <div className="bg-base-200 p-6 rounded-xl mb-6">
                                    <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white text-lg">
                                        {problem.constraints}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                );
            case "submissions":
                return <div className="p-4 text-center text-base-content/70"><SubmissionsList submissions={submissions} isSubmissionLoading={isSubmissionLoading} /></div>;

            // return <SubmissionsList submissions={submissions} isLoading={isSubmissionsLoading} />;
            case "discussion":
                return <div className="p-4 text-center text-base-content/70">No discussions yet</div>;
            case "hints":
                return (
                    <div className="p-4">
                        {problem?.hints ? (
                            <div className="bg-base-200 p-6 rounded-xl">
                                <span className="bg-black/90 px-4 py-1 rounded-lg font-semibold text-white text-lg">
                                    {problem.hints}
                                </span>
                            </div>
                        ) : (
                            <div className="text-center text-base-content/70">No hints available</div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    useEffect(() => {
        getProblemById(id)
        getSubmissionCountForProblem(id)
    }, [id, getProblemById, getSubmissionCountForProblem])

    useEffect(() => {
        if (problem) {
            setCode(problem.codeSnippets?.[selectedLanguage] || "")

            setTestCases(
                problem.testCases.map((tc) => ({
                    input: tc.input,
                    output: tc.output
                })) || []
            )
        }
    }, [problem, selectedLanguage])

    // useEffect(() => {
    //     if (activeTab === "submissions" && id) {
    //         getSubmissionForProblem(id)
    //     }
    // }, [activeTab, id, getSubmissionForProblem])
    // console.log("Submission Tab data",submissions);

    /**Vibe code */
    // stable fetch function
    const fetchSubmissions = useCallback(() => {
        if (activeTab === "submissions" && id) {
            getSubmissionForProblem(id);
        }
    }, [activeTab, id, getSubmissionForProblem]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);
    /* */

    return problem && (
        <div className="min-h-screen bg-gradient-to-br from-base-300 to-base-200 max-w-7xl w-full">
            <nav className="navbar bg-base-100 shadow-lg px-4">
                <div className="flex-1 gap-2">
                    <Link to={"/"} className="flex items-center gap-2 text-primary">
                        <Home className="w-6 h-6" />
                        <ChevronRight className="w-4 h-4" />
                    </Link>

                    <div className="mt-2">
                        <h1 className="text-xl font-bold">{problem.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-base-content/70 mt-5">
                            <Clock className="w-4 h-4" />
                            <span>
                                Updated{" "}
                                {problem.createdAt &&
                                    new Date(problem.createdAt).toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                            </span>
                            <span className="text-base-content/30">•</span>
                            <Users className="w-4 h-4" />
                            <span>{submissionCount} Submissions</span>
                            <span className="text-base-content/30">•</span>
                            <ThumbsUp className="w-4 h-4" />
                            <span>95% Success Rate</span>
                        </div>
                    </div>
                </div>

                <div className="flex-none gap-4">
                    <button
                        className={`btn btn-ghost btn-circle tooltip tooltip-info  
                            ${isBookmarked ? "text-primary" : ""} `}
                        data-tip={isBookmarked ? "Unbookmark" : "Bookmark"}
                        onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                        <Bookmark className="w-5 h-5" />
                    </button>
                    <button className="btn btn-ghost btn-circle tooltip tooltip-top" data-tip="Share">
                        <Share2 className="w-5 h-5" />
                    </button>

                    <select
                        className="select select-bordered select-primary w-40 cursor-pointer"
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
            </nav>

            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body p-0">
                            <div className="tabs tabs-border">
                                <button
                                    className={`tab gap-2 ${activeTab === "description" ? 'tab-active' : ""}`}
                                    onClick={() => setActiveTab("description")}
                                ><FileText className="w-4 h-4" />
                                    Description
                                </button>
                                <button
                                    className={`tab gap-2 ${activeTab === "submissions" ? 'tab-active' : ""}`}
                                    onClick={() => setActiveTab("submissions")}
                                > <Code2 className="w-4 h-4" />
                                    Submissions
                                </button>
                                <button
                                    className={`tab gap-2 ${activeTab === "discussion" ? "tab-active" : ""}`}
                                    onClick={() => setActiveTab("discussion")}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Discussion
                                </button>
                                <button
                                    className={`tab gap-2 ${activeTab === "hints" ? "tab-active" : ""}`}
                                    onClick={() => setActiveTab("hints")}
                                >
                                    <Lightbulb className="w-4 h-4" />
                                    Hints
                                </button>
                            </div>

                            <div className="p-6">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                    <div className="card bg-base-100 shadow-xl ">
                            <div className="flex items-center justify-between bg-base-200 p-3 rounded-xl shadow-sm">
                                {/* Left side — Code Editor tab */}
                                <div className="tabs tabs-bordered">
                                    <button className="tab tab-active gap-2 font-semibold text-base-content">
                                        <Terminal className="w-4 h-4" />
                                        Code Editor
                                    </button>
                                </div>

                                {/* Right side — Run + Submit buttons */}
                                <div className="flex items-center gap-3">
                                    <button
                                        className="btn btn-primary gap-2"
                                        onClick={handleRunCode}
                                        disabled={isExecuting}
                                    >
                                        {isExecuting ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Running...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4" />
                                                Run
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-success gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Submit
                                    </button>
                                </div>
                            </div>


                            <div className="h-[600px] w-full">
                                <Editor
                                    height={"100%"}
                                    language={selectedLanguage.toLowerCase()}
                                    defaultValue={problem.codeSnippets?.["JAVASCRIPT"]}
                                    theme="vs-dark"
                                    value={code}
                                    onChange={(value) => setCode(value || "")}
                                    options={
                                        {
                                            minimap: { enabled: false },
                                            fontSize: 22,
                                            lineNumbers: "on",
                                            roundedSelection: false,
                                            scrollBeyondLastLine: false,
                                            readOnly: false,
                                            automaticLayout: true,

                                        }
                                    }
                                />
                            </div>
                        </div>
                </div>

                <div className="card bg-base-100 shadow-xl mt-6">
                    <div className="card-body">
                        {
                            submission ? (<SubmissionResults submission={submission} />)
                                : <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold">Test Cases</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                                <tr>
                                                    <th>Input</th>
                                                    <th>Expected Output</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {testCases.map((testcase, i) => (
                                                    <tr key={i}>
                                                        <td className="font-mono">{testcase.input}</td>
                                                        <td className="font-mono">{testcase.output}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                        }
                    </div>

                </div>

            </div>
        </div>
    );

}


export default ProblemPage