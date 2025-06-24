import React from 'react';

const Toolbar = ({ 
  activeTool, 
  setActiveTool, 
  color, 
  setColor, 
  brushSize, 
  setBrushSize,
  onUndo,
  onRedo 
}) => {
  const handleToolClick = (tool) => {
    if (activeTool === tool) {
      setActiveTool(null);
    } else {
      setActiveTool(tool);
    }
  };
  
  const tools = ['pencil', 'rectangle', 'circle', 'text', 'eraser'];

  return (
    <div className="flex gap-3 mb-4 items-center flex-wrap">
      {tools.map((tool) => (
        <button
          key={tool}
          onClick={() => handleToolClick(tool)}
          className={`px-3 py-1 rounded capitalize font-medium border 
            ${activeTool === tool 
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
              : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
            }`}
        >
          {tool}
        </button>
      ))}

      <label className="ml-4 flex items-center">
        <span className="mr-2 text-gray-700">Color:</span>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          title="Brush Color"
          className="w-9 h-9 p-0 rounded border border-gray-300 cursor-pointer"
        />
      </label>

      <div className="flex items-center ml-4">
        <span className="mr-2 text-gray-700">Size:</span>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          title="Brush Size"
          className="cursor-pointer"
        />
      </div>

      <div className="ml-4 flex gap-2">
        <button
          onClick={onUndo}
          className="px-3 py-1 rounded font-medium border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200"
          title="Undo"
        >
          Undo
        </button>
        <button
          onClick={onRedo}
          className="px-3 py-1 rounded font-medium border border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200"
          title="Redo"
        >
          Redo
        </button>
      </div>
    </div>
  );
};

export default Toolbar;


