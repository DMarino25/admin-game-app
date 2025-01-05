import React from 'react';
import logo from './logo.png';
import ReactDOM from 'react-dom/client';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
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
    const handleFB= () => {
      navigate('/feedback'); 
  };

      return (
        
        <nav id="navigation" className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href="#!">
            <img src={logo} className="logo-rounded me-2" alt="logo" />
            <strong className="me-3">  Admin GameApp</strong>
          </a>
          <button className="navbar-toggler" type='button' data-bs-toggle="collapse" data-bs-target="#navbarNav"
              aria-controls="navbarNav"  aria-expanded="false" aria-label="Toggle navigation">
                <span className='navbar-toggler-icon'></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className= "navbar-nav me-auto d-flex flex-column flex-lg-row gap-2 gap-lg-0">
              <li className='nav-item'>
                <button id= "buttonNav" button className="button btn-info ms-1" type="button" onClick={handleM} data-bs-toggle="collapse" data-bs-target="#navbarNav">
                  Usuaris
                </button>
              </li>
              <li className='nav-item'>
                <button id= "buttonNav" button className="button btn-info ms-1" type="button"  onClick={handleProfiles}data-bs-toggle="collapse" data-bs-target="#navbarNav">
                  Usuaris bloquejats
                </button>
              </li>
              <li className='nav-item'>
                <button id= "buttonNav" button className="button btn-info ms-1" type="button" onClick={handleRM} data-bs-toggle="collapse" data-bs-target="#navbarNav">
                Missatges reportats
                </button>
              </li>
              <li className='nav-item'>
                <button id= "buttonNav" button className="button btn-info ms-1" type="button" onClick={handleFB} data-bs-toggle="collapse" data-bs-target="#navbarNav">
                Feedback
                </button>
              </li>
              </ul>
            <ul className='navbar-nav d-flex flex-column flex-lg-row gap-2 gap-lg-0'>
              <li className='nav-item'>
                  <button id ="butClose" button className="btn btn-danger mt-2 mt-lg-0" onClick={handleLogout}>
                    Tanca Sessió
                  </button>
              </li>
              </ul>
          </div>
          </div>
        </nav>
      );

}
export default Navigation