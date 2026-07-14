import React, { memo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  RotateCw,
} from "lucide-react";
import { usesubmissionStore } from "../store/useSubmissionStore";
import { useParams } from "react-router-dom";

const SubmissionsList = memo(({ submissions, isSubmissionLoading }) => {
  const { id: problemId } = useParams();
  const { getSubmissionForProblem } = usesubmissionStore();
  const [expandedId, setExpandedId] = useState(null);

  // Sort submissions by latest first (descending)
  const sortedSubmissions = [...(submissions || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Helper function to safely parse JSON strings
  const safeParse = (data) => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Error parsing data:", error);
      return [];
    }
  };

  // Helper function to calculate average memory usage
  const calculateAverageMemory = (memoryData) => {
    const memoryArray = safeParse(memoryData).map((m) =>
      parseFloat(m.split(" ")[0])
    );
    if (memoryArray.length === 0) return 0;
    return (
      memoryArray.reduce((acc, curr) => acc + curr, 0) / memoryArray.length
    );
  };

  // Helper function to calculate average runtime
  const calculateAverageTime = (timeData) => {
    const timeArray = safeParse(timeData).map((t) =>
      parseFloat(t.split(" ")[0])
    );
    if (timeArray.length === 0) return 0;
    return timeArray.reduce((acc, curr) => acc + curr, 0) / timeArray.length;
  };

  // Helper to format source code string
  const getSourceCodeString = (src) => {
    if (!src) return "";
    if (typeof src === "string") {
      try {
        const parsed = JSON.parse(src);
        if (typeof parsed === "string") return parsed;
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        return src;
      }
    }
    return JSON.stringify(src, null, 2);
  };

  // Format date matching: Jul 13, 2026 12:25 AM
  const getFormattedDate = (createdAt) => {
    const dateObj = new Date(createdAt);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  };



  const handleRefresh = (e) => {
    e.stopPropagation();
    if (problemId) {
      getSubmissionForProblem(problemId);
    }
  };

  // Loading state
  if (isSubmissionLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // No submissions state
  if (!submissions?.length) {
    return (
      <div className="text-center p-8 select-none">
        <div className="text-neutral-500 text-sm mb-2">No submissions yet</div>
        <button
          onClick={handleRefresh}
          className="btn btn-ghost btn-xs text-neutral-400 hover:text-white gap-1"
        >
          <RotateCw className="w-3 h-3" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Submissions Header */}
      <div className="flex justify-between items-center mb-3 px-1 select-none">
        <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Submissions Log</span>
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          title="Refresh submissions"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Submission List */}
      <div className="space-y-3.5">
        {sortedSubmissions.map((submission, index) => {
          const avgMemory = calculateAverageMemory(submission.memory);
          const avgTime = calculateAverageTime(submission.time);
          const isExpanded = expandedId === submission.id;

          // Map "Accepted" to "Correct", or use raw status
          const isAccepted = submission.status.toLowerCase() === "accepted";
          const statusText = isAccepted ? "Correct" : submission.status;

          return (
            <div
              key={submission.id}
              className="bg-[#282828] border border-neutral-800 hover:border-neutral-700/80 transition-all rounded-xl p-4 select-text"
            >
              <div 
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : submission.id)}
              >
                {/* Left side: Status and formatted Date */}
                <div className="flex flex-col gap-1.5">
                  <span className={`text-sm font-bold tracking-wide ${
                    isAccepted ? "text-[#2cbb5d]" : "text-[#ef4743]"
                  }`}>
                    {statusText}
                  </span>
                  <span className="text-neutral-400 text-xs font-medium">
                    {getFormattedDate(submission.createdAt)}
                  </span>
                </div>

                {/* Right side: expand chevron */}
                <div className="flex items-center gap-4 text-neutral-300">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </div>

              {/* Expansion Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-neutral-700/60 text-xs space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-neutral-400">
                    <div>
                      <span className="font-semibold text-neutral-500 mr-1">Language:</span>
                      <span className="text-neutral-300 font-mono bg-neutral-800 px-2 py-0.5 rounded text-[10px]">
                        {submission.language}
                      </span>
                    </div>
                    <div className="w-px h-3 bg-neutral-700"></div>
                    <div>
                      <span className="font-semibold text-neutral-500 mr-1">Avg. Runtime:</span>
                      <span className="text-neutral-300 font-mono">{avgTime.toFixed(3)} s</span>
                    </div>
                    <div className="w-px h-3 bg-neutral-700"></div>
                    <div>
                      <span className="font-semibold text-neutral-500 mr-1">Avg. Memory:</span>
                      <span className="text-neutral-300 font-mono">{avgMemory.toFixed(0)} KB</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-neutral-500 block mb-1.5">Submitted Code:</span>
                    <pre className="bg-[#1e1e1e] p-3.5 rounded-lg border border-neutral-800 font-mono text-neutral-300 text-xs overflow-x-auto select-text leading-relaxed max-h-[300px]">
                      <code>{getSourceCodeString(submission.sourceCode)}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default SubmissionsList;