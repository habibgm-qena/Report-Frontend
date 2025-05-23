import { atom, Getter, Setter } from 'jotai';
import { FileType, FolderType } from '@/services/folderService';

export type ViewMode = 'grid' | 'list';

interface FileManagerState {
  expanded: string[];
  selected: string;
  loadingFolderId: string | null;
  selectedFolder: FolderType | null;
  expandedFolders: { [key: string]: FolderType };
  breadcrumbs: { id: string; name: string }[];
  selectedFile: FileType | null;
  viewMode: ViewMode;
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
}

const initialState: FileManagerState = {
  expanded: ['root'],
  selected: 'root',
  loadingFolderId: null,
  selectedFolder: null,
  expandedFolders: {},
  breadcrumbs: [],
  selectedFile: null,
  viewMode: 'grid',
  sortBy: 'name',
  sortOrder: 'asc',
};

export const fileManagerAtom = atom<FileManagerState>(initialState);

// Derived atoms for specific state slices
export const viewModeAtom = atom(
  (get: Getter) => get(fileManagerAtom).viewMode,
  (get: Getter, set: Setter, viewMode: ViewMode) => {
    const state = get(fileManagerAtom);
    set(fileManagerAtom, { ...state, viewMode });
  }
);

export const sortConfigAtom = atom(
  (get: Getter) => ({
    sortBy: get(fileManagerAtom).sortBy,
    sortOrder: get(fileManagerAtom).sortOrder,
  }),
  (get: Getter, set: Setter, { sortBy, sortOrder }: Pick<FileManagerState, 'sortBy' | 'sortOrder'>) => {
    const state = get(fileManagerAtom);
    set(fileManagerAtom, { ...state, sortBy, sortOrder });
  }
);

export const selectedFolderAtom = atom(
  (get: Getter) => get(fileManagerAtom).selectedFolder,
  (get: Getter, set: Setter, selectedFolder: FolderType | null) => {
    const state = get(fileManagerAtom);
    set(fileManagerAtom, { ...state, selectedFolder });
  }
);

export const breadcrumbsAtom = atom(
  (get: Getter) => get(fileManagerAtom).breadcrumbs,
  (get: Getter, set: Setter, breadcrumbs: { id: string; name: string }[]) => {
    const state = get(fileManagerAtom);
    set(fileManagerAtom, { ...state, breadcrumbs });
  }
); 