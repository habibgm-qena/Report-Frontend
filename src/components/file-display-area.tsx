import React from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { File as FileIcon, Download, Edit, Trash2, Loader2 } from 'lucide-react';
import { FileType, FolderType as ApiFolderType } from '@/lib/api'; // Use types from API

interface FileDisplayAreaProps {
    breadcrumbs: { id: string; name: string }[];
    selectedFolder: ApiFolderType | null;
    onFileAction: (action: 'edit' | 'delete' | 'download', file: FileType) => void;
    onAddNewFile: () => void;
    userRole: 'admin' | 'user';
    isLoading: boolean; // For loading files in the display area
    isUpdating?: boolean; // For specific file action loading (e.g. delete)
    fileToDelete?: string | null; // ID of file being deleted
}

export const FileDisplayArea: React.FC<FileDisplayAreaProps> = ({
    breadcrumbs,
    selectedFolder,
    onFileAction,
    onAddNewFile,
    userRole,
    isLoading,
    isUpdating,
    fileToDelete
}) => {
    return (
        <div className='flex flex-1 flex-col overflow-hidden'>
            <div className='flex items-center justify-between border-b p-4'>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href='#'>Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        {breadcrumbs.map((crumb, index) => (
                            <BreadcrumbItem key={crumb.id}>
                                {index === breadcrumbs.length - 1 ? (
                                    <BreadcrumbLink href='#' className='font-medium'>
                                        {crumb.name}
                                    </BreadcrumbLink>
                                ) : (
                                    <>
                                        <BreadcrumbLink href='#'>{crumb.name}</BreadcrumbLink>
                                        <BreadcrumbSeparator />
                                    </>
                                )}
                            </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>

                {userRole === 'admin' && selectedFolder && (
                    <Button size='sm' onClick={onAddNewFile} disabled={isLoading}>
                        Add New Report
                    </Button>
                )}
            </div>

            <div className='flex-1 overflow-auto p-4'>
                {isLoading ? (
                    <div className='flex h-full items-center justify-center'>
                        <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    </div>
                ) : selectedFolder && selectedFolder.children.length > 0 ? (
                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                        {selectedFolder.children
                            .filter((item): item is FileType => item.type === 'file') // Type guard
                            .map((file) => (
                                <div
                                    key={file.id}
                                    className='group hover:border-primary relative rounded-md border p-3'>
                                    <div className='flex items-center gap-2'>
                                        <FileIcon className='text-muted-foreground h-4 w-4' />
                                        <span className='truncate text-sm font-medium'>
                                            {file.name}
                                        </span>
                                    </div>

                                    <div className='absolute top-2 right-2 hidden gap-1 group-hover:flex'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-6 w-6'
                                            onClick={() => onFileAction('download', file)}
                                            disabled={isUpdating && fileToDelete === file.id}>
                                            <Download className='h-3 w-3' />
                                        </Button>
                                        {userRole === 'admin' && (
                                            <>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-6 w-6'
                                                    onClick={() => onFileAction('edit', file)}
                                                    disabled={isUpdating && fileToDelete === file.id}>
                                                    <Edit className='h-3 w-3' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='h-6 w-6'
                                                    onClick={() => onFileAction('delete', file)}
                                                    disabled={isUpdating && fileToDelete === file.id}>
                                                    {isUpdating && fileToDelete === file.id ? (
                                                        <Loader2 className='h-3 w-3 animate-spin' />
                                                    ) : (
                                                        <Trash2 className='h-3 w-3' />
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : selectedFolder ? (
                    <div className='flex h-full items-center justify-center'>
                         <p className='text-muted-foreground'>This folder is empty. {userRole === 'admin' && 'Add a new report!'}</p>
                    </div>
                ) : (
                    <div className='flex h-full items-center justify-center'>
                        <p className='text-muted-foreground'>Select a folder to view files</p>
                    </div>
                )}
            </div>
        </div>
    );
}; 