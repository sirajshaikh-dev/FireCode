import React from "react";
import { Terminal, Play, Plus, CheckCircle2, XCircle } from "lucide-react";

const ConsolePanel = ({
  consoleTab,
  setConsoleTab,
  testCases,
  setTestCases,
  activeTestCaseIndex,
  setActiveTestCaseIndex,
  activeResultCaseIndex,
  setActiveResultCaseIndex,
  isExecuting,
  submission,
  handleAddTestCase,
}) => {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#1e1e1e]">
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
                className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
                          <div className={`bg-[#2a2a2a] p-3 rounded-lg border border-neutral-800 font-mono text-xs min-h-[60px] max-h-[150px] overflow-y-auto select-text text-neutral-300 font-semibold`}>
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
  );
};

export default ConsolePanel;
