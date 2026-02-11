import React from 'react';
import { PdfPage, ToolType } from '../types';
import { Move, Trash2, RotateCw, CheckCircle2 } from 'lucide-react';

interface PageThumbnailProps {
  page: PdfPage;
  index: number;
  isSelected: boolean;
  tool: ToolType;
  onSelect: (id: string) => void;
  onDelete: (index: number) => void;
  onRotate: (id: string, direction: 'left' | 'right') => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({
  page, index, isSelected, tool,
  onSelect, onDelete, onRotate,
  onDragStart, onDragEnter, onDragEnd
}) => {
  // Calculate thumbnail aspect ratio logic
  const isRotatedSideways = Math.abs(page.rotation % 180) === 90;
  const originalW = page.width || 595;
  const originalH = page.height || 842;
  const thumbAspect = isRotatedSideways ? (originalH / originalW) : (originalW / originalH);

  return (
    <div 
      draggable={true}
      onDragStart={() => onDragStart(index)} 
      onDragEnter={() => onDragEnter(index)} 
      onDragEnd={onDragEnd}
      onClick={() => onSelect(page.id)}
      className={`flex gap-3 p-2 rounded-xl border transition-all cursor-pointer group ${isSelected ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200 shadow-sm' : 'bg-white border-slate-100 hover:border-blue-200'}`}
    >
      <div className="w-6 flex flex-col items-center justify-center text-xs font-bold text-slate-300">
          {index + 1}
          <div className="mt-2 cursor-grab active:cursor-grabbing text-slate-200 hover:text-slate-400"><Move size={12}/></div>
      </div>
      
      {/* Dynamic Thumbnail Container */}
      <div className="w-24 bg-slate-200/50 rounded border border-slate-200 overflow-hidden relative flex items-center justify-center self-center" 
            style={{ aspectRatio: `${thumbAspect}` }}>
          <div className="relative w-full h-full">
              <img 
                  src={page.imageUrl} 
                  className="absolute max-w-none origin-center shadow-sm"
                  style={{ 
                      width: isRotatedSideways ? 'auto' : '100%',
                      height: isRotatedSideways ? '100%' : 'auto',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${page.rotation}deg)`,
                      minWidth: isRotatedSideways ? '100%' : '0', 
                      minHeight: isRotatedSideways ? '0' : '100%'
                  }} 
                  alt=""
              />
          </div>
          {tool === ToolType.SPLIT && page.selected && (
              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center z-10"><CheckCircle2 className="text-blue-600 bg-white rounded-full" size={20}/></div>
          )}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2">
          <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); onDelete(index); }} className="p-1.5 bg-white border border-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded shadow-sm"><Trash2 size={12}/></button>
              <button onClick={(e) => { e.stopPropagation(); onRotate(page.id, 'right'); }} className="p-1.5 bg-white border border-slate-100 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded shadow-sm"><RotateCw size={12}/></button>
          </div>
      </div>
    </div>
  );
};