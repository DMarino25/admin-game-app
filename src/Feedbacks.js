import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc, where, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebase';
import { useUser } from './UserContext';



function Feedback() {
    const db = getFirestore(app);
    const auth = getAuth(app);
    const [usersList, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); 
    const itemsPerPage = 2;

    const listUsers = async() =>{
    try{
        const feedback= collection(db, 'feedbacks');
        const querySnapshot = await getDocs(feedback);

        const usersList = await Promise.all(
            querySnapshot.docs.map(async(feedbackDoc)=>{

                const feedbackData = feedbackDoc.data();
                const userId = feedbackData.userId;

                const user = doc(db,'users', userId);
                const userSnap = await getDoc(user);

                let userName = 'Usuari no trobat'
                userName = userSnap.data().name;
                return {id:feedbackDoc.id, name:userName, comment: feedbackData.comment || "Sense comentari", report:feedbackData.report || "Sense report" ,...feedbackData,};
            })
        );

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
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = usersList.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div id='usuaris'div className="container mt-4">
        <h1 className="mb-4">Feedback dels usuaris</h1>
        <ul className="list-group">
        {currentUsers.map(user => (
            <li key={user.id} className="list-group-item">
                <div>  
                    <h3 style={{display :'inline-block', marginBottom: '20px'}}>
                    {user.name}
                    </h3>
                </div>  
            
            <div>
                <p><strong>Comentari:</strong> {user.comment}</p>
                <p><strong>Report:</strong> {user.report}</p>
            </div>
            </li>
           
        ))}
        
        </ul>
        <nav>
                <ul className="pagination">
                    {Array.from({ length: Math.ceil(usersList.length / itemsPerPage) }, (_, index) => (
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

export default Feedback;