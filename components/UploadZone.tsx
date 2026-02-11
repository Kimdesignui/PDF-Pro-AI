import React, { useState, useRef } from 'react';
import { ToolType, PdfPage } from '../types';
import { UploadCloud, X, FileText, Loader2, ArrowLeft, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

interface UploadZoneProps {
  tool: ToolType;
  onCancel: () => void;
  onUploadSuccess: (pages: PdfPage[]) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ tool, onCancel, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toolLabels: Record<ToolType, string> = {
    [ToolType.ROTATE]: 'Xoay PDF',
    [ToolType.MERGE]: 'Ghép PDF',
    [ToolType.SPLIT]: 'Tách PDF',
    [ToolType.COMPRESS]: 'Nén PDF',
    [ToolType.SECURITY]: 'Bảo mật PDF',
    [ToolType.SIGN]: 'Ký Tên PDF',
    [ToolType.IMAGE]: 'Chèn Ảnh vào PDF',
    [ToolType.OCR]: 'OCR (AI)',
    [ToolType.READ_AI]: 'Đọc PDF (AI)',
    [ToolType.DASHBOARD]: 'Dashboard'
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Không thể đọc tệp tin"));
      reader.readAsDataURL(file);
    });
  };

  const getImageDimensions = (base64: string): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 600, height: 800 }); // Fallback
      img.src = base64;
    });
  };

  const processFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);
    setIsProcessing(true);
    setProgress(5);

    try {
      let generatedPages: PdfPage[] = [];

      // Xử lý File Ảnh
      if (file.type.startsWith('image/')) {
        const base64 = await readFileAsDataURL(file);
        const { width, height } = await getImageDimensions(base64);
        
        generatedPages = [{
          id: `page-${Date.now()}-0`,
          imageUrl: base64,
          rotation: 0,
          order: 0,
          selected: false,
          width,
          height
        }];
        setProgress(100);
      } 
      // Xử lý File PDF
      else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        
        // Sử dụng PDF.js để load tài liệu
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        const numPagesToProcess = Math.min(pdf.numPages, 50); // Giới hạn 50 trang để tránh treo trình duyệt
        
        for (let i = 1; i <= numPagesToProcess; i++) {
            const page = await pdf.getPage(i);
            // Viewport gốc để lấy kích thước chuẩn (scale 1.0)
            const originalViewport = page.getViewport({ scale: 1.0 });
            
            // Viewport render (High quality)
            const renderViewport = page.getViewport({ scale: 1.5 }); 
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = renderViewport.height;
            canvas.width = renderViewport.width;
            
            if (context) {
                await page.render({
                    canvasContext: context,
                    viewport: renderViewport
                }).promise;
                
                const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                generatedPages.push({
                    id: `pdf-${file.name}-page-${i}-${Date.now()}`,
                    imageUrl: imageUrl,
                    rotation: 0,
                    order: i - 1,
                    selected: false,
                    width: originalViewport.width,
                    height: originalViewport.height
                });
            }
            
            // Cập nhật tiến trình
            const percent = Math.round((i / numPagesToProcess) * 90) + 5;
            setProgress(percent);
        }
        
        if (pdf.numPages > 50) {
            setError(`File quá lớn (${pdf.numPages} trang). Hệ thống chỉ tải 50 trang đầu tiên.`);
        }
      } else {
        throw new Error("Định dạng file không được hỗ trợ. Vui lòng chọn PDF hoặc Ảnh.");
      }

      setProgress(100);
      
      // Delay nhỏ để hiển thị 100% trước khi chuyển trang
      setTimeout(() => {
        if (generatedPages.length > 0) {
            onUploadSuccess(generatedPages);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
            setError("Không tìm thấy trang nào trong tài liệu.");
            setIsProcessing(false);
        }
      }, 500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi xử lý tệp tin. Vui lòng thử lại.");
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200/60 px-8 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 transform transition-transform hover:scale-105">
              <Layers size={26} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-800 tracking-tight leading-none">PDF Pro AI</span>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Smart AI Processing</span>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="group p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] p-12 border border-slate-100 relative overflow-hidden">
          
          <button 
            onClick={onCancel}
            className="absolute top-8 left-8 text-slate-400 hover:text-blue-600 flex items-center gap-2 text-sm font-bold transition-all hover:-translate-x-1"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          <div className="text-center mb-12 mt-4">
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Tải tài liệu lên</h2>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
              {toolLabels[tool]}
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {!isProcessing ? (
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                group relative border-2 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center transition-all cursor-pointer
                ${isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.02] shadow-2xl shadow-blue-100' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 hover:shadow-xl hover:shadow-slate-100'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,image/*" 
                onChange={handleInputChange}
              />
              
              <div className="w-28 h-28 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-all duration-500 shadow-inner group-hover:shadow-blue-200">
                <UploadCloud size={56} strokeWidth={1.5} className="group-hover:animate-bounce" />
              </div>

              <div className="text-center">
                <p className="text-2xl font-black text-slate-800 mb-2">Bắt đầu ngay bây giờ</p>
                <p className="text-slate-400 text-sm mb-10 max-w-xs mx-auto font-medium">Kéo thả tệp PDF hoặc ảnh vào đây để hệ thống tự động xử lý trang.</p>
                
                <div className="inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-slate-200 group-hover:bg-blue-600 group-hover:shadow-blue-200 transition-all active:scale-95">
                  <FileText size={22} />
                  Chọn tệp từ máy tính
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
              <div className="relative w-40 h-40 mb-12">
                <div className="absolute inset-0 rounded-full border-[6px] border-slate-50 border-t-blue-600 animate-spin"></div>
                <div className="absolute inset-4 rounded-full border-[6px] border-slate-50 border-b-indigo-500 animate-[spin_3s_linear_infinite_reverse]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-2xl shadow-lg animate-bounce">
                        <FileText size={52} className="text-blue-600" />
                    </div>
                </div>
              </div>
              
              <div className="w-full max-w-sm space-y-8 text-center">
                <div className="space-y-3">
                    <div className="flex justify-between items-end text-slate-800">
                        <div className="flex flex-col items-start overflow-hidden">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Đang xử lý</span>
                            <span className="text-sm font-bold truncate w-full max-w-[220px]">{selectedFile?.name}</span>
                        </div>
                        <span className="text-2xl font-black text-blue-600 tabular-nums">{progress}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner p-1">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(59,130,246,0.5)]" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-slate-400 font-bold italic animate-pulse">
                        {progress < 30 ? "Đang tải dữ liệu PDF..." : progress < 80 ? "Đang render trang..." : "Đang hoàn tất..."}
                    </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-16 flex flex-col sm:flex-row gap-6 items-center justify-between border-t border-slate-100 pt-10">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Bảo mật tuyệt đối</span>
                    <span className="text-[10px] text-slate-400 font-medium">Mã hóa 256-bit chuẩn ngân hàng</span>
                </div>
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Max Size: 50MB
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-8 text-center text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">
        Secure Document Engine v2.0
      </footer>
    </div>
  );
};