import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import IntroSplash from './components/IntroSplash.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import SellPlastic from './pages/SellPlastic.jsx'
import MyRequests from './pages/MyRequests.jsx'
import Rewards from './pages/Rewards.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import CollectorDashboard from './pages/CollectorDashboard.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <>
      <IntroSplash/>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>
        } />
        <Route path="/sell-plastic" element={
          <ProtectedRoute allowedRoles={['user']}><SellPlastic /></ProtectedRoute>
        } />
        <Route path="/my-requests" element={
          <ProtectedRoute allowedRoles={['user']}><MyRequests /></ProtectedRoute>
        } />
        <Route path="/rewards" element={
          <ProtectedRoute allowedRoles={['user']}><Rewards /></ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />

        {/* Collector routes */}
        <Route path="/collector" element={
          <ProtectedRoute allowedRoles={['collector']}><CollectorDashboard /></ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
