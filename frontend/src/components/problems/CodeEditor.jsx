import React from "react";
import Editor from "@monaco-editor/react";
import { Code2, RefreshCw } from "lucide-react";

const CodeEditor = ({
  selectedLanguage,
  handleLanguageChange,
  code,
  setCode,
  problem,
  handleResetCode,
  authUser,
  setIsAuthModalOpen,
}) => {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#1e1e1e]">
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
            {Object.keys(problem?.codeSnippets || {}).map((lang) => (
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
          defaultValue={problem?.codeSnippets?.[selectedLanguage] || ""}
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
  );
};

export default CodeEditor;
