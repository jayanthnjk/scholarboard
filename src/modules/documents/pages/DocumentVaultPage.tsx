/**
 * Document Vault Page - File management with folder tree and upload.
 */

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import {
  Upload,
  Folder,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Eye,
  Download,
  Share2,
  Trash2,
  ChevronRight,
} from 'lucide-react';

type FileType = 'pdf' | 'image' | 'spreadsheet' | 'document' | 'other';

interface DocFile {
  id: string;
  name: string;
  type: FileType;
  size: string;
  modified: string;
  shared: boolean;
}

interface FolderItem {
  id: string;
  name: string;
  fileCount: number;
}

const FILE_ICONS: Record<FileType, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-500" />,
  image: <FileImage className="h-5 w-5 text-blue-500" />,
  spreadsheet: <FileSpreadsheet className="h-5 w-5 text-emerald-500" />,
  document: <FileText className="h-5 w-5 text-blue-600" />,
  other: <File className="h-5 w-5 text-gray-500" />,
};

const FOLDERS: FolderItem[] = [
  { id: '1', name: 'Admissions', fileCount: 24 },
  { id: '2', name: 'Fee Receipts', fileCount: 156 },
  { id: '3', name: 'Certificates', fileCount: 89 },
  { id: '4', name: 'Reports', fileCount: 34 },
  { id: '5', name: 'Staff Documents', fileCount: 67 },
  { id: '6', name: 'Policies', fileCount: 12 },
];

const FILES: DocFile[] = [
  { id: '1', name: 'Admission_Form_2024.pdf', type: 'pdf', size: '245 KB', modified: '2024-03-05', shared: false },
  { id: '2', name: 'Fee_Structure_Term2.xlsx', type: 'spreadsheet', size: '128 KB', modified: '2024-03-04', shared: true },
  { id: '3', name: 'School_Logo.png', type: 'image', size: '1.2 MB', modified: '2024-02-28', shared: true },
  { id: '4', name: 'Transfer_Certificate_Template.docx', type: 'document', size: '56 KB', modified: '2024-02-25', shared: false },
  { id: '5', name: 'Annual_Report_2023.pdf', type: 'pdf', size: '3.4 MB', modified: '2024-02-20', shared: true },
  { id: '6', name: 'Staff_Attendance_Feb.xlsx', type: 'spreadsheet', size: '89 KB', modified: '2024-03-01', shared: false },
];

export function DocumentVaultPage(): React.JSX.Element {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <PageContent>
      <PageHeader
        title="Document Vault"
        subtitle="Securely store and manage institutional documents."
        breadcrumbs={[{ label: 'Documents' }]}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
        }
      />

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* Folder Tree */}
        <aside className="w-full shrink-0 lg:w-56">
          <div className="rounded-lg border bg-card p-3">
            <h3 className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Folders
            </h3>
            <nav className="mt-2 space-y-0.5" aria-label="Folder navigation">
              {FOLDERS.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    selectedFolder === folder.id ? 'bg-accent font-medium' : 'hover:bg-accent/50'
                  }`}
                >
                  <Folder className="h-4 w-4 text-amber-500" />
                  <span className="flex-1 text-left">{folder.name}</span>
                  <span className="text-xs text-muted-foreground">{folder.fileCount}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* File List + Upload Zone */}
        <div className="flex-1 space-y-4">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            role="region"
            aria-label="File upload drop zone"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Drag and drop files here, or{' '}
              <span className="font-medium text-primary cursor-pointer">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">PDF, DOC, XLS, PNG, JPG up to 10MB</p>
          </div>

          {/* File List */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3">
              <h3 className="text-sm font-semibold">
                {selectedFolder ? FOLDERS.find((f) => f.id === selectedFolder)?.name : 'All Files'}
              </h3>
            </div>
            <div className="divide-y">
              {FILES.map((file) => (
                <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50">
                  {FILE_ICONS[file.type]}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.size} · Modified {file.modified}
                      {file.shared && ' · Shared'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" className="rounded p-1.5 hover:bg-accent" aria-label={`Preview ${file.name}`}>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button type="button" className="rounded p-1.5 hover:bg-accent" aria-label={`Download ${file.name}`}>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button type="button" className="rounded p-1.5 hover:bg-accent" aria-label={`Share ${file.name}`}>
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button type="button" className="rounded p-1.5 hover:bg-accent" aria-label={`Delete ${file.name}`}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContent>
  );
}
