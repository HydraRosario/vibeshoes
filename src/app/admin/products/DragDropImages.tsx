import React from 'react';

interface DragDropImagesProps {
  images: string[];
  onMove: (from: number, to: number) => void;
  onRemove: (idx: number) => void;
}

export function DragDropImages({ images, onMove, onRemove }: DragDropImagesProps) {
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== idx) {
      onMove(draggedIdx, idx);
      setDraggedIdx(idx);
    }
  };
  const handleDrop = () => {
    setDraggedIdx(null);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {images.map((img, i) => (
        <div
          key={img}
          className={`relative w-24 h-24 border-2 ${draggedIdx === i ? 'border-red-500' : 'border-transparent'}`}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={e => handleDragOver(e, i)}
          onDrop={handleDrop}
        >
          <img
            src={img}
            alt={`Imagen ${i + 1}`}
            className="w-full h-full object-cover rounded border"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute top-1 right-1 bg-white/80 hover:bg-white rounded-full p-1 border border-gray-300"
            title="Eliminar imagen"
          >
            <span className="text-red-600 font-bold">&times;</span>
          </button>
        </div>
      ))}
    </div>
  );
}
