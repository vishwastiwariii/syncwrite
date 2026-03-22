import './App.css'
import {Routes, Route, BrowserRouter} from 'react-router-dom'
import Home from './pages/Home'
import Editor from './pages/Editor'
import AuthPage from './pages/AuthPage'


export default function App() {
  return (
    <BrowserRouter> 
     <Routes> 
      <Route path = '/' element = {<Home />}> </Route>
      <Route path = '/login' element = {<AuthPage />}> </Route>
      <Route path = '/editor/:id' element = {<Editor />}> </Route>
     </Routes>
    </BrowserRouter>
  )
}
