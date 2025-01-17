import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebase';
import { useUser } from './UserContext';
import { onSnapshot } from 'firebase/firestore';

function Home() {
  const db = getFirestore(app);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [usersList, setUsers] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [expandedUser2, setExpandedUser2] = useState(null);
  const [expandedUser3, setExpandedUser3] = useState(null);


  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 4;


  const toggleAccordion = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };
  const toggleAccordion2 = (userId) => {
    setExpandedUser2(expandedUser2 === userId ? null : userId);
  };
  const toggleAccordion3 = (userId) => {
    setExpandedUser3(expandedUser3 === userId ? null : userId);
  };


  const { userId, setPeerData } = useUser(); 

  const handleChat = (peerUserId) => {
    if (userId) {
      setPeerData(peerUserId);
      navigate(`/all-users/chat`);
    } else {
      console.log(peerUserId)
      alert('You must be logged in to chat');
    }
  };

  const handleInfo = async(userId) => {
    try{
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()){
        const userData = userSnap.data();
        setUserInfo ((prevInfo) => ({
          ...prevInfo,
          [userId]:{email:userData.email || 'Correu no trobat', photoUrl:userData.photoUrl || '',gameFav:userData.gameFav||'Joc més jugat no trobat',gameFavImg:userData.gameFavImg||'', description: userData.description || "Descripció no trobada"},
      }));      
    }
  }
    catch (error) {
      console.error("Error obtenir informació", error);
    }
  };
  const handleFavs = async(userId) => {
    try{
      const userRef = doc(db, 'users', userId);
      const favRef = collection(userRef, 'favorits');
      const favSnap = await getDocs(favRef);

      const favoriteTitles = favSnap.docs.map((doc) => doc.data().title);
      setFavorites((prevFavorites) => ({
        ...prevFavorites,
        [userId]: favoriteTitles,
      }));
  }
    catch (error) {
      console.error("Error obtenir informació", error);
    }
  };

  const handleMiniBans = async (userId) =>{
    try{
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        if (userData.noGames){
          const banEndTime = userData.noGamesEndTime;
          const now = Date.now();

          if(banEndTime && now > banEndTime){
            await updateDoc(userRef,{noGames: false, noGamesEndTime:null });
          }
        }
        
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
          user.id === userId
          ?{
            ...user,
              noGames: userData.noGames || false,

          }
          : user
      )
    ); 

    if (userData.noFav){
      const banEndTime = userData.noFavEndTime;
      const now = Date.now();

      if(banEndTime && now > banEndTime){
        await updateDoc(userRef,{noFav: false, noFavEndTime:null });
      }
    }
    
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
          user.id === userId
          ?{
            ...user,
              noFav: userData.noFav || false,

          }
          : user
      )
    ); 

    if (userData.noFor){
      const banEndTime = userData.noForEndTime;
      const now = Date.now();

      if(banEndTime && now > banEndTime){
        await updateDoc(userRef,{noFor: false, noForEndTime:null });
      }
    }
    
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
          user.id === userId
          ?{
            ...user,
              noFor: userData.noFor || false,
          }
          : user
      )
    ); 
      
    }
  }
    catch (error) {
      console.error("Error al banejear l'usuari", error);
    }
  };
  const handleCheckbox = async (userId, field) =>{
    const userRef = doc(db, 'users', userId);
    try{
      const currentUser = usersList.find((user) => user.id === userId);
      const isBanned = currentUser[field];
      if(isBanned){
        await updateDoc(userRef,{[field]: false, [`${field}EndTime`]:null });
        
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, [field]: false, [`${field}EndTime`]:null } : user
          )
        );
       } else{
        const banEndTime = Date.now() + (0.5 * 60 * 1000);

        await updateDoc(userRef,{[field]: true, [`${field}EndTime`]:banEndTime });

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, [field]: true, [`${field}EndTime`]:banEndTime } : user
          )
        );
       }
    }
    catch (error) {
      console.error("Error al banejear l'usuari", error);
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
      console.error("Error al banejear l'usuari", error);
    }
  };

  const listUsers = () => {
   
      const users = collection(db, 'users');
      const unsubscribe = onSnapshot(users, (querySnapshot) =>{
      const usersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    }); 
    return unsubscribe;
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
    const unsubscribe = listUsers();
    return () => unsubscribe();
  }, []);

  useEffect(() =>{
    const interval = setInterval(async() =>{
      const now = Date.now();
      setUsers((prevUsers)=>{
        prevUsers.forEach(async(user)=>{
          const userRef = doc(db,'users',user.id);
          const updatedUser = {...user};
          if (user.noGamesEndTime && now > user.noGamesEndTime){
            updatedUser.noGames = false;
            updatedUser.noGamesEndTime= null;
            await updateDoc(userRef, { noGames: false, noGamesEndTime: null });
          }
          if (user.noFavEndTime && now > user.noFavEndTime){
            updatedUser.noFav = false;
            updatedUser.noFavEndTime= null;
            await updateDoc(userRef, { noFav: false, noFavEndTime: null });
          }
          if (user.noForEndTime && now > user.noForEndTime){
            updatedUser.noFor = false;
            updatedUser.noForEndTime= null;
            await updateDoc(userRef, { noFor: false, noForEndTime: null });
          }
        });
        return prevUsers.map ((user)=>{
          const updatedUser = {...user};
          if (user.noGamesEndTime && now > user.noGamesEndTime){
            updatedUser.noGames = false;
            updatedUser.noGamesEndTime= null;
          }
          if (user.noFavEndTime && now > user.noFavEndTime){
            updatedUser.noFav = false;
            updatedUser.noFavEndTime= null;
          }
          if (user.noForEndTime && now > user.noForEndTime){
            updatedUser.noFor = false;
            updatedUser.noForEndTime= null;
          }
          return updatedUser;
        });
    });
    },1000);
    return () => clearInterval(interval);
  },[]);
  useEffect(() =>{
    if(expandedUser2){
          const userRef = doc(db,'users',expandedUser2);
          const unsubscribeInfo = onSnapshot(userRef, (docSnap) =>{
          if (docSnap.exists()){
            const userData = docSnap.data();
            setUserInfo((prevInfo)=>({
              ...prevInfo,
              [expandedUser2]:{
                email: userData.email || 'Correu no trobat',
                photoUrl: userData.photoUrl || '',
                gameFav: userData.gameFav || 'Joc més jugat no trobat',
                gameFavImg: userData.gameFavImg || '',
                description: userData.description || 'Descripció no trobada',
              },
            }))
          }
        });

    return () => unsubscribeInfo();
      }
  },[expandedUser2]);
  useEffect(() =>{
    if(expandedUser3){
          const favRef = collection(db,'users',expandedUser3, 'favorits');
          const unsubscribeFavs = onSnapshot(favRef, (querySnapshot) =>{
            const favData = querySnapshot.docs.map((doc) => doc.data().title);
            setFavorites((prevFavorites)=>({
              ...prevFavorites,
              [expandedUser3]:favData,
               
            }));
          
        });

    return () => unsubscribeFavs();
      }
  },[expandedUser3]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
 const filteredUsers = usersList.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div id="usuaris" className="container mt-4">
      <h1 id="title" className="mb-4">Usuaris</h1>
      <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Cerca l'usuari" aria-label="Recipient's username" aria-describedby="basic-addon2" value= {searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
      <ul className="list-group">
        {currentUsers.map((user) => (
          <li key={user.id} className="list-group-item">
            <div className="d-flex align-items-center">
              <span className='text-truncate me -2 'style ={{ lineHeight: '1.2rem' }}>{user.name}</span>
              <div className="ms-auto d-flex align-items-center">
                <button id="info" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '2.2rem', height: '2.2rem' }} onClick={() => {toggleAccordion2(user.id);
                    if(expandedUser2 !== user.id)handleInfo(user.id);
                  }}>
                    {<i className="bi bi-info-circle"></i>}
                  
                  </button>
                <button
                  id="chat"
                  className="btn btn-primary me-2"
                  onClick={() => handleChat(user.id)}
                >
                  <i className="bi bi-chat"></i>
                </button>
                <button
                  id="fav"
                  className="btn btn-primary me-2"
                  onClick={() => {toggleAccordion3(user.id);
                    if(expandedUser3 !== user.id)handleFavs(user.id);
                    
                  }}
                >
                  {expandedUser3 === user.id ? 'Ocultar' :  <i className="bi bi-star"></i>}
                 
                </button>
                <button
                  className=" btn btn-primary btn-sm px-2 py-1"
                  onClick={() => {toggleAccordion(user.id);
                    if(expandedUser !== user.id)handleMiniBans(user.id);
                  }}
                >
                  {expandedUser === user.id ? 'Ocultar' : 'Opcions de restriccions'}
                </button>
                <button
                  id="perma"
                  className="btn btn-primary ms-2 btn-sm px-2 py-1"
                  onClick={() => handlePerma(user.id)}
                >
                  PermaBan
                </button>
              </div>
            </div>
            {expandedUser3 === user.id && (
              <div className="mt-3 p-3 bg-light rounded border">
                <h6>Jocs favorits:</h6>
                {favorites[user.id] ? (
                  <ul>
                    {favorites[user.id].map((title, index) => (
                      <li key={index}>{title}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Carregant jocs favorits...</p>
                )}
              </div>
            )}
            {expandedUser2 === user.id && (
                      <div className= "mt-3 p-3 bg-light rounded border">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            
                            <h6> Informació de l'usuari</h6>
                              {userInfo[user.id]?.photoUrl ? (
                              <img
                                src={userInfo[user.id].photoUrl}
                                alt={`Foto de perfil de ${user.name}`}
                                className="rounded-circle mt-2"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                              />
                              
                              ): (  
                                
                                  <p><strong>Foto de perfil:</strong> No disponible</p>
                                
                              )}
                          </div>
                          {userInfo[user.id] ? (
                            <ul>
                            <li><strong>Email:</strong> {userInfo[user.id].email}</li>
                            <li><strong>Joc més jugat:</strong> {userInfo[user.id].gameFav || 'No favoritos disponibles'}
                            {userInfo[user.id].gameFavImg && (
                            
                            <img
                              src={userInfo[user.id].gameFavImg}
                              alt={`Joc més jugat de ${user.name}`}
                              className="rounded-circle mt-2"
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', marginLeft: '15px' }}

                            />
                            )}
                            </li>
                            
                            <li><strong>Descripció:</strong> {userInfo[user.id].description}</li>
                          </ul>
                        ): (
                          <p>Carregant informació...</p>
                        )}
                      </div>
                    )}
            {expandedUser === user.id && (
              <div className="mt-3 p-3 bg-light rounded border">
                <h6>Opcions de sanció: </h6>
                <ul>
                  <li>
                    <input type="checkbox" id={`favorites-${user.id}`}
                    checked={user.noGames || false} 
                    onChange={()=> handleCheckbox(user.id, 'noGames')}
                    />
                    <label htmlFor={`favorites-${user.id}`} className="ms-2">
                      Restringir videojocs
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id={`comments-${user.id}`} 
                      checked={user.noFav || false} 
                      onChange={()=> handleCheckbox(user.id, 'noFav')}/>
                    <label htmlFor={`comments-${user.id}`} className="ms-2">
                      Restringir favorits
                    </label>
                  </li>
                  <li>
                    <input type="checkbox" id={`other-${user.id}`}
                     checked={user.noFor || false} 
                     onChange={()=> handleCheckbox(user.id, 'noFor')} />
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
      <nav>
          <ul className="pagination">
              {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }, (_, index) => (
                  <li
                      key={index + 1}
                      className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                      style={{ cursor: 'pointer' }}
                  >
                      <span className="page-link" onClick={() => paginate(index + 1)}>
                          {index + 1}
                      </span>
                  </li>
              
              ))}
          </ul>
      </nav>
    </div>
  );
}

export default Home;