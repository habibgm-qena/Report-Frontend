import { useAtom } from 'jotai';
import { FileType, FolderType } from '@/services/folderService';
import { viewModeAtom, sortConfigAtom } from '@/store/fileManager';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Download,
    Edit,
    File,
    Grid,
    List,
    Loader2,
    MoreVertical,
    SortAsc,
    SortDesc,
    Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface FileDisplayAreaProps {
    selectedFolder: FolderType | null;
    onFileAction: (action: 'edit' | 'delete' | 'download', file: FileType) => void;
    userRole: 'admin' | 'user';
    isLoading: boolean;
    isUpdating?: boolean;
    fileToDelete?: string | null;
    viewMode: 'grid' | 'list';
    sortBy: 'name' | 'date' | 'size';
    sortOrder: 'asc' | 'desc';
}

export function FileDisplayArea({
    selectedFolder,
    onFileAction,
    userRole,
    isLoading,
    isUpdating,
    fileToDelete,
    viewMode,
    sortBy,
    sortOrder,
}: FileDisplayAreaProps) {
    const sortedFiles = selectedFolder?.children
        ?.filter((item): item is FileType => item.type === 'file')
        ?.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'date':
                    comparison = (new Date(b.updatedAt || 0)).getTime() - (new Date(a.updatedAt || 0)).getTime();
                    break;
                case 'size':
                    comparison = (b.size || 0) - (a.size || 0);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        }) || [];

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const FileActions = ({ file }: { file: FileType }) => (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onFileAction('download', file)}
                disabled={isUpdating && fileToDelete === file.id}
            >
                <Download className="h-4 w-4" />
            </Button>
            {userRole === 'admin' && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onFileAction('edit', file)}
                        disabled={isUpdating && fileToDelete === file.id}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onFileAction('delete', file)}
                        disabled={isUpdating && fileToDelete === file.id}
                    >
                        {isUpdating && fileToDelete === file.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                </>
            )}
        </div>
    );

    if (!selectedFolder) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Select a folder to view files</p>
            </div>
        );
    }

    if (sortedFiles.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                    This folder is empty. {userRole === 'admin' && 'Add a new file!'}
                </p>
            </div>
        );
    }

    return (
        <div className="h-full space-y-4 p-4">
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {sortedFiles.map((file) => (
                        <div
                            key={file.id}
                            className={cn(
                                'group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md',
                                'hover:border-primary/50'
                            )}
                        >
                            <div className="mb-2 flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <File className="h-8 w-8 text-primary/70" />
                                    <div>
                                        <h3 className="font-medium">{file.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(file.updatedAt || Date.now()), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onFileAction('download', file)}>
                                            Download
                                        </DropdownMenuItem>
                                        {userRole === 'admin' && (
                                            <>
                                                <DropdownMenuItem onClick={() => onFileAction('edit', file)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => onFileAction('delete', file)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {file.description && (
                                <p className="text-sm text-muted-foreground">{file.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Name</TableHead>
                                <TableHead className="w-[20%]">Modified</TableHead>
                                <TableHead className="w-[20%]">Size</TableHead>
                                <TableHead className="w-[20%]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedFiles.map((file) => (
                                <TableRow key={file.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <File className="h-4 w-4 text-primary/70" />
                                            <span>{file.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDistanceToNow(new Date(file.updatedAt || Date.now()), {
                                            addSuffix: true,
                                        })}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {file.size ? `${Math.round(file.size / 1024)} KB` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <FileActions file={file} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
} 