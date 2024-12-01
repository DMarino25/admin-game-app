import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebase';
import { useUser } from './UserContext';

function Home() {
  const db = getFirestore(app);
  const navigate = useNavigate();
  const [usersList, setUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);

  const toggleAccordion = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Get your own userId
  const { user, setPeerData } = useUser(); // Access the logged-in user's data
  const currentUserId = user ? user.uid : null;

  const handleChat = (peerUserId) => {
    if (currentUserId) {
      // Store the peer user's ID in the context
      setPeerData(peerUserId);
      navigate(`/all-users/chat`);
    } else {
      console.log(peerUserId.uid)
      alert('You must be logged in to chat');
    }
  };

  const handlePerma = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        await addDoc(collection(db, 'bannedUsers'), {
          userId,
          email: userData.email,
          name: userData.name,
        });

        await deleteDoc(userRef);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      }
    } catch (error) {
      console.error("Error al banjear l'usuari", error);
    }
  };

  const listUsers = async () => {
    try {
      const users = collection(db, 'users');
      const querySnapshot = await getDocs(users);
      const usersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error al obtenir els usuaris", error);
    }
  };

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
    <div id="usuaris" className="container mt-4">
      <h1 className="mb-4">Usuaris</h1>
      <ul className="list-group">
        {usersList.map((user) => (
          <li key={user.id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <span>{user.name}</span>
              <div className="d-flex">
                <button
                  id="chat"
                  className="btn btn-primary me-2"
                  onClick={() => handleChat(user.id)} // Call handleChat with the userId
                >
                  <i className="bi bi-chat"></i>
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => toggleAccordion(user.id)}
                >
                  {expandedUser === user.id ? 'Ocultar' : 'Opcions de restriccions'}
                </button>
                <button
                  id="perma"
                  className="btn btn-primary ms-2"
                  onClick={() => handlePerma(user.id)}
                >
                  PermaBan
                </button>
              </div>
            </div>
            {expandedUser === user.id && (
              <div className="mt-3 p-3 bg-light rounded border">
                <h6>Opcions de sanció: </h6>
                <ul>
                  <li>
                    <input type="checkbox" id={`favorites-${user.id}`} />
                    <label htmlFor={`favorites-${user.id}`} className="ms-2">
                      Restringir videojocs
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id={`comments-${user.id}`} />
                    <label htmlFor={`comments-${user.id}`} className="ms-2">
                      Restringir favorits
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id={`other-${user.id}`} />
                    <label htmlFor={`other-${user.id}`} className="ms-2">
                      Restringir forums
                    </label>
                  </li>
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;