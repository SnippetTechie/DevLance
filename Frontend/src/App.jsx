import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Wallet from "./pages/Wallet";
import Home from './pages/Home';
import TaskDetail from "./pages/TaskDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/task/:id" element={<TaskDetail />} /> 
      </Routes>
    </Router>
  );
}

export default App;
