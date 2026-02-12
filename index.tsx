import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Đảm bảo import đúng App.tsx cùng cấp

// Tìm cái "phễu" để đổ dữ liệu vào từ index.html
const container = document.getElementById('root');

if (!container) {
  console.error("Không tìm thấy thẻ <div id='root'> trong file index.html!");
} else {
  // Sử dụng createRoot theo chuẩn React 18/19 mới nhất
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
