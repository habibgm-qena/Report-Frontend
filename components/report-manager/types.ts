export interface ReportFile {
  id: string;
  name: string;
  type: 'file';
  sql: string;
  path: string; // Full path to the file, e.g., "folder1/folder2/file.sql"
}

export interface ReportFolder {
  id: string;
  name: string;
  type: 'folder';
  children: ReportItem[];
  path: string; // Full path to the folder, e.g., "folder1/folder2"
}

export type ReportItem = ReportFolder | ReportFile;

// Sample Data Structure
export const initialReportData: ReportFolder[] = [
  {
    id: '1',
    name: 'Sales Reports',
    type: 'folder',
    path: 'Sales Reports',
    children: [
      {
        id: '1-1',
        name: 'Q1 Sales',
        type: 'folder',
        path: 'Sales Reports/Q1 Sales',
        children: [
          { id: '1-1-1', name: 'January_Sales_Overview.sql', type: 'file', sql: 'SELECT * FROM sales WHERE month = 1;', path: 'Sales Reports/Q1 Sales/January_Sales_Overview.sql' },
          { id: '1-1-2', name: 'February_Product_Performance.sql', type: 'file', sql: 'SELECT product, SUM(amount) FROM sales WHERE month = 2 GROUP BY product;', path: 'Sales Reports/Q1 Sales/February_Product_Performance.sql' },
        ],
      },
      {
        id: '1-2',
        name: 'Annual_Summary.sql',
        type: 'file',
        sql: 'SELECT YEAR(date) as report_year, SUM(amount) as total_sales FROM sales GROUP BY report_year;',
        path: 'Sales Reports/Annual_Summary.sql',
      },
    ],
  },
  {
    id: '2',
    name: 'Marketing Reports',
    type: 'folder',
    path: 'Marketing Reports',
    children: [
      { id: '2-1', name: 'Campaign_Effectiveness.sql', type: 'file', sql: 'SELECT campaign, COUNT(lead_id) as leads FROM marketing_campaigns GROUP BY campaign;', path: 'Marketing Reports/Campaign_Effectiveness.sql' },
    ],
  },
  {
    id: '3',
    name: 'Empty Folder',
    type: 'folder',
    path: 'Empty Folder',
    children: [],
  }
];

// Helper function to find an item by path
export const findItemByPath = (items: ReportItem[], path: string): ReportItem | undefined => {
  for (const item of items) {
    if (item.path === path) {
      return item;
    }
    if (item.type === 'folder' && path.startsWith(item.path + '/')) {
      const found = findItemByPath(item.children, path);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

// Helper function to get children of a folder by path
export const getFolderChildrenByPath = (items: ReportFolder[], path: string): ReportItem[] => {
  const folder = findItemByPath(items, path);
  if (folder && folder.type === 'folder') {
    return folder.children;
  }
  return [];
};

// Helper function to add an item to a folder
export const addItemToFolder = (items: ReportFolder[], parentFolderPath: string, newItem: ReportItem): ReportFolder[] => {
  return items.map(item => {
    if (item.path === parentFolderPath && item.type === 'folder') {
      return {
        ...item,
        children: [...item.children, newItem],
      };
    }
    if (item.type === 'folder' && parentFolderPath.startsWith(item.path + '/')) {
      return {
        ...item,
        children: addItemToFolder(item.children as ReportFolder[], parentFolderPath, newItem), // Recursive call expects ReportFolder[] for its items
      };
    }
    return item;
  }) as ReportFolder[]; // Ensure the final result is ReportFolder[]
};


// Helper function to update an item
export const updateItemInTree = (items: ReportItem[], updatedItem: ReportItem): ReportItem[] => {
  return items.map(item => {
    if (item.id === updatedItem.id) {
      return updatedItem;
    }
    if (item.type === 'folder' && updatedItem.path.startsWith(item.path + '/')) {
      return {
        ...item,
        children: updateItemInTree(item.children, updatedItem),
      };
    }
    return item;
  });
};

// Helper function to delete an item
export const deleteItemFromTree = (items: ReportItem[], itemPathToDelete: string): ReportItem[] => {
  return items.filter(item => item.path !== itemPathToDelete).map(item => {
    if (item.type === 'folder' && itemPathToDelete.startsWith(item.path + '/')) {
      return {
        ...item,
        children: deleteItemFromTree(item.children, itemPathToDelete),
      };
    }
    return item;
  });
};

// Helper to generate unique IDs
export const generateId = () => Date.now().toString(); 