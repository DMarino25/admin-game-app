import React from 'react';
import logo from './logo.png';
import { useNavigate } from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/styles.css';

function Navigation() {
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("Sessió tancada");
    navigate('/');
  };

  const handleM = () => navigate('/all-users');
  const handleRM = () => navigate('/reported-messages');
  const handleProfiles = () => navigate('/banned-users');
  const handleFB = () => navigate('/feedback');

  return (
    <nav id="navigation" className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <div className="navbar-brand d-flex align-items-center">
          <img src={logo} className="logo-rounded me-2" alt="logo" />
          <strong className="me-3">Admin GameApp</strong>
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Alterna la navegació"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto d-flex flex-column flex-lg-row gap-2 gap-lg-0">
            <li className="nav-item">
              <button
                id="buttonNav"
                className="button btn-info ms-1"
                type="button"
                onClick={handleM}
                data-bs-target="#navbarNav"
              >
                Usuaris
              </button>
            </li>
            <li className="nav-item">
              <button
                id="buttonNav"
                className="button btn-info ms-1"
                type="button"
                onClick={handleProfiles}
                data-bs-target="#navbarNav"
              >
                Usuaris bloquejats
              </button>
            </li>
            <li className="nav-item">
              <button
                id="buttonNav"
                className="button btn-info ms-1"
                type="button"
                onClick={handleRM}
                data-bs-target="#navbarNav"
              >
                Missatges reportats
              </button>
            </li>
            <li className="nav-item">
              <button
                id="buttonNav"
                className="button btn-info ms-1"
                type="button"
                onClick={handleFB}
                data-bs-target="#navbarNav"
              >
                Retroaccions
              </button>
            </li>
          </ul>
          <ul className="navbar-nav d-flex flex-column flex-lg-row gap-2 gap-lg-0">
            <li className="nav-item">
              <button
                id="butClose"
                className="btn btn-danger mt-2 mt-lg-0"
                onClick={handleLogout}
              >
                Tanca Sessió
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
