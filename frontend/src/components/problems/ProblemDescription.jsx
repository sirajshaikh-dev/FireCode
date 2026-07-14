import React from "react";
import { FileText, Code2, MessageSquare, Lightbulb, Users } from "lucide-react";
import SubmissionsList from "../SubmissionsList";

const ProblemDescription = ({
  problem,
  activeTab,
  setActiveTab,
  submissionCount,
  submissions,
  isSubmissionLoading,
  authUser,
  setIsAuthModalOpen,
  id,
}) => {
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

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#1e1e1e] border-r border-[#282828]">
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
        {activeTab === "description" && (
          <h2 className="text-xl font-bold mb-2 text-white">{problem.title}</h2>
        )}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProblemDescription;
