import { GoogleGenAI } from "@google/genai";

export const analyzePdfPage = async (base64Image: string, mode: 'ocr' | 'read'): Promise<string> => {
  // 1. Lấy Key đúng cách từ Vite
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // 2. Kiểm tra Key trước khi khởi tạo để tránh làm trắng màn hình
  if (!apiKey || apiKey === "undefined") {
    console.warn("Gemini API Key chưa được thiết lập. Vui lòng kiểm tra GitHub Secrets.");
    return "Lỗi: Chưa cấu hình API Key. Vui lòng thiết lập VITE_GEMINI_API_KEY trong GitHub Secrets để dùng tính năng này.";
  }

  try {
    // 3. Chỉ khởi tạo khi cần dùng (Lazy Initialization)
    const genAI = new GoogleGenAI(apiKey);
    const modelId = 'gemini-1.5-flash'; // Tớ gợi ý dùng model này vì độ ổn định cao
    const model = genAI.getGenerativeModel({ model: modelId });
    
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = mode === 'ocr' 
      ? "Trích xuất toàn bộ văn bản từ hình ảnh này chính xác như hiện tại. Giữ nguyên cấu trúc trình bày."
      : "Phân tích trang tài liệu này. Cung cấp tóm tắt chi tiết bằng tiếng Việt về các thông tin quan trọng.";

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    return response.text() || "Không thể tạo phân tích.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã xảy ra lỗi khi gọi AI. Hãy kiểm tra lại API Key hoặc kết nối mạng.";
  }
};
