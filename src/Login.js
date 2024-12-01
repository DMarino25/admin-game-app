import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from './firebase';
import { useUser } from './UserContext';  // Import the useUser hook

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUserData } = useUser(); // Access the context to set user data

  const handleLogin = async () => {
    setError(null);
    try {
      const db = getFirestore(app);
      const users = collection(db, 'users');
      const q = query(users, where('name', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.role === 'admin' && password === 'admin') {
          console.log("userData:" + userData.uid)
          setUserData(userData.uid); // Set user data in the context
          navigate('/all-users');
        } else {
          setError('Incorrect password or role');
        }
      } else {
        setError('User not found');
      }
    } catch (error) {
      console.error('Login error', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="app-body">
      <h1 className="logTitle">Admin GameApp</h1>
      <div id="login-screen" className="container mt-2">
        <input
          id="username"
          className="username form-control mb-2"
          type="text"
          value={username}
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          id="password"
          className="password form-control mb-2"
          type="password"
          value={password}
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary" type="button" onClick={handleLogin}>
          Log in
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
}

export default Login;