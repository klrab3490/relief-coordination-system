
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<div>Welcome to the Relief Coordination System</div>} />
      </Routes>
    </Router>
  )
}

export default App

