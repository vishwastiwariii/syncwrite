import './App.css'
import {Routes, Route, BrowserRouter} from 'react-router-dom'
import Home from './pages/Home'
import Editor from './pages/Editor'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'


export default function App() {
  return (
    <BrowserRouter> 
     <Routes> 
      <Route path = '/' element = {<Home />}> </Route>
      <Route path = '/login' element = {<AuthPage />}> </Route>
      <Route path = '/dashboard' element = {<ProtectedRoute><Dashboard /></ProtectedRoute>}> </Route>
      <Route path = '/editor/:id' element = {<ProtectedRoute><Editor /></ProtectedRoute>}> </Route>
     </Routes>
    </BrowserRouter>
  )
}
