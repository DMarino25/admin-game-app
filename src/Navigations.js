import React from 'react';
import logo from './logo.png';
import ReactDOM from 'react-dom/client';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './styles/styles.css';
import { getFirestore, collection, getDocs,query,where } from 'firebase/firestore';
import { app } from './firebase'; 
import AllUsers from './AllUsers';

function Navigation(){

    const navigate = useNavigate();
    const handleLogout = () => {
        alert("Sesión cerrada");
        navigate('/'); 
      };
    
    const handleM= () => {
        navigate('/all-users'); 
    };

    const handleRM= () => {
        navigate('/reported-messages'); 
    };
    const handleProfiles= () => {
        navigate('/banned-users'); 
    };

      return (
        
        <nav id="navigation" className="navbar navbar-expand-lg">
          <div className="container-fluid">
          <img src={logo} className="logo-rounded me-2" alt="logo" />
          <strong>  Admin GameApp</strong>
            <button id= "buttonNav" button className="button btn-info ms-4 rounded" type="button" onClick={handleM} data-bs-toggle="collapse" data-bs-target="#navbarNav">
              Missatgeria directa
            </button>
            <button id= "buttonNav" button className="button btn-info ms-4 rounded" type="button"  onClick={handleProfiles}data-bs-toggle="collapse" data-bs-target="#navbarNav">
              Usuaris banejats
            </button>
            <button id= "buttonNav" button className="button btn-info ms-4 rounded" type="button" onClick={handleRM} data-bs-toggle="collapse" data-bs-target="#navbarNav">
             Missatges reportats
            </button>
              <button id ="butClose" button className="btn btn-info ms-auto" onClick={handleLogout}>
                Tanca Sessió
              </button>
          
          </div>
        </nav>
      );

}
export default Navigation