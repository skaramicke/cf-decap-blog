import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Admin from "./Admin";

function App() {
  return (
    <Router>
      <Route path="/admin" element={<Admin />} />
      <Route path="/" element={<div>Home</div>} />
    </Router>
  );
}

export default App;
