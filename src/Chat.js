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

function Chat() {
 return (
    <button id="chat" className='btn btn-primary me-2' >
    <i class="bi bi-chat"></i>
  </button>
 );
}

export default Chat;
