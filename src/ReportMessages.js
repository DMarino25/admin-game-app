import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './styles/styles.css';
import { getFirestore, collection, getDocs,query,where, doc, getDoc } from 'firebase/firestore';
import { app } from './firebase'; 

function ReportMessages() {
  const db = getFirestore(app);
  const [reportsList, setReportsList] = useState([]);

  
  const listReports = async() =>{
    try{
      const reports= collection(db, 'reports');
      const querySnapshot = await getDocs(reports);
      const reportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) .filter(report => report.commentId);;
      
      const infoReport = await Promise.all(
        reportsData.map(async report => {
          const userRef = doc (db, 'users', report.reporterId);
          const userSnap = await getDoc(userRef)
          const userName = userSnap.exists() ? userSnap.data().name : 'Usuari no trobat';


          let commentText = 'Comentari no trobat';
          const forums= collection(db, 'forums');
          const forumSnapshot = await getDocs(forums);

          for (const forum of forumSnapshot.docs) {
            const comment = collection(forum.ref, 'comments');
            console.log("Buscando commentId:", report.commentId, "en forum ID:", forum.id);
            const commentRef = doc(comment, report.commentId);
            const commentSnap = await getDoc(commentRef);

           if (commentSnap.exists()) {
        commentText = commentSnap.data().commentText || "Contenido no disponible";
        break;
    } else {
        console.error("Comentario no encontrado:", report.commentId, "en forum:", forum.id);
    }
          }

          return {
            ...report,
            userName,
            commentText,
          };
        })
      );
      setReportsList(infoReport); 
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
    listReports();
  }, []);
    return (
      <div id='reportedComments' className="container mt-4">
      <h1 className="mb-4">Missatges Reportats</h1>
      <ul className="list-group">
        {reportsList.map(report => (
          <li key={report.id} className="list-group-item">
            <p><strong>Usuari Reportant:</strong> {report.userName}</p>
            <p><strong>Comentari:</strong> {report.commentText}</p>
          </li>
        ))}
      </ul>
    </div>
    );
  }
  
  export default ReportMessages;