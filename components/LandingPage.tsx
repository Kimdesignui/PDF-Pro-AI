import React from 'react';
import { ToolType } from '../types';
import { 
  FileText, Merge, Scissors, Minimize2, Shield, PenTool, 
  Image as ImageIcon, ScanLine, ArrowRight, CheckCircle, 
  Globe, Clock, ShieldCheck, Menu, X, Heart, Sparkles, Gift, Layers
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSelectTool: (tool: ToolType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSelectTool }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const tools = [
    { id: ToolType.OCR, icon: ScanLine, title: 'OCR PDF', desc: 'Chuyển đổi hình ảnh sang văn bản có thể chỉnh sửa.', color: 'text-blue-500 bg-blue-50' },
    { id: ToolType.MERGE, icon: Merge, title: 'Ghép PDF', desc: 'Kết hợp nhiều file PDF thành một tài liệu duy nhất.', color: 'text-indigo-500 bg-indigo-50' },
    { id: ToolType.SPLIT, icon: Scissors, title: 'Tách PDF', desc: 'Trích xuất các trang từ tệp PDF của bạn.', color: 'text-pink-500 bg-pink-50' },
    { id: ToolType.COMPRESS, icon: Minimize2, title: 'Nén PDF', desc: 'Giảm kích thước file PDF mà vẫn giữ nguyên chất lượng.', color: 'text-green-500 bg-green-50' },
    { id: ToolType.SIGN, icon: PenTool, title: 'Ký tên PDF', desc: 'Tạo chữ ký và ký vào tài liệu PDF trực tuyến.', color: 'text-purple-500 bg-purple-50' },
    { id: ToolType.IMAGE, icon: ImageIcon, title: 'Ảnh sang PDF', desc: 'Chuyển đổi hình ảnh JPG, PNG sang định dạng PDF.', color: 'text-yellow-500 bg-yellow-50' },
    { id: ToolType.SECURITY, icon: Shield, title: 'Bảo mật PDF', desc: 'Đặt mật khẩu để bảo vệ tệp PDF của bạn.', color: 'text-slate-500 bg-slate-50' },
    { id: ToolType.READ_AI, icon: FileText, title: 'Đọc AI', desc: 'Tóm tắt và đọc tài liệu bằng trí tuệ nhân tạo.', color: 'text-teal-500 bg-teal-50' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onGetStarted}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Layers size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">PDF Pro AI</span>
          </div>

          <div className="hidden lg:flex items-center gap-8 font-medium text-slate-600">
            <button onClick={() => onSelectTool(ToolType.COMPRESS)} className="hover:text-[#0061ff] transition-colors">Nén PDF</button>
            <button onClick={() => onSelectTool(ToolType.MERGE)} className="hover:text-[#0061ff] transition-colors">Ghép PDF</button>
            <button onClick={() => onSelectTool(ToolType.SPLIT)} className="hover:text-[#0061ff] transition-colors">Tách PDF</button>
            <button onClick={() => onSelectTool(ToolType.SIGN)} className="hover:text-[#0061ff] transition-colors">Ký tên</button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={onGetStarted}
              className="bg-[#0061ff] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              Sử dụng miễn phí
            </button>
          </div>

          <button className="lg:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-5">
             {tools.slice(0, 4).map(t => (
                <button key={t.id} onClick={() => onSelectTool(t.id)} className="text-left font-medium text-slate-600 py-2 border-b border-slate-50">{t.title}</button>
             ))}
             <button onClick={onGetStarted} className="bg-[#0061ff] text-white py-3 rounded-lg font-bold mt-2">Bắt đầu ngay</button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-[#F7F9FC] pt-20 pb-24 px-6 text-center overflow-hidden relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Chúng tôi làm việc với PDF <br/><span className="text-[#0061ff]">dễ dàng hơn.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Tất cả các công cụ bạn cần để làm việc hiệu quả hơn và thông minh hơn với tài liệu. 
            Nén, chuyển đổi, hợp nhất, tách và chỉnh sửa file PDF trong trình duyệt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto bg-[#0061ff] hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
             >
                Khám phá ngay <ArrowRight size={20} />
             </button>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </section>

      {/* Tools Grid */}
      <section className="py-24 px-6 bg-white relative -mt-10 z-20">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-10 text-center">Các công cụ PDF phổ biến nhất</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {tools.map((tool) => (
                  <div 
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${tool.color}`}>
                        <tool.icon size={28} strokeWidth={2} />
                     </div>
                     <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#0061ff] transition-colors">{tool.title}</h3>
                     <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Feature Section 1: AI */}
      <section className="py-24 px-6 bg-[#F7F9FC]">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 order-2 md:order-1">
               <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 transform rotate-2 hover:rotate-0 transition-all duration-500">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                     <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center"><ScanLine size={20}/></div>
                     <div>
                        <div className="font-bold text-slate-800">Kết quả OCR AI</div>
                        <div className="text-xs text-slate-400">Độ chính xác 99%</div>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="h-2 bg-slate-100 rounded w-full"></div>
                     <div className="h-2 bg-slate-100 rounded w-5/6"></div>
                     <div className="h-2 bg-slate-100 rounded w-4/6"></div>
                     <div className="p-4 bg-blue-50 rounded-xl text-blue-800 text-sm font-medium mt-4">
                        "Hợp đồng này có hiệu lực từ ngày 01/01/2024..."
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex-1 order-1 md:order-2">
               <span className="text-[#0061ff] font-bold tracking-widest uppercase text-sm mb-2 block">Công nghệ tiên tiến</span>
               <h2 className="text-4xl font-black text-slate-900 mb-6">Làm việc trực tiếp <br/>trên dữ liệu số.</h2>
               <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                  Không còn phải gõ lại văn bản thủ công. Công nghệ OCR AI của chúng tôi sẽ trích xuất văn bản từ hình ảnh và file PDF scan với độ chính xác tuyệt đối, sẵn sàng để bạn chỉnh sửa.
               </p>
               <button onClick={() => onSelectTool(ToolType.OCR)} className="text-[#0061ff] font-bold hover:underline flex items-center gap-2">
                  Thử tính năng OCR <ArrowRight size={16}/>
               </button>
            </div>
         </div>
      </section>

      {/* Feature Section 2: Signature */}
      <section className="py-24 px-6 bg-white">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
               <span className="text-purple-600 font-bold tracking-widest uppercase text-sm mb-2 block">eSign</span>
               <h2 className="text-4xl font-black text-slate-900 mb-6">Chữ ký điện tử <br/>dễ dàng & hợp pháp.</h2>
               <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                  Tạo chữ ký của riêng bạn, ký và yêu cầu chữ ký từ người khác. Giữ cho luồng công việc của bạn di chuyển nhanh chóng mà không cần máy in.
               </p>
               <ul className="space-y-4 mb-8">
                  {['Tương thích mọi thiết bị', 'Bảo mật chuẩn ngân hàng', 'Theo dõi trạng thái tài liệu'].map(item => (
                     <li key={item} className="flex items-center gap-3 text-slate-700 font-medium">
                        <CheckCircle className="text-purple-500" size={20} /> {item}
                     </li>
                  ))}
               </ul>
            </div>
            <div className="flex-1 flex justify-center">
               <div className="relative w-full max-w-md aspect-[3/4] bg-white border border-slate-200 shadow-2xl rounded-2xl p-8 flex flex-col">
                  <div className="flex-1 space-y-4 opacity-30">
                     <div className="h-4 bg-slate-800 w-1/3 mb-8"></div>
                     <div className="h-2 bg-slate-400 w-full"></div>
                     <div className="h-2 bg-slate-400 w-full"></div>
                     <div className="h-2 bg-slate-400 w-5/6"></div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-100">
                     <div className="text-xs text-slate-400 uppercase font-bold mb-2">Người ký:</div>
                     <div className="font-cursive text-4xl text-[#0061ff]">Nguyễn Văn A</div>
                     <div className="text-[10px] text-slate-400 mt-1">Đã ký vào lúc 10:30 AM - 20/05/2024</div>
                  </div>
                  
                  <div className="absolute -right-6 top-20 bg-purple-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                     <PenTool size={24}/> 
                     <div>
                        <div className="font-bold text-sm">Yêu cầu chữ ký</div>
                        <div className="text-xs opacity-80">Đã gửi thành công</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 bg-slate-900 text-white">
         <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-16">Tại sao 10+ triệu người chọn PDF Pro AI?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                     <ShieldCheck size={32} className="text-emerald-400"/>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Bảo mật ISO 27001</h3>
                  <p className="text-slate-400 leading-relaxed">Dữ liệu của bạn được mã hóa 256-bit TLS và tự động xóa sau 1 giờ xử lý.</p>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                     <Globe size={32} className="text-blue-400"/>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Làm việc mọi nơi</h3>
                  <p className="text-slate-400 leading-relaxed">Hoạt động trên mọi trình duyệt, mọi hệ điều hành (Mac, Windows, Linux) và di động.</p>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                     <Clock size={32} className="text-orange-400"/>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Tiết kiệm thời gian</h3>
                  <p className="text-slate-400 leading-relaxed">Xử lý hàng loạt file cùng lúc với tốc độ cực nhanh nhờ công nghệ đám mây.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Community/Free Forever Section (Replacing Pricing) */}
      <section className="py-24 px-6 bg-white">
         <div className="max-w-7xl mx-auto">
            <div className="relative bg-gradient-to-br from-[#0061ff] to-indigo-600 rounded-[2.5rem] p-8 md:p-16 overflow-hidden shadow-2xl shadow-blue-200">
               {/* Decorative backgrounds */}
               <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
               <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>

               <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                  <div className="flex-1 space-y-8">
                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium border border-white/20">
                        <Heart size={16} className="text-pink-300 fill-pink-300"/> <span>Dự án vì cộng đồng</span>
                     </div>

                     <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                        Công cụ mạnh mẽ, <br/>
                        <span className="text-blue-200">Chi phí 0 đồng</span>
                     </h2>

                     <p className="text-lg text-blue-50 leading-relaxed max-w-xl mx-auto md:mx-0">
                        Toàn bộ tính năng cao cấp trên nền tảng này được cung cấp hoàn toàn miễn phí. 
                        Đây là dự án tâm huyết được thiết kế bởi <strong className="text-white">Kim Tiểu Kê</strong> (UI Designer) nhằm hỗ trợ cộng đồng xử lý công việc hiệu quả hơn.
                     </p>
                     
                     <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                        <button 
                           onClick={onGetStarted}
                           className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2"
                        >
                           Bắt đầu ngay - Miễn phí mãi mãi <ArrowRight size={20}/>
                        </button>
                     </div>

                     <div className="pt-8 border-t border-white/10">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-blue-200">
                           <div className="p-2 bg-white/10 rounded-lg"><Sparkles size={16} className="text-yellow-300"/></div>
                           <p>
                              Hệ thống được xây dựng và tối ưu mã nguồn bởi <strong className="text-white">Google AI Studio</strong>, mang đến trải nghiệm xử lý PDF thông minh, nhanh chóng và bảo mật.
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Illustration/Icon Area */}
                  <div className="flex-1 flex justify-center items-center">
                     <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
                        <Gift size={120} className="text-white drop-shadow-2xl relative z-10" strokeWidth={1} />
                        {/* Floating elements */}
                        <div className="absolute top-10 right-10 p-3 bg-white rounded-xl shadow-lg animate-bounce duration-[3000ms]">
                           <span className="font-bold text-slate-800 text-xs">FREE</span>
                        </div>
                        <div className="absolute bottom-10 left-10 p-3 bg-white rounded-xl shadow-lg animate-bounce duration-[4000ms]">
                           <span className="font-bold text-slate-800 text-xs">UNLIMITED</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
         <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 mb-6">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
             </div>
             
             <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">PDF PRO AI</h3>
             
             <div className="flex items-center gap-2 text-slate-500 mb-2">
                <span>Sản phẩm AI của</span>
                <span className="font-bold text-blue-600">Kim Tiểu Kê</span>
             </div>
             
             <div className="flex items-center gap-2 text-sm font-medium bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-100">
                <Heart size={14} className="fill-current" />
                <span>Hoàn toàn miễn phí cho cộng đồng</span>
             </div>
         </div>
      </footer>
    </div>
  );
};