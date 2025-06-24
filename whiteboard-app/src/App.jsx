

import { Routes, Route, useNavigate } from 'react-router-dom';
import Whiteboard from './components/Whiteboard';
import { useState } from 'react';

function App() {
  const [roomInput, setRoomInput] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (roomInput.trim()) {
      navigate(`/${roomInput.trim()}`);
    }
  };

  return (
    <Routes>
      {/* Home Page Route */}
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Collab Whiteboard</h1>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="Enter Room ID"
                className="p-2 border rounded"
              />
              <button
                onClick={handleJoinRoom}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Join Room
              </button>
            </div>
          </div>
        }
      />

      {/* Room Route */}
      <Route path="/:roomId" element={<Whiteboard />} />
    </Routes>
  );
}

export default App;

