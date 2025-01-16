import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { app } from "./firebase";

function Feedback() {
  const db = getFirestore(app);

  const [searchTerm, setSearchTerm] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const feedbacksPerPage = 1;
  const [feedbackPagination, setFeedbackPagination] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "feedbacks"), async (snapshot) => {
      const feedbackMap = {};

      for (const doc of snapshot.docs) {
        const feedbackData = doc.data();
        const userId = feedbackData.userId;

        if (!feedbackMap[userId]) {
          feedbackMap[userId] = {
            userId,
            feedbacks: [],
          };
        }
        feedbackMap[userId].feedbacks.push({
          id: doc.id,
          comment: feedbackData.comment || "Sense comentari",
          report: feedbackData.report || "Sense report",
        });
      }

      const userIds = Object.keys(feedbackMap);
      for (const userId of userIds) {
        const userDoc = await getDoc(doc(db, "users", userId));

        feedbackMap[userId].name = userDoc.exists()
          ? userDoc.data().name || "Usuari no trobat"
          : "Usuari no trobat";
      }

      setUsersList(Object.values(feedbackMap));
    });

    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleFeedbackPageChange = (userId, newPage) => {
    setFeedbackPagination((prev) => ({
      ...prev,
      [userId]: newPage,
    }));
  };

  const filteredUsers = usersList.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div id="usuaris" className="container mt-4">
      <h1 id="title" className="mb-4">
        Retroaccions dels usuaris
      </h1>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Cerca l'usuari"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul className="list-group">
        {currentUsers.map((user) => {
          const totalFeedbacks = user.feedbacks.length;
          const currentFeedbackPage = feedbackPagination[user.userId] || 1;

          const indexOfLastFeedback = currentFeedbackPage * feedbacksPerPage;
          const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
          const currentFeedbacks = user.feedbacks.slice(
            indexOfFirstFeedback,
            indexOfLastFeedback
          );

          return (
            <li key={user.userId} className="list-group-item">
              <h3>{user.name}</h3>
              {currentFeedbacks.map((feedback) => (
                <div key={feedback.id} style={{ marginLeft: "20px" }}>
                  <p>
                    <strong>Comentari:</strong> {feedback.comment}
                  </p>
                  <p>
                    <strong>Report:</strong> {feedback.report}
                  </p>
                </div>
              ))}
              <nav>
                <ul className="pagination">
                  {Array.from(
                    {
                      length: Math.ceil(totalFeedbacks / feedbacksPerPage),
                    },
                    (_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${
                          currentFeedbackPage === index + 1 ? "active" : ""
                        }`}
                      >
                        <span
                          className="page-link"
                          onClick={() =>
                            handleFeedbackPageChange(user.userId, index + 1)
                          }
                        >
                          {index + 1}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            </li>
          );
        })}
      </ul>
      {searchTerm.trim() === "" && (
        <nav>
          <ul className="pagination">
            {Array.from(
              {
                length: Math.ceil(filteredUsers.length / itemsPerPage),
              },
              (_, index) => (
                <li
                  key={index + 1}
                  className={`page-item ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                >
                  <span
                    className="page-link"
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </span>
                </li>
              )
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}

export default Feedback;
