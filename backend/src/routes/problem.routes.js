import express from 'express'
import { authMiddleware, checkAdmin, optionalAuthMiddleware } from '../middleware/auth.middleware.js';
import { createProblem, delteleProblem, getAllProblems, getAllProblemsSolvedByUser, getProblemById, updateProblem } from '../controllers/problem.controller.js';


const problemRoutes= express.Router()

problemRoutes.post('/create-problem', authMiddleware, checkAdmin, createProblem)

problemRoutes.get('/get-all-problems', optionalAuthMiddleware, getAllProblems)

problemRoutes.get('/get-problem/:id', optionalAuthMiddleware, getProblemById)

problemRoutes.put('/update-problem/:id',authMiddleware, checkAdmin, updateProblem)

problemRoutes.delete('/delete-problem/:id', authMiddleware, checkAdmin, delteleProblem)

problemRoutes.get("/get-solved-problems", authMiddleware, getAllProblemsSolvedByUser)

export default problemRoutes;