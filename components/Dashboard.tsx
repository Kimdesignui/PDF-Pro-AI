import React from 'react';
import { ToolType } from '../types';
import { 
  RotateCw, Plus, Scissors, Minimize2, Lock, 
  PenLine, Image as ImageIcon, ScanLine, Volume2, 
  Layers, Sparkles 
} from 'lucide-react';

interface DashboardProps {
  onSelectTool: (tool: ToolType) => void;
}

interface ToolCardConfig {
  id: ToolType;
  label: string;
  description: string;
  icon: React.ElementType;
  theme: string; // Tailwind color classes for bg and text
}

const TOOLS: ToolCardConfig[] = [
  { 
    id: ToolType.ROTATE, 
    label: 'Xoay PDF', 
    description: 'Xoay các trang PDF của bạn theo góc mong muốn.', 
    icon: RotateCw, 
    theme: 'bg-orange-50 text-orange-600' 
  },
  { 
    id: ToolType.MERGE, 
    label: 'Ghép PDF', 
    description: 'Kết hợp nhiều tệp PDF thành một tài liệu duy nhất.', 
    icon: Plus, 
    theme: 'bg-blue-50 text-blue-600' 
  },
  { 
    id: ToolType.SPLIT, 
    label: 'Tách PDF', 
    description: 'Tách tệp PDF thành các trang riêng lẻ hoặc khoảng.', 
    icon: Scissors, 
    theme: 'bg-purple-50 text-purple-600' 
  },
  { 
    id: ToolType.COMPRESS, 
    label: 'Nén PDF', 
    description: 'Giảm kích thước tệp PDF (Demo).', 
    icon: Minimize2, 
    theme: 'bg-emerald-50 text-emerald-600' 
  },
  { 
    id: ToolType.SECURITY, 
    label: 'Bảo mật', 
    description: 'Thêm mật khẩu bảo vệ cho tệp PDF.', 
    icon: Lock, 
    theme: 'bg-slate-100 text-slate-600' 
  },
  { 
    id: ToolType.SIGN, 
    label: 'Ký Tên', 
    description: 'Thêm chữ ký tay vào tài liệu.', 
    icon: PenLine, 
    theme: 'bg-rose-50 text-rose-600' 
  },
  { 
    id: ToolType.IMAGE, 
    label: 'Chèn Ảnh', 
    description: 'Chèn hình ảnh vào vị trí bất kỳ.', 
    icon: ImageIcon, 
    theme: 'bg-indigo-50 text-indigo-600' 
  },
  { 
    id: ToolType.OCR, 
    label: 'OCR (AI)', 
    description: 'Chuyển đổi hình ảnh thành văn bản có thể chỉnh sửa.', 
    icon: ScanLine, 
    theme: 'bg-teal-50 text-teal-600' 
  },
  { 
    id: ToolType.READ_AI, 
    label: 'Đọc PDF (AI)', 
    description: 'Chuyển đổi văn bản thành giọng nói tự nhiên.', 
    icon: Volume2, 
    theme: 'bg-cyan-50 text-cyan-600' 
  },
];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 py-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Layers size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">PDF Pro AI</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {['Công cụ', 'Nén', 'Chuyển đổi', 'Ghép', 'Ký tên'].map((item) => (
              <button 
                key={item} 
                className="text-[15px] font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* CTA Button */}
          <button className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-md shadow-blue-100 active:scale-95">
            <Sparkles size={16} />
            <span>Khám phá</span>
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">1</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Hero Text (Optional, keeping it subtle as per reference image design) */}
        {/* The reference doesn't emphasize a big hero text, just the grid, but let's add a small spacer */}
        <div className="h-4"></div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-start h-full"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300 ${tool.theme}`}>
                <tool.icon size={28} strokeWidth={2} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {tool.label}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer info */}
        <div className="mt-16 text-center border-t border-slate-200 pt-8">
            <p className="text-slate-400 text-sm">© 2024 PDF Pro AI. Designed for efficiency.</p>
        </div>
      </main>
    </div>
  );
};