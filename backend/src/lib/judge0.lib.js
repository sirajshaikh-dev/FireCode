import axios from 'axios';

export const getJudge0LanguageId = (language)=>{
    const languageMap = {
        "PYTHON": 71,
        "JAVA": 62,
        "JAVASCRIPT": 63,
    }
    return languageMap[language.toUpperCase()];
}
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const judge0 = axios.create({
    baseURL: process.env.JUDGE0_API_URL,
    headers:{
        "X-Auth-Token": process.env.JUDGE0_API_KEY,
        "Content-Type": "application/json"
    }
})

export const pollBatchResults = async (tokens) => {
    while(true){
        const {data} = await judge0.get(`${process.env.JUDGE0_API_URL}/submissions/batch`,{
            params:{
                tokens: tokens.join(","),
                base64_encoded: false,
            }
        })
        const results = data.submissions

    console.log('Polling Results:', results) 

        const isAllDone= results.every(
            (res)=>res.status.id !==1 && res.status.id !==2 // 1-> In Queue, 2-> Processing
        )

        if(isAllDone) return results
        await sleep(1000);
    }
}

export const submitBatch= async (submissions)=>{
    const {data} =await judge0.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,{
        submissions
    })
    console.log('Submission response', data)
    
    return data //[{token},{token},{token}]
}

export function getLanguageName(languageId){
    const LANGUAGE_NAMES = {
        74: "TypeScript",
        63: "JavaScript",
        71: "Python",
        62: "Java",
    }
    return LANGUAGE_NAMES[languageId] || "Unknown language"
}