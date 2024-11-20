import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './styles/styles.css';
import { getFirestore, collection, getDocs,query,where } from 'firebase/firestore';
import { app } from './firebase'; 
import AllUsers from './AllUsers';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const db = getFirestore(app);


  const handleLogin = async () => {
    setError(null)
    setSuccess(null);
    try{
      const users= collection(db, 'users');
      const q = query(users, where('name', '==', username)); 
      const querySnapshot = await getDocs(q);

      if(!querySnapshot.empty){
        const userData = querySnapshot.docs[0].data();
        if(userData.role === "admin" && password === "admin"){
          alert("¡Login exitoso! Bienvenido Admin");
          navigate('/all-users');
        }
      }
    }
    catch(error){
      console.error("Inici de sessió erroni", error);
    }
  }

  return (
    <div className='app-body'>
    <body>
      <h1 className='logTitle'> Admin GameApp</h1>
    <div id="login-screen" class="container mt-5">
      <input id="username" class="username form-control mb-2" type="text" value={username} placeholder="user name" onChange={(e) => setUsername(e.target.value)}/>
      <input id="password" class="password form-control mb-2" type="password"  value={password} placeholder="password"onChange={(e) => setPassword(e.target.value)}/>
      <button class= "btn btn-primary" type="button"onClick={handleLogin}>Log in</button>
      {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
    </div>
    </body>
    </div>
  );
};

export default Login;