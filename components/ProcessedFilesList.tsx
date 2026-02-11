import React, { useState } from 'react';
import { ProcessedFile, ToolType } from '../types';
import { FileText, Download, Trash2, Eye, ArrowLeft, Clock, Search, PenLine, Loader2, Layers, MoreHorizontal, Plus, CheckSquare, Square, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ProcessedFilesListProps {
  files: ProcessedFile[];
  onBackHome: () => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onOpen: (file: ProcessedFile) => void;
  onCreateNew: () => void;
}

export const ProcessedFilesList: React.FC<ProcessedFilesListProps> = ({ files, onBackHome, onDelete, onBulkDelete, onOpen, onCreateNew }) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
      const newSet = new Set(selectedItems);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedItems(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedItems.size === files.length) {
          setSelectedItems(new Set());
      } else {
          setSelectedItems(new Set(files.map(f => f.id)));
      }
  };

  const handleBulkDelete = () => {
      if (confirm(`Bạn có chắc muốn xóa vĩnh viễn ${selectedItems.size} dự án đã chọn?`)) {
          onBulkDelete(Array.from(selectedItems));
          setSelectedItems(new Set());
      }
  };

  const handleDownload = async (file: ProcessedFile) => {
    setDownloadingId(file.id);
    try {
      const doc = new jsPDF();
      try { doc.deletePage(1); } catch (e) {}
      
      for (let i = 0; i < file.pages.length; i++) {
        const page = file.pages[i];
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
      doc.save(file.name || 'document.pdf');
    } catch (error) {
      console.error(error);
      alert("Lỗi tải xuống.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBackHome} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Layers size={20} strokeWidth={2.5} />
               </div>
               <div className="flex flex-col">
                  <span className="text-lg font-bold text-slate-800 leading-none">PDF Pro AI</span>
                  <span className="text-xs text-slate-500 font-medium">Quản lý dự án</span>
               </div>
            </div>
          </div>
          <button onClick={onCreateNew} className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
            <Plus size={18}/> Tạo mới
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Toolbar / Search / Bulk Actions */}
        <div className="flex items-center justify-between mb-6 h-12">
            {selectedItems.size > 0 ? (
                <div className="flex items-center gap-4 bg-red-50 px-4 py-2 rounded-xl text-red-700 animate-in fade-in slide-in-from-bottom-2 border border-red-100 w-full shadow-sm">
                    <span className="font-bold text-sm bg-white px-2 py-0.5 rounded border border-red-100">{selectedItems.size} đã chọn</span>
                    <button onClick={handleBulkDelete} className="flex items-center gap-2 text-sm font-bold hover:underline transition-colors ml-auto">
                        <Trash2 size={16}/> Xóa tất cả mục đã chọn
                    </button>
                    <div className="w-px h-4 bg-red-200 mx-2"></div>
                    <button onClick={() => setSelectedItems(new Set())} className="p-1 hover:bg-red-100 rounded-full"><X size={16}/></button>
                </div>
            ) : (
                <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex-1 max-w-md">
                   <Search className="text-slate-400" size={18}/>
                   <input type="text" placeholder="Tìm kiếm dự án..." className="bg-transparent outline-none text-sm w-full font-medium text-slate-700"/>
                </div>
            )}
        </div>

        {files.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <FileText size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có dự án nào</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Các tài liệu bạn chỉnh sửa và lưu lại sẽ xuất hiện tại đây để bạn có thể tiếp tục làm việc bất cứ lúc nào.</p>
            <button onClick={onCreateNew} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Bắt đầu ngay
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4 w-12 text-center">
                      <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600">
                        {selectedItems.size === files.length && files.length > 0 ? <CheckSquare size={18} className="text-blue-600"/> : <Square size={18}/>}
                      </button>
                  </th>
                  <th className="px-6 py-4 font-bold">Tên dự án</th>
                  <th className="px-6 py-4 font-bold">Loại công cụ</th>
                  <th className="px-6 py-4 font-bold">Cập nhật cuối</th>
                  <th className="px-6 py-4 font-bold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file) => (
                  <tr key={file.id} className={`group transition-all ${selectedItems.has(file.id) ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 text-center">
                        <button onClick={() => toggleSelect(file.id)} className={`${selectedItems.has(file.id) ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                            {selectedItems.has(file.id) ? <CheckSquare size={18}/> : <Square size={18}/>}
                        </button>
                    </td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => onOpen(file)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden relative shadow-sm group-hover:shadow-md transition-all shrink-0">
                            <img src={file.previewUrl} alt="" className="w-full h-full object-cover opacity-90" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">{file.name}</div>
                          <div className="text-xs text-slate-400 font-medium bg-slate-100 inline-block px-1.5 py-0.5 rounded">{file.size} • {file.pageCount} trang</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-600 shadow-sm">
                         {file.tool}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Clock size={14} />
                        {file.date.toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => onOpen(file)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                          <PenLine size={18} />
                        </button>
                        <button 
                          onClick={() => handleDownload(file)}
                          disabled={downloadingId === file.id}
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Tải xuống PDF">
                          {downloadingId === file.id ? <Loader2 size={18} className="animate-spin text-emerald-600"/> : <Download size={18} />}
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        <button 
                            onClick={() => onDelete(file.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};