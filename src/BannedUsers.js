import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './styles/styles.css';
import { getFirestore, collection, getDocs,query,where, doc, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from './firebase'; 



function BannedUsers() {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [usersList, setUsers] = useState([]);

  const handlePerma= async(userId) => {

    try{
      const bannedRef= doc(db, 'bannedUsers',userId);
      const bannedSnap = await getDoc(bannedRef);

      if (bannedSnap.exists()) {

       
        await deleteDoc(bannedRef);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      }
    }
    catch(error){
      console.error("Error al banjear l'usuari", error);
    }

  }  
  const listUsers = async() =>{
    try{
      const banned= collection(db, 'bannedUsers');
      const querySnapshot = await getDocs(banned);
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList); 
    }
    catch(error){
      console.error("Inici de sessió erroni", error);
    }
  }


  useEffect(() => {

    document.body.style.backgroundColor = '#BEBEBE';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);
  useEffect(() => {
    listUsers();
  }, []);
    return (
      <div id='usuaris'div className="container mt-4">
      <h1 id="title" className="mb-4">Usuaris Bloquejats</h1>
      <ul className="list-group">
        {usersList.map(user => (
          <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{user.name}</span>
            <div className= 'd-plex'>
            <button id="unban" className='btn btn-primary ms-auto'onClick={() => handlePerma(user.id)} >
                Desbloquejar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
    );
  }
  
  export default BannedUsers;