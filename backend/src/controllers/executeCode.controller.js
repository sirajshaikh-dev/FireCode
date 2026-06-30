import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../lib/judge0.lib.js";

export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problemId } =
      req.body;

    // problemId Check
    if (!problemId) {
      return res.status(400).json({ error: "Problem ID is required" });
    }

    // 1. Validate test cases
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      return res.status(400).json({ error: "Invalid or missing test cases" });
    }

    // 2. prepare each test cases for judge0 batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    //3. Send batch of submissions to judge0
    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((res) => res.token);

    //4. Poll judge0 to Get results of all submitted test cases
    const results = await pollBatchResults(tokens);
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(500).json({ error: "No results from Judge0" });
    }

    console.log("----------");
    console.log("Executed Code Result:", results);

    // 5. Analyze test case results
    let allPassed = true;
    const detailedResults = results.map((result, i) => {
      const stdout = result.stdout?.trim() || "";
      const expected_output = expected_outputs[i]?.trim() || "";
      const passed = stdout === expected_output;
      if (!passed) allPassed = false;

      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compile_output: result.compile_output || null,
        status: result.status?.description || null,
        memory: result.memory ? `${result.memory}KB` : undefined,
        time: result.time ? `${result.time}s` : undefined, 
      };
    });
    console.log(`detailedResults---------`);
    console.log(detailedResults);

    // 6. Construct stateless mock submission object
    const mockSubmission = {
      id: "run-submission",
      userId: null,
      problemId,
      sourceCode: source_code,
      language: getLanguageName(language_id),
      stdin: stdin.join("\n"),
      stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
      stderr: detailedResults.some((r) => r.stderr)
        ? JSON.stringify(detailedResults.map((r) => r.stderr))
        : null,
      compileOutput: detailedResults.some((r) => r.compile_output)
        ? JSON.stringify(detailedResults.map((r) => r.compile_output))
        : null,
      status: allPassed ? "Accepted" : "Wrong Answer",
      memory: detailedResults.some((r) => r.memory !== undefined)
        ? JSON.stringify(detailedResults.map((r) => r.memory))
        : null,
      time: detailedResults.some((r) => r.time !== undefined)
        ? JSON.stringify(detailedResults.map((r) => r.time))
        : null,
      testCases: detailedResults.map((result) => ({
        id: `run-tc-${result.testCase}`,
        submissionId: "run-submission",
        testCase: result.testCase,
        passed: result.passed,
        stdout: result.stdout,
        expected: result.expected,
        stderr: result.stderr,
        compileOutput: result.compile_output,
        status: result.status,
        memory: result.memory,
        time: result.time,
      }))
    };

    res.status(200).json({
      success: true,
      message: "Code Executed Successfully!",
      submission: mockSubmission,
    });
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({ error: "Failed to execute code" });
  }
};
