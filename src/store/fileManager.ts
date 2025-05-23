import { atom, Getter, Setter } from 'jotai';
import { FileType, FolderType } from '@/services/folderService';

export type ViewMode = 'grid' | 'list';

export interface TreeNode extends FolderType {
  isLoaded: boolean;
  isLoading: boolean;
  children: (TreeNode | FileType)[];
}

interface FileManagerState {
  expanded: string[];
  selected: string | null;
  treeData: { [key: string]: TreeNode };  // Flat structure of all loaded folders
  selectedFolder: TreeNode | null;
  breadcrumbs: { id: string; name: string }[];
  selectedFile: FileType | null;
  viewMode: ViewMode;
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
}

const initialState: FileManagerState = {
  expanded: ['root'],
  selected: 'root',
  treeData: {},
  selectedFolder: null,
  breadcrumbs: [{ id: 'root', name: 'Root' }],
  selectedFile: null,
  viewMode: 'grid',
  sortBy: 'name',
  sortOrder: 'asc',
};

export const fileManagerAtom = atom<FileManagerState>(initialState);

// Helper function to convert FolderType to TreeNode
const folderToTreeNode = (folder: FolderType): TreeNode => ({
  ...folder,
  isLoaded: false,
  isLoading: false,
  children: (folder.children || []).map((child: FileType | FolderType) => 
    child.type === 'folder' ? folderToTreeNode(child as FolderType) : child
  )
});

export const treeActionsAtom = atom(
  null,
  (get: Getter, set: Setter, action: {
    type: 'EXPAND_FOLDER' | 'COLLAPSE_FOLDER' | 'SELECT_FOLDER' | 'UPDATE_FOLDER' | 'SET_LOADING';
    payload: any;
  }) => {
    const state = get(fileManagerAtom);
    
    switch (action.type) {
      case 'EXPAND_FOLDER': {
        const { folderId } = action.payload;
        const newExpanded = [...state.expanded];
        if (!newExpanded.includes(folderId)) {
          newExpanded.push(folderId);
        }
        set(fileManagerAtom, { ...state, expanded: newExpanded });
        break;
      }
      
      case 'COLLAPSE_FOLDER': {
        const { folderId } = action.payload;
        const newExpanded = state.expanded.filter(id => id !== folderId);
        set(fileManagerAtom, { ...state, expanded: newExpanded });
        break;
      }
      
      case 'SELECT_FOLDER': {
        const { folder } = action.payload;
        const treeNode = state.treeData[folder.id] || folderToTreeNode(folder);
        set(fileManagerAtom, {
          ...state,
          selected: folder.id,
          selectedFolder: treeNode,
          treeData: {
            ...state.treeData,
            [folder.id]: treeNode
          }
        });
        break;
      }
      
      case 'UPDATE_FOLDER': {
        const { folder } = action.payload;
        const treeNode = folderToTreeNode(folder);
        const newTreeData = {
          ...state.treeData,
          [folder.id]: {
            ...treeNode,
            isLoaded: true,
            isLoading: false,
            children: folder.children || []
          }
        };
        
        // Also add any child folders to the tree
        folder.children?.forEach((child: FileType | FolderType) => {
          if (child.type === 'folder' && !state.treeData[child.id]) {
            newTreeData[child.id] = folderToTreeNode(child as FolderType);
          }
        });
        
        set(fileManagerAtom, {
          ...state,
          treeData: newTreeData,
          selectedFolder: state.selectedFolder?.id === folder.id ? newTreeData[folder.id] : state.selectedFolder
        });
        break;
      }
      
      case 'SET_LOADING': {
        const { folderId, isLoading } = action.payload;
        const folder = state.treeData[folderId];
        if (folder) {
          const updatedFolder = { ...folder, isLoading };
          set(fileManagerAtom, {
            ...state,
            treeData: {
              ...state.treeData,
              [folderId]: updatedFolder
            },
            selectedFolder: state.selectedFolder?.id === folderId ? updatedFolder : state.selectedFolder
          });
        }
        break;
      }
    }
  }
);

export const selectedFolderAtom = atom(
  (get: Getter) => get(fileManagerAtom).selectedFolder,
  (get: Getter, set: Setter, selectedFolder: TreeNode | null) => {
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