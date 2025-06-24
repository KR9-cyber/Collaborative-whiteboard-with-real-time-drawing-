
// import { useNavigate } from 'react-router-dom';

// const CreateOrJoinRoom = () => {
//   const navigate = useNavigate();

//   const handleCreateRoom = () => {
//     const newRoomId = Math.random().toString(36).substring(2, 8); // short random ID
//     navigate(`/${newRoomId}`);
//   };

//   const handleJoinRoom = (e) => {
//     e.preventDefault();
//     const roomId = e.target.roomId.value.trim();
//     if (roomId) navigate(`/${roomId}`);
//   };

//   return (
//     <div>
//       <button onClick={handleCreateRoom} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
//         Create New Room
//       </button>

//       <form onSubmit={handleJoinRoom} className="flex gap-2">
//         <input
//           type="text"
//           name="roomId"
//           placeholder="Enter Room ID"
//           className="border px-2 py-1"
//         />
//         <button type="submit" className="bg-green-500 text-white px-4 py-1 rounded">
//           Join Room
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateOrJoinRoom;

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const CreateOrJoinRoom = () => {
  const navigate = useNavigate();

  // New state for room access control
  const [accessType, setAccessType] = useState('public');
  const [permission, setPermission] = useState('edit');

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8); // short random ID
    navigate(`/${newRoomId}?accessType=${accessType}&permission=${permission}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    const roomId = e.target.roomId.value.trim();
    if (roomId) {
      navigate(`/${roomId}?accessType=${accessType}&permission=${permission}`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div>
          <label className="block mb-1 font-semibold">Room Type:</label>
          <select
            value={accessType}
            onChange={(e) => setAccessType(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Permission:</label>
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="edit">Edit</option>
            <option value="view">View Only</option>
          </select>
        </div>
      </div>

      <button onClick={handleCreateRoom} className="bg-blue-500 text-white px-4 py-2 rounded">
        Create New Room
      </button>

      <form onSubmit={handleJoinRoom} className="flex gap-2">
        <input
          type="text"
          name="roomId"
          placeholder="Enter Room ID"
          className="border px-2 py-1"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-1 rounded">
          Join Room
        </button>
      </form>
    </div>
  );
};

export default CreateOrJoinRoom;

