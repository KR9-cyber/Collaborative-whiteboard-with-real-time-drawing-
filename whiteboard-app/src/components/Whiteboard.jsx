import { useEffect, useRef, useState } from 'react';
import socket from '../utils/socket';
import Toolbar from './Toolbar';
import { useParams, useLocation } from 'react-router-dom';
import ShareModal from './ShareModal';
import jsPDF from "jspdf";
import { db } from "../utils/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, onDisconnect, onValue, set, remove } from "firebase/database";
import { rtdb } from "../utils/firebase";
import { v4 as uuidv4 } from "uuid"; // if not already imported




const Whiteboard = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const permission = query.get('permission') || 'edit';
  const canEdit = permission === 'edit';
  const [showModal, setShowModal] = useState(false);

  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  const [activeTool, setActiveTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  const toolRef = useRef(activeTool);
  const colorRef = useRef(color);
  const brushSizeRef = useRef(brushSize);

  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const isLoadingRef = useRef(false);
  const userId = useRef(uuidv4()); // Persistent ID for this session
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
const [tempUsername, setTempUsername] = useState('');



useEffect(() => {
  const storedName = localStorage.getItem('username');
  if (!storedName) {
    setIsUsernameModalOpen(true);
  } else {
    setUsername(storedName);
  }
}, []);







const saveCanvasToFirestore = async (roomId, canvas) => {
  if (!canvas || !canvas.getContext?.()) {
    console.error("❌ Fabric canvas is not ready yet");
    alert("Canvas not ready.");
    return;
  }

  try {
    const json = canvas.toDatalessJSON();
    await setDoc(doc(db, "whiteboards", roomId), {
      canvas: JSON.stringify(json),
      updatedAt: new Date().toISOString(),
    });
    alert("✅ Canvas saved to Firestore!");
  } catch (err) {
    console.error("Error saving canvas:", err);
    alert("❌ Error saving canvas");
  }
};




const loadCanvasFromFirestore = async (roomId, canvas) => {
  if (!canvas || !canvas.getContext?.()) {
    console.warn("Canvas is not initialized or not ready.");
    return;
  }

  try {
    const docRef = doc(db, "whiteboards", roomId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const json = JSON.parse(docSnap.data().canvas);
      isLoadingRef.current = true;

      canvas.loadFromJSON(json, () => {
        canvas.renderAll();
        isLoadingRef.current = false;
        console.log("✅ Canvas loaded from Firestore");
        const objects = canvas.getObjects().map(obj => {
          const objData = obj.toObject();
          objData.uuid = obj.uuid || crypto.randomUUID();
          return objData;
        });
        socket.emit('loaded-canvas', { roomId, objects });
      });
    } else {
      console.log("No canvas saved yet.");
    }
  } catch (err) {
    console.error("❌ Error loading canvas:", err);
    isLoadingRef.current = false;
  }
};





  useEffect(() => {
    toolRef.current = activeTool;
  }, [activeTool]);
  useEffect(() => {
    colorRef.current = color;
  }, [color]);
  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);


useEffect(() => {
  if (!userId || !roomId || !username) return;

  const userRef = ref(rtdb, `presence/${roomId}/${userId.current}`);

  // Mark this user as online with name
  set(userRef, {
    online: true,
    name: username,
    timestamp: Date.now(),
  });

  // Remove user on disconnect
  onDisconnect(userRef).remove();

  // Listen to all users in room
  const presenceRef = ref(rtdb, `presence/${roomId}`);
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val();
    setOnlineUsers(data || {}); // store full user objects now
  });

  // Cleanup
  return () => {
    remove(userRef);
    unsubscribe();
  };
}, [roomId, username]);



  useEffect(() => {
    const initFabric = async () => {
      const fabricModule = await import('fabric').then(mod => mod.fabric || mod.default || mod);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }

      const canvas = new fabricModule.Canvas(canvasRef.current, {
        backgroundColor: 'white',
        isDrawingMode: canEdit,
      });

      fabricModule.Object.prototype.toObject = (function (toObject) {
        return function (propertiesToInclude) {
          return toObject.call(this, (propertiesToInclude || []).concat(['uuid']));
        };
      })(fabricModule.Object.prototype.toObject);

      canvas.setHeight(600);
      canvas.setWidth(800);
      canvas.freeDrawingBrush = new fabricModule.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = colorRef.current;
      canvas.freeDrawingBrush.width = brushSizeRef.current;

      if (!canEdit) {
        canvas.selection = false;
        canvas.skipTargetFind = true;
      }

      const broadcastCanvas = () => {
        if (!canEdit) return;
        const objects = canvas.getObjects().map((obj) => obj.toObject({ uuid: obj.uuid }));
        socket.emit('sync-canvas', { roomId, objects });
      };

      // Drawing sync
      socket.on('receive-drawing', (pathData) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const { path, type, version, ...options } = pathData;
        let object;
        if (type === 'path') object = new fabricModule.Path(path, options);
        else if (type === 'rect') object = new fabricModule.Rect(options);
        else if (type === 'circle') object = new fabricModule.Circle(options);
        else if (type === 'textbox') object = new fabricModule.Textbox(options.text, options);

        if (object) {
          object.uuid = pathData.uuid;
          canvas.add(object);
          canvas.requestRenderAll();
        }
      });

      socket.on('receive-sync', (objects) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || !canvas.getContext()) {
          console.warn("☔ Canvas context unavailable, skipping sync.");
          return;


        }

        canvas.clear();
        canvas.backgroundColor = 'white';
        canvas.renderAll();

        fabricModule.util.enlivenObjects(objects, (enlivenedObjects) => {
          enlivenedObjects.forEach((obj) => canvas.add(obj));
          canvas.renderAll();
        });
      });

 

      socket.on('request-sync', ({ roomId: r }) => {
  const canvas = fabricCanvasRef.current;
  if (canvas) {
    const objects = canvas.getObjects().map((obj) => obj.toObject());
    socket.emit('sync-canvas', { roomId: r, objects });
  }
});


      // Undo listener
      socket.on('undo-action', ({ object }) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        const match = canvas.getObjects().find(o => o.uuid === object.uuid);
        if (match) {
          canvas.remove(match);
          canvas.requestRenderAll();
          redoStack.current.push(object);
        }
      });

      // Redo listener
      socket.on('redo-action', async ({ object }) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const mod = await import('fabric');
        const fabricModule = mod.fabric || mod.default || mod;

        let obj;
        const type = object.type?.toLowerCase();
        if (type === 'path') obj = new fabricModule.Path(object.path, object);
        else if (type === 'rect') obj = new fabricModule.Rect(object);
        else if (type === 'circle') obj = new fabricModule.Circle(object);
        else if (type === 'textbox') obj = new fabricModule.Textbox(object.text, object);

        if (obj) {
          obj.uuid = object.uuid;
          canvas.add(obj);
          canvas.requestRenderAll();
          undoStack.current.push(object);
        }
      });

      socket.on('loaded-canvas', async ({ roomId, objects }) => {
  // socket.to(roomId).emit('loaded-canvas', { roomId, objects });
  console.log(`✅ [Client] Loaded canvas received for room ${roomId}`, objects);
  const canvas = fabricCanvasRef.current;
  if (!canvas || !canvas.getContext()) return;
  const mod = await import('fabric');
  const fabricModule = mod.fabric || mod.default || mod;

  canvas.clear();
  canvas.backgroundColor = 'white';

  fabricModule.util.enlivenObjects(objects, (enlivenedObjects) => {
    // enlivenedObjects.forEach((obj) => canvas.add(obj));
    // canvas.renderAll();
    enlivenedObjects.forEach((obj) => {
      canvas.add(obj);
    });
    canvas.renderAll();
  });
});


      // Clear canvas listener
socket.on("clear-canvas", () => {
  const canvas = fabricCanvasRef.current;
  if (!canvas || !canvas.getContext()) {
    console.warn("☔ Canvas context unavailable for clear.");
    return;
  }
 
    canvas.clear();
    canvas.backgroundColor = "white";
    canvas.renderAll();
    undoStack.current = [];
    redoStack.current = [];
  
});


      // Object events
      canvas.on('path:created', (e) => {
        if (!canEdit || isLoadingRef.current) return;
        const pathData = e.path.toObject();
        pathData.type = 'path';
        pathData.uuid = crypto.randomUUID();
        e.path.uuid = pathData.uuid;

        socket.emit('drawing', { roomId, pathData });
        undoStack.current.push(pathData);
        redoStack.current = [];
      });

      canvas.on('object:modified', (e) => {
        if (!canEdit) return;
        const obj = e.target;
        if (!obj) return;

        const data = obj.toObject();
        data.type = obj.type;
        if (obj.type === 'textbox') {
          socket.emit('drawing', { roomId, pathData: data });
        } else {
          broadcastCanvas();
        }
      });

      // Shape tools
      let isDrawing = false;
      let origX = 0, origY = 0;
      let shape = null;

      canvas.on('mouse:down', (opt) => {
        if (!canEdit) return;
        const pointer = canvas.getPointer(opt.e);
        origX = pointer.x;
        origY = pointer.y;

        const tool = toolRef.current;
        const color = colorRef.current;

        if (tool === 'rectangle') {
          isDrawing = true;
          shape = new fabricModule.Rect({
            left: origX,
            top: origY,
            originX: 'left',
            originY: 'top',
            width: 0,
            height: 0,
            fill: color,
            selectable: false,
            uuid: crypto.randomUUID(),
          });
          canvas.add(shape);
        } else if (tool === 'circle') {
          isDrawing = true;
          shape = new fabricModule.Circle({
            left: origX,
            top: origY,
            originX: 'center',
            originY: 'center',
            radius: 1,
            fill: color,
            selectable: false,
            uuid: crypto.randomUUID(),
          });
          canvas.add(shape);
        } else if (tool === 'text') {
          const text = new fabricModule.Textbox('Type here', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 20,
            fill: color,
            editable: true,
            selectable: true,
            uuid: crypto.randomUUID(),
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          canvas.requestRenderAll();

          const textData = text.toObject();
          textData.type = 'textbox';
          textData.uuid = text.uuid;

          socket.emit('drawing', { roomId, pathData: textData });
          undoStack.current.push(textData);
          redoStack.current = [];
          setTimeout(() => text.enterEditing(), 0);
        }
      });

      canvas.on('mouse:move', (opt) => {
        if (!canEdit || !isDrawing || !shape) return;
        const pointer = canvas.getPointer(opt.e);

        if (toolRef.current === 'rectangle') {
          shape.set({
            width: Math.abs(pointer.x - origX),
            height: Math.abs(pointer.y - origY),
            left: Math.min(pointer.x, origX),
            top: Math.min(pointer.y, origY),
          });
        } else if (toolRef.current === 'circle') {
          const r = Math.sqrt((pointer.x - origX) ** 2 + (pointer.y - origY) ** 2) / 2;
          shape.set({
            radius: r,
            left: (pointer.x + origX) / 2,
            top: (pointer.y + origX) / 2,
          });
        }

        canvas.requestRenderAll();
      });

      canvas.on('mouse:up', () => {
        if (!canEdit) return;
        isDrawing = false;

        if (shape) {
          const shapeData = shape.toObject();
          shapeData.type = shape.type;
          socket.emit('drawing', { roomId, pathData: shapeData });
          undoStack.current.push(shapeData);
          redoStack.current = [];
        }

        shape = null;
      });

      fabricCanvasRef.current = canvas;
      try {
  const docSnap = await getDoc(doc(db, "whiteboards", roomId));
  if (docSnap.exists()) {
    const json = docSnap.data().canvas;
    canvas.loadFromJSON(json, () => canvas.renderAll());
  }
} catch (err) {
  console.error("Failed to load canvas from Firestore:", err);
}



    };

    initFabric();
    socket.emit('join-room', roomId);
    socket.emit('request-sync', { roomId });

    return () => {
      if (fabricCanvasRef.current) fabricCanvasRef.current.dispose();
      socket.off('receive-drawing');
      socket.off('receive-sync');
      socket.off('request-sync');
      socket.off('undo-action');
      socket.off('redo-action');
    };
  }, [roomId]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canEdit) return;

    if (toolRef.current === 'pencil') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = colorRef.current;
      canvas.freeDrawingBrush.width = brushSizeRef.current;
    } else if (toolRef.current === 'eraser') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = 'white';
      canvas.freeDrawingBrush.width = brushSizeRef.current + 10;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [activeTool, color, brushSize, canEdit]);

  const handleUndo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canEdit) return;

    const objects = canvas.getObjects();
    if (objects.length === 0) return;

    const last = objects[objects.length - 1];
    const lastData = last.toObject();

    redoStack.current.push(lastData);
    canvas.remove(last);
    canvas.requestRenderAll();

    socket.emit('undo-action', { roomId, object: lastData });
  };

  const handleRedo = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canEdit) return;
    if (redoStack.current.length === 0) return;

    const objectData = redoStack.current.pop();
    const mod = await import('fabric');
    const fabricModule = mod.fabric || mod.default || mod;

    let obj;
    const type = objectData.type?.toLowerCase();

    if (type === 'path') obj = new fabricModule.Path(objectData.path, objectData);
    else if (type === 'rect') obj = new fabricModule.Rect(objectData);
    else if (type === 'circle') obj = new fabricModule.Circle(objectData);
    else if (type === 'textbox') obj = new fabricModule.Textbox(objectData.text, objectData);

    if (obj) {
      obj.uuid = objectData.uuid;
      canvas.add(obj);
      canvas.requestRenderAll();
      undoStack.current.push(objectData);
      socket.emit('redo-action', { roomId, object: objectData });
    }
  };

  const clearCanvas = () => {
  const canvas = fabricCanvasRef.current;
  if (!canvas || !canEdit) return;
  canvas.clear();
  canvas.backgroundColor = "white";
  canvas.renderAll();
  undoStack.current = [];
  redoStack.current = [];
  socket.emit("clear-canvas", { roomId });
};

const exportAsImage = () => {
  const canvas = fabricCanvasRef.current;
  if (!canvas) return;
  const dataURL = canvas.toDataURL({
    format: 'png',
    multiplier: 2 // high-res
  });

  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'whiteboard.png';
  link.click();
};

const exportAsPDF = () => {
  const canvas = fabricCanvasRef.current;
  if (!canvas) return;

  const dataURL = canvas.toDataURL({
    format: 'png',
    multiplier: 2
  });

  const pdf = new jsPDF("l", "pt", [canvas.width, canvas.height]);
  pdf.addImage(dataURL, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save("whiteboard.pdf");
};








return (
  <div className="flex h-screen">
    {/* Left Sidebar: User List */}
    <div className="w-64 p-3 border-r flex flex-col space-y-3 bg-gray-100">
      <div className="bg-white rounded shadow p-3">
        <strong className="text-purple-600">👥 Online: {Object.keys(onlineUsers).length}</strong>
        <ul className="mt-2 space-y-1">
          {Object.entries(onlineUsers).map(([id, user]) => (
            <li key={id} className="text-gray-800">
              {id === userId.current
                ? "🟢 You"
                : `🟢 ${user?.name || id.slice(0, 5)}...`}
            </li>
          ))}
        </ul>
      </div>
      {!canEdit && (
        <div className="text-red-600 font-semibold text-sm">
          👀 Viewing in read-only mode
        </div>
      )}
    </div>

    {/* Main Area */}
    <div className="flex-1 flex flex-col p-4">
      

      {canEdit && (
  <div className="mb-3 flex flex-wrap items-center gap-2 p-3 rounded border bg-gray-50 shadow">
    {/* Tool Buttons */}
    <div className="flex items-center gap-2">
      {/* {["pencil", "rectangle", "circle", "text", "eraser"].map((tool) => (
        <button
          key={tool}
          onClick={() => setActiveTool(tool)}
          className={`px-3 py-2 rounded font-semibold transition ${
            activeTool === tool
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          {tool[0].toUpperCase() + tool.slice(1)}
        </button>
      ))} */}

      {["pencil", "rectangle", "circle", "text", "eraser"].map((tool) => (
  <button
    key={tool}
    onClick={() => {
      if (activeTool === tool) {
        setActiveTool(null);
      } else {
        setActiveTool(tool);
      }
    }}
    className={`px-3 py-2 rounded font-semibold transition ${
      activeTool === tool
        ? "bg-purple-600 text-white"
        : "bg-white text-gray-700 hover:bg-gray-200"
    }`}
  >
    {tool[0].toUpperCase() + tool.slice(1)}
  </button>
))}


      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="h-8 w-8 rounded border cursor-pointer"
      />
      <input
        type="range"
        value={brushSize}
        onChange={(e) => setBrushSize(parseInt(e.target.value))}
        className="w-24"
      />
      <button
        onClick={handleUndo}
        className="bg-gray-200 hover:bg-gray-300 rounded px-3 py-2 font-semibold"
      >
        Undo
      </button>
      <button
        onClick={handleRedo}
        className="bg-gray-200 hover:bg-gray-300 rounded px-3 py-2 font-semibold"
      >
        Redo
      </button>
    </div>

    {/* Action Buttons */}
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => setShowModal(true)}
        className="text-gray-800 
  font-semibold 
  rounded 
  border 
  border-blue-600 
  bg-white 
  hover:bg-gray-100 
  px-3 
  py-2"
      >
        Share Room
      </button>
      <button
        onClick={clearCanvas}
        className="text-gray-800 
  font-semibold 
  rounded 
  border 
  border-blue-600 
  bg-white 
  hover:bg-gray-100 
  px-3 
  py-2"
      >
        Clear Canvas
      </button>
      <button
        onClick={() => loadCanvasFromFirestore(roomId, fabricCanvasRef.current)}
        className="text-gray-800 
  font-semibold 
  rounded 
  border 
  border-blue-600 
  bg-white 
  hover:bg-gray-100 
  px-3 
  py-2"
      >
        Load Canvas
      </button>
      <button
        onClick={exportAsImage}
        className="text-gray-800 
  font-semibold 
  rounded 
  border 
  border-blue-600 
  bg-white 
  hover:bg-gray-100 
  px-3 
  py-2"
      >
        Export as Image
      </button>
      <button
        onClick={exportAsPDF}
        className="text-gray-800 
  font-semibold 
  rounded 
  border 
  border-blue-600 
  bg-white 
  hover:bg-gray-100 
  px-3 
  py-2"
      >
        Export as PDF
      </button>
      <button
        onClick={() =>
          saveCanvasToFirestore(roomId, fabricCanvasRef.current)
        }
        className="text-gray-800 
  font-semibold 
  rounded 
  border 
  border-blue-600 
  bg-white 
  hover:bg-gray-100 
  px-3 
  py-2"
      >
        Save Canvas
      </button>
    </div>
  </div>
)}

      <div className="flex flex-1 items-center justify-center">
        <canvas ref={canvasRef} className="border rounded shadow" />
      </div>
    </div>

    <ShareModal
      roomId={roomId}
      isOpen={showModal}
      onClose={() => setShowModal(false)}
    />
    {isUsernameModalOpen && (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-lg w-80">
          <h2 className="text-lg font-bold mb-4">Enter Your Name</h2>
          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Your Name"
            className="border rounded w-full p-2"
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => {
                if (tempUsername.trim()) {
                  setUsername(tempUsername.trim());
                  localStorage.setItem("username", tempUsername.trim());
                  setIsUsernameModalOpen(false);
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

};

export default Whiteboard;







