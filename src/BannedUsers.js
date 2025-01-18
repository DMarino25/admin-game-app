import React, { useEffect, useState } from 'react';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import './styles/styles.css';
import { getFirestore, collection, onSnapshot, doc, deleteDoc, query, orderBy, where, getDocs, setDoc, getDoc,addDoc } from 'firebase/firestore';
import { app } from './firebase'; 

function BannedUsers() {
  const db = getFirestore(app);
  const [usersList, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 5;

  /*const handlePerma = async (userId) => {
    try {
      const bannedRef = doc(db, 'bannedUsers', userId);
      const userSnapshot = await getDoc(bannedRef);
      if(userSnapshot.exists){
        const bannedUserData = userSnapshot.data();
    
            await addDoc(collection(db, 'users'),{
              uid: bannedUserData.userId,
              name: bannedUserData.name || null,
              email: bannedUserData.email || null,
              photoUrl: bannedUserData.photoUrl || null,
              noGames: false,
              noFav: false,
              noFor: false,
            });
          
     
      await deleteDoc(bannedRef);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        } 
    }
    catch (error) {
        console.error("Error desbloquejant l'usuari:", error);
      }
  };*/


 
  useEffect(() => {
    const bannedUsersQuery = query(
      collection(db, 'bannedUsers'),
      orderBy('name')
    );

    const unsubscribe = onSnapshot(
      bannedUsersQuery,
      (querySnapshot) => {
        const users = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(users);
      },
      (error) => {
        console.error("Error al obtenir usuaris bloquejats:", error);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [db]);

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = usersList.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(usersList.length / itemsPerPage);

  return (
    <div id="usuaris" className="container mt-4">
      <h1 id="title" className="mb-4">Usuaris Bloquejats</h1>
      <ul className="list-group">
        {currentUsers.map((user) => (
          <li
            key={user.id}
            className="list-group-item"
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1 fw-bold">{user.name}</p>
                <p className="mb-0 text-secondary">{user.email}</p>
            </div>
            
            </div>
            
          </li>
        ))}
      </ul>
      <nav className="mt-4">
        <ul className="pagination justify-content-center">
          {[...Array(totalPages).keys()].map((page) => (
            <li
              key={page}
              className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(page + 1)}
              >
                {page + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default BannedUsers;