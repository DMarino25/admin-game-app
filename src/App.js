import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from './firebase'; 

function App() {
  const [user, setUser] = useState(null);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchUser = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      if (!querySnapshot.empty) {
        const firstUserDoc = querySnapshot.docs[0];
        setUser(firstUserDoc.data());
      }
    };

    fetchUser();
  }, [db]);

  return (
    <div className="App">
      <h1>Primer Usuario</h1>
      {user ? (
        <div>
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <img src={user.photoUrl} alt="Foto de perfil" />
        </div>
      ) : (
        <p>Cargando usuario...</p>
      )}
    </div>
  );
}

export default App;
