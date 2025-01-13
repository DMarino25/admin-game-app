import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc, where, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebase';
import { useUser } from './UserContext';



function Feedback() {
    const db = getFirestore(app);
    const auth = getAuth(app);

    const [searchTerm, setSearchTerm] = useState('');
    const [usersList, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); 
    const itemsPerPage = 2;

    const [feedbackperUser, setFeedbackperUser] = useState([]);

    const feedbacksPerPage = 1;
    const handleFeedbackPageChange = (userId, newPage) => {
        setFeedbackperUser(prev => ({
          ...prev,
          [userId]: newPage
        }));
      };

    const listUsers = async() =>{
        try{
            const feedback= collection(db, 'feedbacks');
            const querySnapshot = await getDocs(feedback);

            const userFeedbackMap ={};
            for (const feedbackDoc of querySnapshot.docs){
                const feedbackData = feedbackDoc.data();
                const userId = feedbackData.userId;

                if (!userFeedbackMap[userId]){
                    userFeedbackMap[userId] = {
                        userId,
                        feedbacks:[],
                    };
                }
                userFeedbackMap[userId].feedbacks.push({id:feedbackDoc.id, comment: feedbackData.comment || "Sense comentari", report:feedbackData.report || "Sense report"});
            }
            const userIds = Object.keys(userFeedbackMap);
            for (const uid of userIds){
                const userDocRef = doc(db,'users',uid);
                const userSnap = await getDoc(userDocRef);

                let userName = 'Usuari no trobat'
                if (userSnap.exists()){
                    userName = userSnap.data().name || userName;
                }
                userFeedbackMap[uid].name = userName;
            }
            const feedbackByUserArray = Object.values(userFeedbackMap);
            setUsers(feedbackByUserArray);
        }
        catch(error){
            console.error("Error al obtenir el feedback", error);
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
        
        <div id='usuaris' className="container mt-4">
        <h1 id="title"  className="mb-4">Retroaccions dels usuaris</h1>
        <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="Cerca l'usuari" aria-label="Recipient's username" aria-describedby="basic-addon2" value= {searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        </div>
        <ul className="list-group">
        {currentUsers.map(user => {
            const totalFeedbacks = user.feedbacks.length || 0;
            const currentFeedback = feedbackperUser[user.userId] || 1;

            const indexOfLastFeedback = currentFeedback * feedbacksPerPage;
            const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
            const currentFeedbacktoDisplay = user.feedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);
            
            return (

            <li key={user.id} className="list-group-item">
                <h3 style={{display :'inline-block', marginBottom: '20px'}}>
                    {user.name}
                </h3>
            {currentFeedbacktoDisplay.map((fb) =>(
                <div key={fb.id}style={{marginLeft:'20px'}}>
                <p><strong>Comentari:</strong> {fb.comment}</p>
                <p><strong>Report:</strong> {fb.report}</p>
                </div>
            ))} 
            <nav>
            <ul className="pagination">
                {Array.from({ length: Math.ceil(totalFeedbacks / feedbacksPerPage) }, (_, index) => {
                    const page = index +1;
                    return (
                    <li
                        key={page}
                        className={`page-item ${currentFeedback === index + 1 ? 'active' : ''}`}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="page-link" onClick={() => handleFeedbackPageChange(user.userId, page)}>
                            {page}
                        </span>
                    </li>
                );
            })}
                 </ul>
             </nav>
         </li>
        );    
        })}
        </ul>
        {searchTerm.trim() === '' && (
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
            )} 
    </div>
    );
}

export default Feedback;