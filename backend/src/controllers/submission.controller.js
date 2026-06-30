import { db } from "../lib/db.js";
import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../lib/judge0.lib.js";

export const getAllSubmission = async (req, res) => {
  try {
    const userId = req.user.id;
    const submission = await db.submission.findMany({
      where: {
        userId: userId,
      },
    });
    res.status(200).json({
      success: true,
      message: "submission fetched successfully",
      submission,
    });
  } catch (error) {
    console.error("submission fetch error", error);
    res.status(500).json({ error: "failed to fetch submission" });
  }
};

export const getSubmissionForProblem = async (req, res) => {
  try {
    const userId = req.user.id;
    const problemId = req.params.problemId;
    const submission = await db.submission.findMany({
      where: {
        userId: userId,
        problemId: problemId,
      },
    });
    res.status(200).json({
      success: true,
      message: "submission fetched successfully",
      submission,
    });
  } catch (error) {
    console.error("failed to fetch get submission for problem", error);
    res
      .status(500)
      .json({ error: "failed to fetch get submission for problem" });
  }
};

export const getAllSubmissionForProblem = async (req, res) => {
  try {
    const problemId = req.params.problemId;
    const submission = await db.submission.count({
      where: {
        problemId: problemId,
      },
    });
    res.status(200).json({
      success: true,
      message: "get All submission fetched success",
      count: submission,
    });
  } catch (error) {
    console.error("failed to fetch get Allsubmission for problem", error);
    res
      .status(500)
      .json({ error: "failed to fetch get Allsubmission for problem" });
  }
};

export const submitCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problemId } =
      req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!problemId) {
      return res.status(400).json({ error: "Problem ID is required" });
    }

    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      return res.status(400).json({ error: "Invalid or missing test cases" });
    }

    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((res) => res.token);

    const results = await pollBatchResults(tokens);
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(500).json({ error: "No results from Judge0" });
    }

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

    const submission = await db.submission.create({
      data: {
        userId,
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
      },
    });

    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: { userId, problemId },
      });
    }

    const testCaseResults = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));

    await db.testCaseResult.createMany({ data: testCaseResults });

    const submissionWithTestCase = await db.submission.findUnique({
      where: { id: submission.id },
      include: { testCases: true },
    });

    res.status(200).json({
      success: true,
      message: "Code Submitted Successfully!",
      submission: submissionWithTestCase,
    });
  } catch (error) {
    console.error("Error submitting code:", error);
    res.status(500).json({ error: "Failed to submit code" });
  }
};
