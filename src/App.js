import React from 'react';

import ReactDOM from 'react-dom/client';
import { Routes, Route, useNavigate, BrowserRouter } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/styles.css';
import { getFirestore, collection, getDocs,query,where } from 'firebase/firestore';
import { app } from './firebase'; 
import AllUsers from './AllUsers';
import Login from './Login';
import Navigation from './Navigations'
import BannedUsers from './BannedUsers'
import ReportMessage from './ReportMessages'
import Chat from './Chat'
import Feedback from './Feedbacks'

function App() {
 
  
  /*useEffect(() =>{
    const interval = setInterval(() =>{
      window.location.reload();
    },10_000);
    return () => clearInterval(interval);
  },[]);*/

  return (
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/all-users" element={<><Navigation /><AllUsers /> </>} />
      <Route path="/all-users/chat" element={<Chat />} />
      <Route path="/banned-users" element={<><Navigation /><BannedUsers /> </>} />
      <Route path="/reported-messages" element={<><Navigation /><ReportMessage /> </>} />
      <Route path="/feedback" element={<><Navigation /><Feedback /> </>} />
    </Routes>
 );
}

export default App;
