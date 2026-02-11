import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Workspace } from './components/Workspace';
import { UploadZone } from './components/UploadZone';
import { LandingPage } from './components/LandingPage';
import { ProcessedFilesList } from './components/ProcessedFilesList';
import { ToolType, PdfPage, ProcessedFile } from './types';

enum ViewState {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  UPLOAD = 'UPLOAD',
  WORKSPACE = 'WORKSPACE',
  PROCESSED_LIST = 'PROCESSED_LIST'
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [currentTool, setCurrentTool] = useState<ToolType>(ToolType.DASHBOARD);
  const [uploadedPages, setUploadedPages] = useState<PdfPage[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('pdf_pro_projects');
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        // Restore Date objects
        const hydrated = parsed.map((p: any) => ({...p, date: new Date(p.date)}));
        setProcessedFiles(hydrated);
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pdf_pro_projects', JSON.stringify(processedFiles));
  }, [processedFiles]);

  // --- Navigation Handlers ---

  const handleLandingGetStarted = () => {
    setView(ViewState.DASHBOARD);
  };

  const handleLandingSelectTool = (tool: ToolType) => {
    handleSelectTool(tool);
  };

  const handleSelectTool = (tool: ToolType) => {
    setCurrentTool(tool);
    if (tool === ToolType.DASHBOARD) {
        setView(ViewState.DASHBOARD);
    } else {
        setEditingFileId(null); // Reset editing state when starting new
        setView(ViewState.UPLOAD);
    }
  };

  const handleUploadCancel = () => {
    setView(ViewState.DASHBOARD);
    setCurrentTool(ToolType.DASHBOARD);
  };

  const handleUploadComplete = (pages: PdfPage[]) => {
    setUploadedPages(pages);
    setView(ViewState.WORKSPACE);
  };

  const handleWorkspaceBack = () => {
    setUploadedPages([]);
    setEditingFileId(null);
    setView(ViewState.DASHBOARD);
    setCurrentTool(ToolType.DASHBOARD);
  };

  const handleWorkspaceReset = () => {
    setUploadedPages([]);
    setEditingFileId(null);
    // Return to upload screen to start over
    setView(ViewState.UPLOAD); 
  };

  const handleWorkspaceSave = (name: string, finalPages: PdfPage[]) => {
    const newFile: ProcessedFile = {
        id: editingFileId || `proj-${Date.now()}`,
        name: name.endsWith('.pdf') ? name : `${name}.pdf`,
        tool: currentTool,
        date: new Date(),
        size: '2.4 MB', // Mock size
        previewUrl: finalPages[0]?.imageUrl || '',
        pageCount: finalPages.length,
        pages: finalPages
    };
    
    setProcessedFiles(prev => {
        // If editing, replace the old file. If new, add to top.
        if (editingFileId) {
            return prev.map(f => f.id === editingFileId ? newFile : f);
        }
        return [newFile, ...prev];
    });
    
    // Redirect to list after save
    setView(ViewState.PROCESSED_LIST);
    setUploadedPages([]);
    setEditingFileId(null);
  };

  const handleDeleteProcessed = (id: string) => {
      setProcessedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleBulkDelete = (ids: string[]) => {
      setProcessedFiles(prev => prev.filter(f => !ids.includes(f.id)));
  };

  const handleOpenFile = (file: ProcessedFile) => {
      setUploadedPages(file.pages);
      setCurrentTool(file.tool);
      setEditingFileId(file.id);
      setView(ViewState.WORKSPACE);
  };

  const handleBackToHome = () => {
    setView(ViewState.LANDING);
    setCurrentTool(ToolType.DASHBOARD);
  };

  const handleGoToProjects = () => {
      setView(ViewState.PROCESSED_LIST);
  }

  // --- Render ---

  switch (view) {
    case ViewState.LANDING:
      return (
        <LandingPage 
          onGetStarted={handleLandingGetStarted} 
          onSelectTool={handleLandingSelectTool} 
        />
      );
    
    case ViewState.PROCESSED_LIST:
      return (
        <ProcessedFilesList 
            files={processedFiles} 
            onBackHome={handleBackToHome}
            onDelete={handleDeleteProcessed}
            onBulkDelete={handleBulkDelete}
            onOpen={handleOpenFile}
            onCreateNew={() => setView(ViewState.DASHBOARD)}
        />
      );

    case ViewState.UPLOAD:
      return (
        <UploadZone 
          tool={currentTool} 
          onCancel={handleUploadCancel} 
          onUploadSuccess={handleUploadComplete} 
        />
      );

    case ViewState.WORKSPACE:
      return (
        <Workspace 
          tool={currentTool} 
          initialPages={uploadedPages}
          initialName={editingFileId ? processedFiles.find(f => f.id === editingFileId)?.name : undefined}
          onBack={handleWorkspaceBack} 
          onNavigateTool={(t) => setCurrentTool(t)}
          onSave={handleWorkspaceSave}
          onReset={handleWorkspaceReset}
        />
      );

    case ViewState.DASHBOARD:
    default:
      return (
        <div>
             <div className="bg-white border-b border-slate-100 px-6 py-3 flex justify-between items-center text-sm">
                <button onClick={handleBackToHome} className="text-slate-500 hover:text-blue-600 font-medium">← Trang chủ</button>
                <button onClick={handleGoToProjects} className="text-blue-600 font-bold hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">📂 Dự án của tôi ({processedFiles.length})</button>
             </div>
            <Dashboard onSelectTool={handleSelectTool} />
        </div>
      );
  }
};

export default App;