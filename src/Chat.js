import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  query,
  onSnapshot,
  addDoc,
  orderBy,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { app } from "./firebase";
import Navbar from "./Navigations"; // Import Navbar component
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/styles.css";
import { useUser } from "./UserContext";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [currentUserPhotoUrl, setCurrentUserPhotoUrl] = useState("");
  const [peerUserPhotoUrl, setPeerUserPhotoUrl] = useState("");
  const [peerUserName, setPeerUserName] = useState("");
  const scrollRef = useRef(null);
  const db = getFirestore(app);
  const { userId, peerUserId } = useUser();

  const navigate = useNavigate();

  // Fetch user photo URLs and peer user's name
  useEffect(() => {
    if (!userId || !peerUserId) return;

    const fetchUserDetails = async () => {
      try {
        const currentUserDoc = await getDoc(doc(db, "users", userId));
        const peerUserDoc = await getDoc(doc(db, "users", peerUserId));

        setCurrentUserPhotoUrl(currentUserDoc.data()?.photoUrl || "default-current-avatar-url");
        setPeerUserPhotoUrl(peerUserDoc.data()?.photoUrl || "default-peer-avatar-url");
        setPeerUserName(peerUserDoc.data()?.name || "Usuari eliminat");
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [userId, peerUserId, db]);

  // Determine chat ID and fetch messages
  useEffect(() => {
    if (!userId || !peerUserId) return;

    const determineChatId = async () => {
      const possibleChatId1 = `${userId}_${peerUserId}`;
      const possibleChatId2 = `${peerUserId}_${userId}`;

      try {
        const chatDoc1 = await getDoc(doc(db, "messages", possibleChatId1));
        const chatDoc2 = await getDoc(doc(db, "messages", possibleChatId2));

        if (chatDoc1.exists()) {
          setChatId(possibleChatId1);
          return possibleChatId1;
        } else if (chatDoc2.exists()) {
          setChatId(possibleChatId2);
          return possibleChatId2;
        } else {
          await setDoc(doc(db, "messages", possibleChatId1), {
            participants: [userId, peerUserId],
          });
          setChatId(possibleChatId1);
          return possibleChatId1;
        }
      } catch (error) {
        console.error("Error determining chat ID:", error);
      }
    };

    const fetchMessages = async () => {
      const determinedChatId = await determineChatId();
      const chatSubCollection = collection(db, "messages", determinedChatId, "chat");
      const chatQuery = query(chatSubCollection, orderBy("timestamp"));

      const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
        const chatData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(chatData);
      });

      return () => unsubscribe();
    };

    fetchMessages();
  }, [userId, peerUserId, db]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !peerUserId || !chatId) return;

    try {
      const chatRef = collection(db, "messages", chatId, "chat");
      await addDoc(chatRef, {
        messageText: newMessage.trim(),
        senderId: userId,
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <>
      <Navbar /> {/* Include the navbar */}

      <section>
        <div className="container py-5">
          <div className="row d-flex justify-content-center">
            <div className="col-md-10 col-lg-8 col-xl-6">
              <div className="card" id="chat2">
                <div className="card-header d-flex justify-content-between align-items-center p-3">
                  <h5 className="mb-0">{peerUserName}</h5>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate("/all-users")}
                  >
                    Enrere
                  </button>
                </div>

                <div
                  className="card-body"
                  ref={scrollRef}
                  style={{
                    position: "relative",
                    height: "400px",
                    overflowY: "scroll",
                    padding: "10px",
                  }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`d-flex flex-row ${
                        msg.senderId === userId
                          ? "justify-content-end mb-4 pt-1"
                          : "justify-content-start mb-4"
                      }`}
                    >
                      {msg.senderId !== userId && (
                        <img
                          src={peerUserPhotoUrl}
                          alt="Peer Avatar"
                          style={{
                            width: "45px",
                            height: "45px",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                      <div>
                        <p
                          className={`small p-2 ${
                            msg.senderId === userId
                              ? "me-3 text-white rounded-3 bg-primary"
                              : "ms-3 rounded-3 bg-body-tertiary"
                          }`}
                        >
                          {msg.messageText}
                          <br />
                        </p>
                        <small className="text-muted">
                          {/*msg.timestamp?.toDate()?.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) || ""*/}
                        </small>
                      </div>
                      {msg.senderId === userId && (
                        <img
                          src={currentUserPhotoUrl}
                          alt="Your Avatar"
                          style={{
                            width: "45px",
                            height: "45px",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="card-footer text-muted d-flex justify-content-start align-items-center p-3">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Escriu el teu missatge"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                  />
                  <button className="btn btn-primary ms-3" onClick={sendMessage}>
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Chat;