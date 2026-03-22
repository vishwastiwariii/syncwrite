import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom';

function Home() {

  const {logout} = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout();
    navigate('/login')
  }


  return (
    <>
    <div> Home </div>
    <button onClick={handleLogout}> Logout </button>
    </>
  )
}

export default Home