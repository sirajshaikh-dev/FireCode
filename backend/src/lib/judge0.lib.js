import axios from "axios";

const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Create a reusable axios instance with headers
const judge0 = axios.create({
  baseURL: JUDGE0_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${JUDGE0_API_KEY}`,
  },
});

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };
  return languageMap[language.toUpperCase()];
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  while (true) {
    const { data } = await judge0.get(`/submissions/batch`, {
      params: {
        tokens: tokens.join(","),
        base64_encoded: false,
      },
    });

    const results = data.submissions;
    console.log("Polling Results:", results);

    const isAllDone = results.every(
      (res) => res.status.id !== 1 && res.status.id !== 2 // 1 = In Queue, 2 = Processing
    );

    if (isAllDone) return results;
    await sleep(1000);
  }
};

export const submitBatch = async (submissions) => {
  const { data } = await judge0.post(
    `/submissions/batch?base64_encoded=false`,
    { submissions }
  );
  console.log("Submission response", data);
  return data; // [{token}, {token}, ...]
};

export function getLanguageName(languageId) {
  const LANGUAGE_NAMES = {
    74: "TypeScript",
    63: "JavaScript",
    71: "Python",
    62: "Java",
  };
  return LANGUAGE_NAMES[languageId] || "Unknown language";
}
