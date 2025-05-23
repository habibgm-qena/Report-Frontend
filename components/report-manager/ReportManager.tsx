'use client';

import React, { useState, useEffect } from 'react';
import { TreeView, TreeItem } from '@mui/x-tree-view'; // Using MUI for TreeView for now, can replace later if needed
import { ChevronDown, ChevronRight, FolderPlus, FilePlus, Download, Edit, Trash2, PlusCircle, Folder, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { initialReportData, ReportItem, ReportFolder, ReportFile, findItemByPath, getFolderChildrenByPath, addItemToFolder, updateItemInTree, deleteItemFromTree, generateId } from './types';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

interface ReportManagerProps {
  userRole: 'admin' | 'viewer';
}

const ReportManager: React.FC<ReportManagerProps> = ({ userRole }) => {
  const [reportData, setReportData] = useState<ReportFolder[]>(initialReportData);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(initialReportData.length > 0 ? initialReportData[0].path : null);
  const [selectedFile, setSelectedFile] = useState<ReportFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [reportName, setReportName] = useState('');
  const [reportSql, setReportSql] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [itemToDelete, setItemToDelete] = useState<ReportItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const selectedFolder = selectedFolderPath ? findItemByPath(reportData, selectedFolderPath) as ReportFolder : null;
  const currentFiles = selectedFolderPath ? getFolderChildrenByPath(reportData, selectedFolderPath) : [];

  const handleFolderSelect = (path: string) => {
    setSelectedFolderPath(path);
  };

  const openModal = (mode: 'create' | 'edit', file?: ReportFile) => {
    setModalMode(mode);
    if (mode === 'edit' && file) {
      setSelectedFile(file);
      setReportName(file.name);
      setReportSql(file.sql);
    } else {
      setSelectedFile(null);
      setReportName('');
      setReportSql('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setReportName('');
    setReportSql('');
  };

  const handleSaveReport = () => {
    if (!selectedFolderPath) return;

    if (modalMode === 'create') {
      const newFile: ReportFile = {
        id: generateId(),
        name: reportName,
        sql: reportSql,
        type: 'file',
        path: `${selectedFolderPath}/${reportName}`
      };
      setReportData(addItemToFolder(reportData, selectedFolderPath, newFile));
    } else if (selectedFile) {
      const updatedFile: ReportFile = { ...selectedFile, name: reportName, sql: reportSql, path: `${selectedFolderPath}/${reportName}` };
      setReportData(updateItemInTree(reportData, updatedFile) as ReportFolder[]);
    }
    closeModal();
  };

  const handleAddFolder = (parentPath: string) => {
    setEditingFolder(parentPath);
    setNewFolderName('New Folder');
  };

  const handleNewFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFolderName(e.target.value);
  };

  const saveNewFolder = (parentPath: string) => {
    if (!newFolderName.trim()) return; // Prevent creating folder with empty name
    const newFolder: ReportFolder = {
      id: generateId(),
      name: newFolderName,
      type: 'folder',
      children: [],
      path: `${parentPath}/${newFolderName}`
    };
    setReportData(addItemToFolder(reportData, parentPath, newFolder));
    setEditingFolder(null);
    setNewFolderName('');
  };

  const handleDownload = (file: ReportFile) => {
    console.log('Downloading:', file.name, file.sql);
    // Dummy download logic
    const element = document.createElement("a");
    const fileBlob = new Blob([file.sql], {type : 'text/plain'});
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${file.name}.sql`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  const openDeleteConfirm = (item: ReportItem) => {
    setItemToDelete(item);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setItemToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

 const handleDelete = () => {
    if (!itemToDelete) return;
    setReportData(deleteItemFromTree(reportData, itemToDelete.path) as ReportFolder[]);
    // If the deleted item was the selected folder, select its parent or the first folder
    if (selectedFolderPath === itemToDelete.path) {
        const pathParts = itemToDelete.path.split('/');
        if (pathParts.length > 1) {
            setSelectedFolderPath(pathParts.slice(0, -1).join('/'));
        } else {
            setSelectedFolderPath(reportData.length > 0 && reportData[0].path !== itemToDelete.path ? reportData[0].path : (reportData.length > 1 ? reportData[1].path : null) );
        }
    }
    closeDeleteConfirm();
  };


  const renderTree = (nodes: ReportItem[]) => {
    return nodes.map((node) => {
        const isSelected = selectedFolderPath === node.path;
        return (
            <div key={node.id} className={`group text-sm rounded-md ${isSelected ? 'bg-muted' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <div className={`flex items-center justify-between p-1.5 pr-2 cursor-pointer`}
                     onClick={() => node.type === 'folder' && handleFolderSelect(node.path)}
                >
                    <div className="flex items-center">
                        {node.type === 'folder' && ( (node as ReportFolder).children.length > 0 ? <ChevronDown size={16} className="mr-1" /> : <ChevronRight size={16} className="mr-1 opacity-50"/>)}
                        {node.type === 'file' && <FileText size={16} className="mr-1.5 ml-0.5 text-blue-500" />}
                        {node.type === 'folder' && <Folder size={16} className="mr-1.5 text-yellow-500" />}
                        <span className={`truncate max-w-[150px] ${node.type === 'file' ? 'ml-4' : ''}`}>{node.name.replace('.sql', '')}</span>
                    </div>
                    {userRole === 'admin' && node.type === 'folder' && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                    <PlusCircle size={14} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-40 p-2">
                                <Button variant="ghost" className="w-full justify-start text-sm h-8" onClick={() => handleAddFolder(node.path)}>
                                    <FolderPlus size={16} className="mr-2" /> New Folder
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-sm h-8" onClick={() => { setSelectedFolderPath(node.path); openModal('create'); }}>
                                    <FilePlus size={16} className="mr-2" /> New File
                                </Button>
                            </PopoverContent>
                        </Popover>
                    )}
                     {userRole !== 'admin' && node.type === 'folder' && (
                        <Lock size={14} className="text-gray-400" />
                    )}
                </div>
                {editingFolder === node.path && node.type ==='folder' && (
                    <div className="pl-6 pr-2 py-1 flex items-center">
                        <Input
                            type="text"
                            value={newFolderName}
                            onChange={handleNewFolderNameChange}
                            onBlur={() => saveNewFolder(node.path)} // Save on blur
                            onKeyDown={(e) => e.key === 'Enter' && saveNewFolder(node.path)} // Save on Enter
                            className="h-7 text-sm"
                            autoFocus
                        />
                    </div>
                )}
                {node.type === 'folder' && (node as ReportFolder).children.length > 0 && selectedFolderPath?.startsWith(node.path) && (
                    <div className="pl-4 border-l border-gray-200 dark:border-gray-700 ml-2">
                        {renderTree((node as ReportFolder).children)}
                    </div>
                )}
            </div>
        );
    });
  };

  const getBreadcrumbs = () => {
    if (!selectedFolderPath) return [];
    const parts = selectedFolderPath.split('/');
    let currentPath = '';
    return parts.map((part, index) => {
      currentPath += (index > 0 ? '/' : '') + part;
      return {
        name: part,
        path: currentPath,
        isLast: index === parts.length - 1,
      };
    });
  };
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-xs">
      {/* Sidebar */}
      <div className="w-64 border-r dark:border-gray-700 bg-white dark:bg-gray-800 p-3 space-y-2 overflow-y-auto">
        <h2 className="text-base font-semibold mb-2 px-1.5">Report Explorer</h2>
        {renderTree(reportData)}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 flex flex-col">
        {selectedFolder && (
          <>
          <div className="flex justify-between items-center mb-3 pb-2 border-b dark:border-gray-700">
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.path}>
                            <BreadcrumbItem>
                                {crumb.isLast ? (
                                    <BreadcrumbPage className="text-sm">{crumb.name}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href="#" onClick={() => handleFolderSelect(crumb.path)} className="text-sm">
                                        {crumb.name}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!crumb.isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
            {userRole === 'admin' && (
                <Button size="sm" onClick={() => openModal('create')} className="text-xs px-2 py-1 h-7">
                    <PlusCircle size={14} className="mr-1.5" /> Add New Report
                </Button>
            )}
          </div>

            {currentFiles.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm">This folder is empty.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {currentFiles.filter(item => item.type === 'file').map((file) => (
                <div key={file.id} className="group relative bg-white dark:bg-gray-800 p-3 rounded-md border dark:border-gray-700 hover:shadow-md transition-shadow">
                  <FileText size={24} className="mb-2 text-blue-500" />
                  <h3 className="text-sm font-medium truncate mb-1" title={file.name}>{file.name.replace('.sql','')}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={file.sql}>SQL: {file.sql}</p>
                  {userRole === 'admin' && (
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleDownload(file as ReportFile)}>
                        <Download size={12} />
                      </Button>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => openModal('edit', file as ReportFile)}>
                        <Edit size={12} />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-6 w-6" onClick={() => openDeleteConfirm(file)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {!selectedFolder && <p className="text-gray-500 dark:text-gray-400 text-sm">Select a folder to view its contents.</p>}
      </div>

      {/* Modal for Create/Edit File */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base">{modalMode === 'create' ? 'Create New Report' : 'Edit Report'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-4 items-center gap-3">
              <label htmlFor="name" className="text-right text-xs col-span-1">Name</label>
              <Input id="name" value={reportName} onChange={(e) => setReportName(e.target.value)} className="col-span-3 h-8 text-xs" />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <label htmlFor="sql" className="text-right text-xs col-span-1">SQL</label>
              <textarea id="sql" value={reportSql} onChange={(e) => setReportSql(e.target.value)} className="col-span-3 h-20 text-xs p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" size="sm" className="text-xs">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveReport} size="sm" className="text-xs">Save Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm">
            Are you sure you want to delete "<span className="font-semibold">{itemToDelete?.name.replace('.sql', '')}</span>"?
            {itemToDelete?.type === 'folder' && (itemToDelete as ReportFolder).children.length > 0 && 
                <p className='text-red-500 text-xs mt-1'>This folder contains other items that will also be deleted.</p>
            }
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="outline" size="sm" className="text-xs">Cancel</Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleDelete} size="sm" className="text-xs">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportManager; 