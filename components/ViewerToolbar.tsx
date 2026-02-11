import React from 'react';
import { ZoomOut, ZoomIn, Maximize, Minimize, ScanLine } from 'lucide-react';

interface ViewerToolbarProps {
  zoomLevel: number;
  isFullscreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleFullscreen: () => void;
}

export const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  zoomLevel, isFullscreen,
  onZoomIn, onZoomOut, onZoomReset, onToggleFullscreen
}) => {
  return (
    <div className="sticky top-0 z-50 h-12 bg-[#282b2e]/95 backdrop-blur-sm flex items-center justify-center gap-4 text-slate-300 border-b border-[#3e4245] shadow-lg shrink-0 select-none">
        <button onClick={onZoomOut} className="p-1.5 hover:bg-[#3e4245] hover:text-white rounded transition-colors" title="Zoom Out"><ZoomOut size={16}/></button>
        <span className="text-xs font-mono w-14 text-center font-bold">{zoomLevel}%</span>
        <button onClick={onZoomIn} className="p-1.5 hover:bg-[#3e4245] hover:text-white rounded transition-colors" title="Zoom In"><ZoomIn size={16}/></button>
        <div className="h-4 w-px bg-[#3e4245] mx-2"></div>
        <button onClick={onZoomReset} className="p-1.5 hover:bg-[#3e4245] hover:text-white rounded" title="Actual Size"><Maximize size={14}/></button>
        <button onClick={onToggleFullscreen} className="p-1.5 hover:bg-[#3e4245] hover:text-white rounded transition-colors" title="Fullscreen">
            {isFullscreen ? <Minimize size={16}/> : <ScanLine size={16}/>}
        </button>
    </div>
  );
};