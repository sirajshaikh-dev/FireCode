import React from "react";
import { FileText, Code2, MessageSquare, Lightbulb, Users } from "lucide-react";
import SubmissionsList from "../SubmissionsList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#1e1e1e] border-r border-[#282828]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        {/* Tabs Header */}
        <TabsList className="flex items-center bg-[#282828] border-b border-[#3e3e3e] px-2 h-10 select-none flex-shrink-0 rounded-none justify-start w-full">
          <TabsTrigger
            value="description"
            className="px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-full rounded-none border-t-2 data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:bg-[#1e1e1e] data-[state=active]:shadow-none text-neutral-400 hover:text-white border-transparent bg-transparent"
          >
            <FileText className="w-3.5 h-3.5" />
            Description
          </TabsTrigger>
          <TabsTrigger
            value="submissions"
            className="px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-full rounded-none border-t-2 data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:bg-[#1e1e1e] data-[state=active]:shadow-none text-neutral-400 hover:text-white border-transparent bg-transparent"
          >
            <Code2 className="w-3.5 h-3.5" />
            Submissions
            {submissionCount > 0 && (
              <span className="bg-[#3a3a3a] text-neutral-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                {submissionCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="discussion"
            className="px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-full rounded-none border-t-2 data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:bg-[#1e1e1e] data-[state=active]:shadow-none text-neutral-400 hover:text-white border-transparent bg-transparent"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Discussion
          </TabsTrigger>
          <TabsTrigger
            value="hints"
            className="px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer h-full rounded-none border-t-2 data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:bg-[#1e1e1e] data-[state=active]:shadow-none text-neutral-400 hover:text-white border-transparent bg-transparent"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Hints
          </TabsTrigger>
        </TabsList>

        {/* Tab Bodies */}
        <TabsContent value="description" className="flex-1 overflow-y-auto p-6 scrollbar-thin select-text mt-0">
          <h2 className="text-xl font-bold mb-2 text-white">{problem.title}</h2>
          <div className="prose max-w-none text-neutral-300 select-text">
            <div className="flex items-center gap-2 mb-4 mt-2">
              <Badge
                variant={
                  problem.difficulty === "EASY"
                    ? "easy"
                    : problem.difficulty === "MEDIUM"
                      ? "medium"
                      : "hard"
                }
                className="uppercase tracking-wider"
              >
                {problem.difficulty}
              </Badge>
              {problem.tags && problem.tags.map((tag, i) => (
                <Badge key={i} variant="tag">
                  {tag}
                </Badge>
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
                        <span className="text-primary font-semibold">Input: </span>
                        <span className="text-neutral-200">{example.input}</span>
                      </div>
                      <div className="mt-1.5">
                        <span className="text-primary font-semibold">Output: </span>
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
                      <span className="text-primary mt-0.5">•</span>
                      <code className="bg-[#282828] px-2 py-0.5 rounded border border-[#3e3e3e] text-neutral-300">
                        {constraint}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="flex-1 overflow-y-auto p-6 scrollbar-thin select-text mt-0">
          {!authUser ? (
            <div className="p-8 text-center text-neutral-500 flex flex-col items-center gap-3">
              <Users className="w-12 h-12 text-neutral-700" />
              <p className="text-sm">Please sign in to view your submission history.</p>
              <Button size="sm" onClick={() => setIsAuthModalOpen(true)} className="mt-2">
                Sign In
              </Button>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-full p-2">
              <SubmissionsList submissions={submissions} isSubmissionLoading={isSubmissionLoading} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="discussion" className="flex-1 overflow-y-auto p-6 scrollbar-thin select-text mt-0">
          <div className="p-8 text-center text-neutral-500 text-sm">No discussions yet</div>
        </TabsContent>

        <TabsContent value="hints" className="flex-1 overflow-y-auto p-6 scrollbar-thin select-text mt-0">
          <div className="p-2">
            {problem?.hints ? (
              <div className="bg-[#282828] border border-[#3e3e3e] p-5 rounded-xl">
                <span className="font-semibold text-xs text-primary block mb-2 uppercase tracking-wider">Hint</span>
                <p className="text-sm text-neutral-300 leading-relaxed font-mono">
                  {problem.hints}
                </p>
              </div>
            ) : (
              <div className="text-center text-neutral-500 text-sm mt-8">No hints available</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProblemDescription;
