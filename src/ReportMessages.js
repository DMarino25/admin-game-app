import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from './firebase'; 
import { FaUser, FaCommentDots } from 'react-icons/fa';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import './styles/styles.css';

function ReportMessages() {
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 2;
  const db = getFirestore(app);
  const [reportsList, setReportsList] = useState([]);

  const listReports = useCallback(async () => {
    try {
      const reports = collection(db, 'reports');
      const querySnapshot = await getDocs(query(reports, where("solved", "==", false)));
      const reportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const uniqueReports = reportsData.reduce((acc, report) => {
        const key = report.replyId 
          ? `${report.replyId}-${report.commentId}` 
          : `${report.commentId}-null`; 
        if (!acc[key]) acc[key] = report;
        return acc;
      }, {});

      const infoReport = await Promise.all(
        Object.values(uniqueReports).map(async report => {
          const reporterRef = doc(db, 'users', report.reporterId);
          const reporterSnap = await getDoc(reporterRef);
          const reporterName = reporterSnap.exists() ? reporterSnap.data().name : 'Usuari no trobat';

          const userRef = doc(db, 'users', report.userId);
          const userSnap = await getDoc(userRef);
          const userName = userSnap.exists() ? userSnap.data().name : 'Usuari no trobat';

          let textContent = 'Missatge no trobat';
          let originalCommentText = '';
          const forums = collection(db, 'forums');
          const forumSnapshot = await getDocs(forums);

          for (const forum of forumSnapshot.docs) {
            const commentsCollection = collection(forum.ref, 'comments');
            if (report.replyId) {
              const commentRef = doc(commentsCollection, report.commentId);
              const commentSnap = await getDoc(commentRef);
              if (commentSnap.exists()) {
                originalCommentText = commentSnap.data().commentText || 'Comentario original no disponible';
              }

              const replyRef = doc(commentsCollection, report.commentId, 'replies', report.replyId);
              const replySnap = await getDoc(replyRef);
              if (replySnap.exists()) {
                textContent = replySnap.data().replyText || 'Contenido de respuesta no disponible';
                break;
              }
            } else {
              const commentRef = doc(commentsCollection, report.commentId);
              const commentSnap = await getDoc(commentRef);
              if (commentSnap.exists()) {
                textContent = commentSnap.data().commentText || 'Contenido no disponible';
                break;
              }
            }
          }

          return {
            ...report,
            reporterName,
            userName,
            textContent,
            originalCommentText,
          };
        })
      );
      setReportsList(infoReport);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  }, [db]); // Include db as a dependency if necessary (optional based on how db is defined)

  useEffect(() => {
    listReports();
  }, [listReports]); // Now this won't trigger unnecessary reruns

  const handleAccept = async (report) => {
    try {
      // Update the user's reportedCount
      const userRef = doc(db, 'users', report.userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      let reportedCount = userData?.reportedCount || 0;
      reportedCount += 1;
  
      // If reportedCount reaches 5, check if the user is already banned
      if (reportedCount >= 5) {
        // Check if the user is already in the bannedUsers collection
        const bannedUserRef = collection(db, 'bannedUsers');
        const bannedQuery = query(bannedUserRef, where("userId", "==", report.userId));
        const bannedSnapshot = await getDocs(bannedQuery);
  
        // If the user is not already banned, add them to the bannedUsers collection
        if (bannedSnapshot.empty) {
          await addDoc(bannedUserRef, {
            email: userData.email,
            name: userData.name,
            userId: report.userId,
          });
          console.log('User has been banned');
        } else {
          console.log('User is already banned');
        }
      }
  
      // Update the user's reportedCount field
      await updateDoc(userRef, { reportedCount });
  
      // Update the report to mark it as solved
      const reportRef = doc(db, 'reports', report.id);
      await updateDoc(reportRef, { solved: true });
  
      // Update the UI by filtering out solved reports
      setReportsList(prevReports => prevReports.filter(item => item.id !== report.id));
  
    } catch (error) {
      console.error('Error handling accept:', error);
    }
  };
  
  const handleReject = async (report) => {
    try {
      // Delete the report from the reports collection
      const reportRef = doc(db, 'reports', report.id);
      await deleteDoc(reportRef);

      // Update the UI
      setReportsList(prevReports => prevReports.filter(item => item.id !== report.id));
    } catch (error) {
      console.error('Error handling reject:', error);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = '#F5F5F5';
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
  const currentReports = reportsList.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div id="reportedComments" className="container mt-4">
      <h1 id="title"  className="mb-4 text-center">Missatges Reportats</h1>
      <div className="row">
        {currentReports.map(report => (
          <div key={report.id} className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <FaUser className="me-2" />
                <strong>Usuari Reportant:</strong> {report.reporterName}
              </div>
              <div className="card-body">
                <p className="bg-light p-2 rounded">
                  <FaUser className="me-2" />
                  <strong>Usuari Missatge:</strong> {report.userName}
                </p>
                {/* If it's a reply, display the original comment text */}
                {report.originalCommentText && (
                  <p className="bg-info p-2 rounded ms-3 mt-2">
                    <strong>Comentari Original:</strong> {report.originalCommentText}
                  </p>
                )}
                <p className="bg-light p-2 rounded">
                  <FaCommentDots className="me-2" />
                  <strong>Missatge:</strong> {report.textContent}
                </p>
              </div>
              <div className="card-footer text-muted text-end">
                <button className="btn btn-success me-2" onClick={() => handleAccept(report)}>
                  Acceptar
                </button>
                <button className="btn btn-danger" onClick={() => handleReject(report)}>
                  Rebutjar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <nav>
          <ul className="pagination">
              {Array.from({ length: Math.ceil(reportsList.length / itemsPerPage) }, (_, index) => (
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

export default ReportMessages;