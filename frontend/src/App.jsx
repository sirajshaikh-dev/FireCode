import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/useAuthStore'
import { Loader } from 'lucide-react'

import LoginPage from './page/LoginPage'
import HomePage from './page/HomePage'
import SignupPage from './page/SignupPage'
import Layout from './layout/Layout'
import AddProblem from './page/AddProblem'
import AdminRoute from './components/AdminRoute'
import ProblemPage from './page/ProblemPage'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin' />
      </div>
    )
  }
  return (
    <div className='flex flex-col items-center justify-start'>
      <Toaster />
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route
            index
            element={<HomePage />}
          />
        </Route>

        <Route
          path='/login'
          element={!authUser ? <LoginPage /> : <Navigate to={location.state?.from || '/'} replace />}
        />
        <Route
          path='/signup'
          element={!authUser ? <SignupPage /> : <Navigate to={location.state?.from || '/'} replace />}
        />

        <Route
          path='/problem/:id'
          element={<ProblemPage />}
        />

        <Route element={<AdminRoute />}>
          <Route
            path='/add-problem'
            element={authUser ? <AddProblem /> : <Navigate to="/" />}
          />
        </Route>
      </Routes>
    </div>

  )
}

export default App
