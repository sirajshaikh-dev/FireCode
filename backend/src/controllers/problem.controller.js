import { db } from "../lib/db.js";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "../lib/judge0.lib.js";

export const createProblem = async (req, res) => {
  // get all data from request body
  // check user role once again
  // loop through each refrence solution for different languages

  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Forbidden - Only admins can create problems" });
  }

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return res.status(400).json({
          error: `language ${language} is not supported`,
        });
      }

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}. Error: ${result.status.description
              }`,
            details: result,
          });
        }
      }

      //save problem in database

      const newProblem = await db.problem.create({
        data: {
          title,
          description,
          difficulty,
          tags,
          userId: req.user.id,
          examples,
          constraints,
          testCases,
          codeSnippets,
          referenceSolutions,
        },
      });

      console.log("Problem created successfully:", newProblem);

      return res.status(201).json({
        message: "Problem created successfully",
        problem: newProblem,
      });
    }
  } catch (error) {
    console.error("Error creating problem:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const userId = req.user?.id;
    const problems = await db.problem.findMany({
      include: userId ? {
        solvedBy: {
          where: {
            userId: userId,
          },
        },
      } : undefined,
    });

    if (!problems) {
      return res.status(404).json({
        error: "No problems found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      problems,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Error fetching problems",
    });
  }
};

export const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Problem fetched successfully",
      problem,
    });
  } catch (error) {
    console.log("Error fetching problem by id:", error);
    return res.status(500).json({
      error: "Error fetching problem by id",
    });
  }
};

export const updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testCases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Forbidden - Only admins can update problems" });
  }

  try {
    const existingProblem = await db.problem.findUnique({
      where: { id },
    });

    if (!existingProblem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Step 2: Validate each reference solution using testCases
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
    // Step 2.1: Get Judge0 language ID for the current language
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return res.status(400).json({
          error: `Language ${language} is not supported`,
        });
      }
    // Step 2.2: Prepare Judge0 submissions for all test cases
      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

    // Step 2.3: Submit all test cases in one batch
      const submissionResults = await submitBatch(submissions);
    // Step 2.4: Extract tokens from response
      const tokens = submissionResults.map((res) => res.token);
    // Step 2.5: Poll Judge0 until all submissions are done  
      const results = await pollBatchResults(tokens);
    
    // Step 2.6:Validate that each test case passed (status.id === 3)
      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Test case ${i + 1} failed for language ${language}. Error: ${result.status.description
              }`,
            details: result,
          });
        }
      }
    }

    // Prepare update data - only include fields that are provided
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (tags !== undefined) updateData.tags = tags;
    if (examples !== undefined) updateData.examples = examples;
    if (constraints !== undefined) updateData.constraints = constraints;
    if (testCases !== undefined) updateData.testCases = testCases;
    if (codeSnippets !== undefined) updateData.codeSnippets = codeSnippets;
    if (referenceSolutions !== undefined) updateData.referenceSolutions = referenceSolutions;

    // Update the problem in database
    const updatedProblem = await db.problem.update({
      where: { id },
      data: updateData,
    });

    console.log("Problem updated successfully:", updatedProblem);

    return res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      problem: updatedProblem,
    });
  } catch (error) {
    console.error("Error updating problem:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const delteleProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({ where: { id } });

    if (!problem) return res.status(404).json({ error: "Problem not found" });

    await db.problem.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    console.log("Error delating problem", error);
    return res.status(500).json({
      error: "Error delating problem",
    });
  }
};

export const getAllProblemsSolvedByUser = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        solvedBy: {
          where: {
            userId: req.user.id,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Problem fetched successfully",
      problems,
    });
  } catch (error) {
    console.log(`error fetching problems`, error);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
};
