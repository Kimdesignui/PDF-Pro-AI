import React, { useState, useRef, useEffect } from 'react';
import { ToolType, PdfPage } from '../types';
import { 
  ArrowLeft, RotateCw, FilePlus, 
  Loader2, Wand2, Shield, PenTool, Scissors,
  Lock, ScanLine, X, Plus, Layers,
  Play, Pause, Volume2, StopCircle,
  Save, Download, RotateCcw, CopyCheck, AlertTriangle
} from 'lucide-react';
import { analyzePdfPage } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Child Components
import { PageThumbnail } from './PageThumbnail';
import { ViewerToolbar } from './ViewerToolbar';

// Set up worker for PDF.js logic inside Workspace (Add File)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

interface WorkspaceProps {
  tool: ToolType;
  initialPages: PdfPage[];
  initialName?: string;
  onBack: () => void;
  onNavigateTool: (tool: ToolType) => void;
  onSave: (name: string, pages: PdfPage[]) => void;
  onReset: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ tool, initialPages, initialName, onBack, onNavigateTool, onSave, onReset }) => {
  const [pages, setPages] = useState<PdfPage[]>(initialPages);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Modals
  const [activeModal, setActiveModal] = useState<'security' | 'sign' | 'ai_result' | 'save_project' | 'reset_confirm' | null>(null);
  const [projectName, setProjectName] = useState(initialName || `Project_${new Date().toISOString().slice(0,10)}`);
  
  const [aiResult, setAiResult] = useState<string>('');
  const [password, setPassword] = useState('');
  
  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Zoom & View State
  const [zoomLevel, setZoomLevel] = useState(100); // 100% means default scale 1.0
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(initialPages[0]?.id || null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Drag and Drop (Reordering)
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  // Signature Drag
  const [dragSig, setDragSig] = useState<{
    pageId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    containerWidth: number;
    containerHeight: number;
  } | null>(null);
  

  useEffect(() => {
    // Ensure we start with a clean copy of initial pages
    setPages(initialPages.map(p => ({...p})));
    if(initialPages.length > 0 && !selectedPageId) setSelectedPageId(initialPages[0].id);
  }, [initialPages]);

  useEffect(() => {
    if (tool !== ToolType.SPLIT) {
        setPages(prev => prev.map(p => ({ ...p, selected: false })));
    }
  }, [tool]);

  // Handle Fullscreen Change Event (user pressing Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Clean up speech on unmount
  useEffect(() => {
      return () => {
          window.speechSynthesis.cancel();
      };
  }, []);

  // --- Actions ---

  const handleRotate = (pageId: string, direction: 'left' | 'right') => {
    setPages(prev => prev.map(p => {
      if (p.id === pageId) {
        const delta = direction === 'left' ? -90 : 90;
        return { ...p, rotation: p.rotation + delta };
      }
      return p;
    }));
  };

  const handleRotateAll = (direction: 'left' | 'right') => {
      setPages(prev => prev.map(p => {
          const delta = direction === 'left' ? -90 : 90;
          return { ...p, rotation: p.rotation + delta };
      }));
  };

  const handleDelete = (index: number) => {
    if (pages.length <= 1) {
        alert("Không thể xóa trang cuối cùng.");
        return;
    }
    const newPages = [...pages];
    newPages.splice(index, 1);
    setPages(newPages);
  };

  // --- Reset Logic with Custom Modal ---
  const handleResetClick = () => {
    setActiveModal('reset_confirm');
  };

  const handleConfirmReset = () => {
    // Perform Deep Copy to ensure strict state reset
    const cleanPages = initialPages.map(page => ({...page}));
    setPages(cleanPages);
    if (cleanPages.length > 0) {
        setSelectedPageId(cleanPages[0].id);
    }
    setActiveModal(null);
  };

  // --- Zoom Logic ---
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(300, prev + 10)); // Max 300%
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(50, prev - 10)); // Min 50%
  };

  // --- Fullscreen Logic ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // --- Add File Logic (Real PDF Upload Only) ---
  
  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        await processAddedFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processAddedFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
        const newPages: PdfPage[] = [];
        
        if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            const numPagesToProcess = Math.min(pdf.numPages, 20); 

            for (let i = 1; i <= numPagesToProcess; i++) {
                const page = await pdf.getPage(i);
                const originalViewport = page.getViewport({ scale: 1.0 });
                const renderViewport = page.getViewport({ scale: 1.5 });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = renderViewport.height;
                canvas.width = renderViewport.width;
                
                if (context) {
                    await page.render({ canvasContext: context, viewport: renderViewport }).promise;
                    const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
                    
                    newPages.push({
                        id: `added-${Date.now()}-${i}`,
                        imageUrl: imageUrl,
                        rotation: 0,
                        order: pages.length + i - 1,
                        selected: false,
                        width: originalViewport.width,
                        height: originalViewport.height
                    });
                }
            }
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            await new Promise<void>((resolve) => {
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        newPages.push({
                            id: `added-img-${Date.now()}`,
                            imageUrl: e.target?.result as string,
                            rotation: 0,
                            order: pages.length,
                            selected: false,
                            width: img.width,
                            height: img.height
                        });
                        resolve();
                    };
                    img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file);
            });
        }

        setPages(prev => [...prev, ...newPages]);
    } catch (error) {
        console.error("Error adding file:", error);
        alert("Không thể đọc tệp tin. Vui lòng thử lại với file hợp lệ.");
    } finally {
        setIsUploading(false);
    }
  };

  // --- Save / Download Logic ---

  const handleOpenSaveModal = () => {
      setActiveModal('save_project');
  };

  const handleConfirmSave = () => {
      if (!projectName.trim()) return;
      onSave(projectName, pages);
      setActiveModal(null);
  };

  const handleDownload = async () => {
    setProcessing(true);
    try {
      const doc = new jsPDF();
      try { doc.deletePage(1); } catch (e) {}
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const img = new Image();
        img.src = page.imageUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const rotation = (page.rotation % 360 + 360) % 360;
        const isVertical = rotation === 0 || rotation === 180;
        canvas.width = isVertical ? img.width : img.height;
        canvas.height = isVertical ? img.height : img.width;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        ctx.rotate(-(rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        if (page.signature) {
             const { x, y, scale } = page.signature;
             const sigX = (x / 100) * canvas.width;
             const sigY = (y / 100) * canvas.height;
             ctx.save();
             ctx.translate(sigX, sigY);
             ctx.scale(scale, scale);
             ctx.font = 'bold italic 48px "Times New Roman", serif';
             ctx.fillStyle = '#1e40af';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillText('Signed', 0, 0);
             ctx.restore();
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const isLandscape = canvas.width > canvas.height;
        const orientation = isLandscape ? 'l' : 'p';
        doc.addPage('a4', orientation);

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const ratio = canvas.width / canvas.height;
        const pdfRatio = pdfWidth / pdfHeight;
        let finalW, finalH;
        if (ratio > pdfRatio) { finalW = pdfWidth; finalH = finalW / ratio; } 
        else { finalH = pdfHeight; finalW = finalH * ratio; }
        const xOffset = (pdfWidth - finalW) / 2;
        const yOffset = (pdfHeight - finalH) / 2;
        doc.addImage(imgData, 'JPEG', xOffset, yOffset, finalW, finalH);
      }
      doc.save(projectName.endsWith('.pdf') ? projectName : `${projectName}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Lỗi khi tạo PDF");
    } finally {
      setProcessing(false);
    }
  };

  // --- AI & Tools ---

  const handleAITool = async () => {
    const targetPage = pages.find(p => p.id === selectedPageId) || pages[0];
    if (targetPage) {
        setLoadingAI(targetPage.id);
        scrollToPage(targetPage.id);
        const result = await analyzePdfPage(targetPage.imageUrl, tool === ToolType.OCR ? 'ocr' : 'read');
        setAiResult(result); 
        setLoadingAI(null); 
        setActiveModal('ai_result');
    }
  };

  // --- Helpers ---
  
  const scrollToPage = (pageId: string) => {
    setSelectedPageId(pageId);
    const element = document.getElementById(`preview-page-${pageId}`);
    if (element && previewScrollRef.current) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleSignatureMouseDown = (e: React.MouseEvent, pageId: string, currentX: number, currentY: number) => {
    e.stopPropagation();
    if (tool !== ToolType.SIGN) return;
    const container = (e.currentTarget.parentElement as HTMLElement); 
    const rect = container.getBoundingClientRect();
    setDragSig({
      pageId, startX: e.clientX, startY: e.clientY, initialX: currentX, initialY: currentY,
      containerWidth: rect.width, containerHeight: rect.height
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragSig) return;
      e.preventDefault();
      const deltaX = e.clientX - dragSig.startX;
      const deltaY = e.clientY - dragSig.startY;
      const newX = dragSig.initialX + (deltaX / dragSig.containerWidth) * 100;
      const newY = dragSig.initialY + (deltaY / dragSig.containerHeight) * 100;
      setPages(prev => prev.map(p => {
        if (p.id === dragSig.pageId && p.signature) {
          return { ...p, signature: { ...p.signature, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) } };
        }
        return p;
      }));
    };
    const handleMouseUp = () => setDragSig(null);
    if (dragSig) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragSig]);

  const handleSortStart = (index: number) => { dragItem.current = index; };
  const handleSortEnter = (index: number) => { dragOverItem.current = index; };
  const handleSortEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const copyList = [...pages];
      const dragContent = copyList[dragItem.current];
      copyList.splice(dragItem.current, 1);
      copyList.splice(dragOverItem.current, 0, dragContent);
      setPages(copyList);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Speech Utils
  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); setIsPaused(false); };
  const handleSpeak = () => {
      if (isSpeaking && !isPaused) { window.speechSynthesis.pause(); setIsPaused(true); }
      else if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); }
      else {
          const u = new SpeechSynthesisUtterance(aiResult);
          u.lang = 'vi-VN';
          u.onend = () => { setIsSpeaking(false); setIsPaused(false); };
          speechRef.current = u;
          window.speechSynthesis.speak(u);
          setIsSpeaking(true);
      }
  };

  // Sidebar Tool Rendering
  const renderNavSidebar = () => {
    const navItems = [
      { id: ToolType.ROTATE, icon: RotateCw, label: 'Xoay' },
      { id: ToolType.MERGE, icon: Plus, label: 'Ghép' },
      { id: ToolType.SPLIT, icon: Scissors, label: 'Tách' },
      { id: ToolType.SIGN, icon: PenTool, label: 'Ký' },
      { id: ToolType.SECURITY, icon: Shield, label: 'Bảo mật' },
      { id: ToolType.OCR, icon: ScanLine, label: 'OCR' },
      { id: ToolType.READ_AI, icon: Wand2, label: 'Đọc AI' },
    ];
    return (
      <aside className="w-[72px] bg-white border-r border-slate-200 flex flex-col items-center py-4 space-y-4 h-screen z-30 shadow-md">
         <div className="mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Layers size={20} strokeWidth={2.5} />
            </div>
         </div>
         <div className="w-full h-px bg-slate-100 mx-auto"></div>
         <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <ArrowLeft size={20} />
         </button>
         <div className="flex-1 space-y-2 w-full flex flex-col items-center overflow-y-auto no-scrollbar pt-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => onNavigateTool(item.id)}
                className={`group flex flex-col items-center justify-center p-2 w-12 h-12 rounded-xl transition-all ${tool === item.id ? 'bg-blue-600 text-white shadow-blue-200 shadow-md' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                <item.icon size={20} />
                <span className="sr-only">{item.label}</span>
              </button>
            ))}
         </div>
      </aside>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {renderNavSidebar()}
      
      {/* Hidden File Input for Adding Pages */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".pdf,image/*" 
        className="hidden"
        multiple={false}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm shrink-0">
           <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {tool === ToolType.SPLIT ? 'Tách tài liệu' : tool === ToolType.MERGE ? 'Ghép tài liệu' : tool.replace('_', ' ')}
                <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-500 font-normal">{pages.length} trang</span>
              </h2>
           </div>
           
           <div className="flex items-center gap-3">
             {/* Tool Actions */}
             {tool === ToolType.SIGN && (
                 <button onClick={() => setActiveModal('sign')} className="text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg font-bold text-xs border border-purple-100 flex items-center gap-2">
                    <PenTool size={14}/> + Chữ ký
                 </button>
             )}

             {(tool === ToolType.OCR || tool === ToolType.READ_AI) && (
                 <button onClick={handleAITool} disabled={loadingAI !== null} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md flex items-center gap-2">
                     {loadingAI ? <Loader2 className="animate-spin" size={16}/> : <Wand2 size={16}/>}
                     <span>Chạy AI</span>
                 </button>
             )}

             <div className="h-6 w-px bg-slate-200 mx-1"></div>
             
             {/* Reset Button - Calls Custom Modal */}
             <button onClick={handleResetClick} 
               className="px-3 py-2 rounded-lg font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2 border border-slate-100 bg-white shadow-sm"
               title="Khôi phục trạng thái gốc">
               <RotateCcw size={16} className={isUploading ? "animate-spin" : ""}/>
               <span className="text-xs hidden md:inline">Làm mới</span>
             </button>

             {/* Global Actions */}
             <button onClick={handleDownload} disabled={processing}
               className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 hover:text-blue-600 flex items-center gap-2 text-sm transition-all">
               {processing ? <Loader2 className="animate-spin" size={16}/> : <Download size={18}/>}
               <span>Tải xuống</span>
             </button>

             <button onClick={handleOpenSaveModal}
               className="px-5 py-2 rounded-lg font-bold text-white shadow-md transition-all active:scale-95 flex items-center gap-2 text-sm bg-[#0061ff] hover:bg-blue-700">
               <Save size={18}/>
               <span>Lưu dự án</span>
             </button>
           </div>
        </header>

        {/* Workspace Body */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Left Panel: Thumbnails & Quick Actions */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
                {/* Global Controls */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác nhanh</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleRotateAll('left')} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-300 flex justify-center items-center gap-1.5 text-xs font-bold shadow-sm transition-all" title="Xoay trái tất cả">
                            <RotateCcw size={14}/> Tất cả
                        </button>
                        <button onClick={() => handleRotateAll('right')} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-300 flex justify-center items-center gap-1.5 text-xs font-bold shadow-sm transition-all" title="Xoay phải tất cả">
                            <RotateCw size={14}/> Tất cả
                        </button>
                    </div>
                </div>

                {/* Page List */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <span className="text-xs font-bold text-slate-500 uppercase">Trang ({pages.length})</span>
                    <button onClick={handleAddFileClick} className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded transition-colors" title="Thêm file PDF"><FilePlus size={16}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
                    {pages.map((page, index) => (
                      <PageThumbnail
                        key={page.id}
                        page={page}
                        index={index}
                        isSelected={selectedPageId === page.id}
                        tool={tool}
                        onSelect={scrollToPage}
                        onDelete={handleDelete}
                        onRotate={handleRotate}
                        onDragStart={handleSortStart}
                        onDragEnter={handleSortEnter}
                        onDragEnd={handleSortEnd}
                      />
                    ))}
                    <div onClick={handleAddFileClick} className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer h-24">
                        {isUploading ? <Loader2 className="animate-spin mb-1" size={20}/> : <Plus size={20} className="mb-1"/>}
                        <span className="text-xs font-bold">{isUploading ? 'Đang tải...' : 'Thêm trang'}</span>
                    </div>
                </div>
            </div>

            {/* Right Panel: Main Stage (PDF Viewer) */}
            <div ref={viewerContainerRef} className="relative flex flex-col flex-1 h-full bg-[#323639] overflow-hidden">
                {/* Preview Toolbar */}
                <ViewerToolbar 
                    zoomLevel={zoomLevel}
                    isFullscreen={isFullscreen}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onZoomReset={() => setZoomLevel(100)}
                    onToggleFullscreen={toggleFullscreen}
                />

                {/* Scrollable Canvas Area */}
                <div ref={previewScrollRef} className="flex-1 overflow-y-auto p-8 relative custom-scrollbar bg-[#525659]">
                     <div className="flex flex-col items-center py-8">
                        {pages.map((page, index) => {
                            const scale = zoomLevel / 100;
                            const baseW = 595; // A4 point width
                            const isRotatedSideways = Math.abs(page.rotation % 180) === 90;

                            // Dynamic Style for Zoom
                            const pageStyle = {
                                width: `${baseW * scale}px`, 
                                aspectRatio: isRotatedSideways ? '1.4141/1' : '1/1.4141',
                                height: 'auto',
                            };

                            return (
                                <div id={`preview-page-${page.id}`} key={page.id} 
                                    onClick={() => setSelectedPageId(page.id)}
                                    className={`relative bg-white shadow-2xl mb-6 transition-all duration-200 ease-out flex-shrink-0 mx-auto ${selectedPageId === page.id ? 'ring-4 ring-blue-500/80' : ''}`}
                                    style={pageStyle}>
                                    
                                    {/* Image Rendering: Absolute Center & Rotated inside the container */}
                                    <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                                        <img 
                                            src={page.imageUrl} 
                                            alt="" 
                                            className="max-w-none transition-transform duration-300 ease-in-out" 
                                            style={{ 
                                                width: isRotatedSideways ? 'auto' : '100%',
                                                height: isRotatedSideways ? '100%' : 'auto',
                                                transform: `rotate(${page.rotation}deg)`,
                                                transformOrigin: 'center center',
                                            }} 
                                        />
                                    </div>
                                    
                                    {/* Overlays */}
                                    {loadingAI === page.id && (
                                        <div className="absolute inset-0 bg-blue-500/20 z-10 flex items-center justify-center backdrop-blur-[1px]">
                                            <div className="absolute w-full h-1 bg-blue-400 shadow-[0_0_15px_blue] animate-scan"></div>
                                            <Loader2 className="text-white animate-spin" size={32} />
                                        </div>
                                    )}

                                    {page.signature && (
                                        <div className="absolute z-30 transition-transform cursor-move"
                                            style={{ left: `${page.signature.x}%`, top: `${page.signature.y}%`, transform: `translate(-50%, -50%) scale(${page.signature.scale})` }}
                                            onMouseDown={(e) => handleSignatureMouseDown(e, page.id, page.signature!.x, page.signature!.y)}
                                            >
                                            <div className="text-4xl text-blue-800 drop-shadow-lg px-2 py-1 select-none border border-transparent hover:border-blue-400 rounded hover:bg-blue-50/20" style={{ fontFamily: 'cursive' }}>Signed</div>
                                        </div>
                                    )}
                                    
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-bold whitespace-nowrap select-none">
                                        Trang {index + 1}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Bottom Spacer */}
                        <div className="h-40 shrink-0"></div>
                     </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* RESET CONFIRM MODAL */}
      {activeModal === 'reset_confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl scale-100 transform transition-all">
              <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertTriangle size={32}/>
                 </div>
                 <h3 className="text-xl font-bold text-slate-800">Khôi phục gốc?</h3>
                 <p className="text-slate-500 text-sm mt-2">Toàn bộ chỉnh sửa (xoay, xóa, thêm trang) sẽ bị hủy bỏ và quay về trạng thái khi mới tải file lên.</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setActiveModal(null)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Hủy</button>
                 <button onClick={handleConfirmReset} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all">Đồng ý</button>
              </div>
           </div>
        </div>
      )}

      {/* SAVE PROJECT MODAL */}
      {activeModal === 'save_project' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl scale-100 transform transition-all">
              <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Save size={32}/>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-800">Lưu dự án</h3>
                 <p className="text-slate-500 text-sm">Đặt tên cho dự án để bạn có thể tiếp tục chỉnh sửa sau này.</p>
              </div>
              
              <div className="mb-8">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Tên dự án</label>
                  <input 
                    type="text" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                    placeholder="Nhập tên file..."
                    autoFocus
                  />
              </div>

              <div className="flex gap-3">
                 <button onClick={() => setActiveModal(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Hủy bỏ</button>
                 <button onClick={handleConfirmSave} className="flex-1 py-3 bg-[#0061ff] text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Lưu ngay</button>
              </div>
           </div>
        </div>
      )}

      {/* AI RESULT MODAL */}
      {activeModal === 'ai_result' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl text-white ${tool === ToolType.READ_AI ? 'bg-cyan-500' : 'bg-teal-500'}`}>
                    {tool === ToolType.READ_AI ? <Volume2 size={24}/> : <ScanLine size={24}/>}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Kết quả AI</h3>
                    <p className="text-xs text-slate-500 font-medium">Gemini 1.5 Pro Analysis</p>
                </div>
              </div>
              <button onClick={() => { stopSpeaking(); setActiveModal(null); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1 leading-relaxed text-slate-700 whitespace-pre-wrap font-medium text-lg">
                {aiResult}
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-white">
               <div className="flex gap-2">
                   {tool === ToolType.READ_AI && (
                       <>
                        <button onClick={handleSpeak} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isSpeaking && !isPaused ? 'bg-amber-50 text-amber-600' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}>
                            {isSpeaking && !isPaused ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor"/>}
                            {isSpeaking && !isPaused ? 'Tạm dừng' : 'Đọc ngay'}
                        </button>
                        {isSpeaking && <button onClick={stopSpeaking} className="p-3 bg-slate-100 text-slate-500 hover:text-red-500 rounded-xl"><StopCircle size={20}/></button>}
                       </>
                   )}
                    {tool === ToolType.OCR && (
                       <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
                           <CopyCheck size={18}/> Sao chép
                       </button>
                   )}
               </div>
              <button onClick={() => { stopSpeaking(); setActiveModal(null); }} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">Đóng</button>
            </div>
          </div>
        </div>
      )}
      
      {/* SECURITY MODAL */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><Shield size={32}/></div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Bảo mật PDF</h3>
            </div>
            <p className="text-slate-500 mb-8 leading-relaxed">Nhập mật khẩu để mã hóa tài liệu. Tệp của bạn sẽ yêu cầu mật khẩu này để mở.</p>
            <div className="space-y-6 mb-10">
              <div className="relative">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu..." 
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none transition-all font-medium" />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Hủy</button>
              <button onClick={() => setActiveModal(null)} 
                className="flex-2 px-10 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-xl shadow-red-200 transition-all active:scale-95">Áp dụng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};