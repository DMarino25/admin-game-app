import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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
import { getAuth } from "firebase/auth";
import { app } from "./firebase";
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
  const scrollRef = useRef(null);
  const db = getFirestore(app);
  const { user, peerUserId } = useUser();
  const currentUserId = user ? user.uid : null;

  // Fetch user photo URLs
  useEffect(() => {
    if (!currentUserId || !peerUserId) return;

    const fetchUserPhotos = async () => {
      const currentUserRef = doc(db, "users", currentUserId);
      const peerUserRef = doc(db, "users", peerUserId);

      try {
        const currentUserDoc = await getDoc(currentUserRef);
        const peerUserDoc = await getDoc(peerUserRef);
        setCurrentUserPhotoUrl(currentUserDoc.data()?.photoUrl || "");
        setPeerUserPhotoUrl(peerUserDoc.data()?.photoUrl || "");
      } catch (error) {
        console.error("Error fetching user photos:", error);
      }
    };

    fetchUserPhotos();
  }, [currentUserId, peerUserId, db]);

  // Determine chat ID and fetch messages
  useEffect(() => {
    if (!currentUserId || !peerUserId) return;

    const determineChatId = async () => {
      const possibleChatId1 = `${currentUserId}_${peerUserId}`;
      const possibleChatId2 = `${peerUserId}_${currentUserId}`;

      const chatRef1 = doc(db, "messages", possibleChatId1);
      const chatRef2 = doc(db, "messages", possibleChatId2);

      const chatDoc1 = await getDoc(chatRef1);
      const chatDoc2 = await getDoc(chatRef2);

      if (chatDoc1.exists()) {
        setChatId(possibleChatId1);
        return possibleChatId1;
      } else if (chatDoc2.exists()) {
        setChatId(possibleChatId2);
        return possibleChatId2;
      } else {
        const newChatRef = doc(db, "messages", possibleChatId1);
        await setDoc(newChatRef, {
          participants: [currentUserId, peerUserId],
        });
        setChatId(possibleChatId1);
        return possibleChatId1;
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
  }, [currentUserId, peerUserId, db]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !peerUserId || !chatId) return;

    try {
      const chatRef = collection(db, "messages", chatId, "chat");
      await addDoc(chatRef, {
        messageText: newMessage.trim(),
        senderId: currentUserId,
        timestamp: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <section>
      <div className="container py-5">
        <div className="row d-flex justify-content-center">
          <div className="col-md-10 col-lg-8 col-xl-6">
            <div className="card" id="chat2">
              <div className="card-header d-flex justify-content-between align-items-center p-3">
                <h5 className="mb-0">Chat {peerUserId}</h5>
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
                      msg.senderId === currentUserId
                        ? "justify-content-end mb-4 pt-1"
                        : "justify-content-start mb-4"
                    }`}
                  >
                    {msg.senderId !== currentUserId && (
                      <img
                        src={peerUserPhotoUrl || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"}
                        alt="Peer Avatar"
                        style={{ width: "45px", height: "100%" }}
                      />
                    )}
                    <div>
                      <p
                        className={`small p-2 ${
                          msg.senderId === currentUserId
                            ? "me-3 text-white rounded-3 bg-primary"
                            : "ms-3 rounded-3 bg-body-tertiary"
                        }`}
                      >
                        {msg.messageText}
                      </p>
                    </div>
                    {msg.senderId === currentUserId && (
                      <img
                        src={currentUserPhotoUrl || "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp"}
                        alt="Your Avatar"
                        style={{ width: "45px", height: "100%" }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="card-footer text-muted d-flex justify-content-start align-items-center p-3">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Type message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <button className="btn btn-primary ms-3" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Chat;