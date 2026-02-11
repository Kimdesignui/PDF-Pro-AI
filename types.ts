export enum ToolType {
  ROTATE = 'ROTATE',
  MERGE = 'MERGE',
  SPLIT = 'SPLIT',
  COMPRESS = 'COMPRESS',
  SECURITY = 'SECURITY',
  SIGN = 'SIGN',
  IMAGE = 'IMAGE',
  OCR = 'OCR',
  READ_AI = 'READ_AI',
  DASHBOARD = 'DASHBOARD'
}

export interface PdfPage {
  id: string;
  imageUrl: string; // Simulating PDF page render
  rotation: number;
  order: number;
  selected: boolean;
  width: number;  // Original width in points/pixels
  height: number; // Original height in points/pixels
  signature?: {
    x: number;
    y: number;
    scale: number;
  };
  aiAnalysis?: string; // For OCR/Read results
}

export interface ProcessedFile {
  id: string;
  name: string;
  tool: ToolType;
  date: Date;
  size: string;
  previewUrl: string; // Thumb of first page
  pageCount: number;
  pages: PdfPage[]; // Store actual pages data to allow re-opening/editing
}

export interface ToolConfig {
  id: ToolType;
  label: string;
  description: string;
  iconName: string; // String identifier for Lucide icons
  color: string;
}

export interface DragItem {
  id: string;
  index: number;
}