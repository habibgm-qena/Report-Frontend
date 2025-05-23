import { NextResponse } from 'next/server';

// Types
type FileType = {
    id: string;
    name: string;
    type: 'file';
    sql?: string;
};

type FolderType = {
    id: string;
    name: string;
    type: 'folder';
    children: (FileType | FolderType)[];
};

// Mock database
let fileSystem: { [key: string]: FolderType | FileType } = {
    'root': {
        id: 'root',
        name: 'Root',
        type: 'folder',
        children: [
            {
                id: 'folder-1',
                name: 'Reports',
                type: 'folder',
                children: []
            },
            {
                id: 'folder-2',
                name: 'Dashboards',
                type: 'folder',
                children: []
            }
        ]
    },
    'folder-1': {
        id: 'folder-1',
        name: 'Reports',
        type: 'folder',
        children: [
            {
                id: 'folder-1-1',
                name: 'Financial',
                type: 'folder',
                children: []
            },
            {
                id: 'folder-1-2',
                name: 'Marketing',
                type: 'folder',
                children: []
            }
        ]
    },
    'folder-1-1': {
        id: 'folder-1-1',
        name: 'Financial',
        type: 'folder',
        children: [
            {
                id: 'file-1-1-1',
                name: 'Q1 Report',
                type: 'file',
                sql: 'SELECT * FROM financial_data WHERE quarter = 1'
            },
            {
                id: 'file-1-1-2',
                name: 'Q2 Report',
                type: 'file',
                sql: 'SELECT * FROM financial_data WHERE quarter = 2'
            }
        ]
    },
    'folder-1-2': {
        id: 'folder-1-2',
        name: 'Marketing',
        type: 'folder',
        children: [
            {
                id: 'file-1-2-1',
                name: 'Campaign Analysis',
                type: 'file',
                sql: 'SELECT * FROM marketing_campaigns'
            }
        ]
    },
    'folder-2': {
        id: 'folder-2',
        name: 'Dashboards',
        type: 'folder',
        children: [
            {
                id: 'file-2-1',
                name: 'Executive Dashboard',
                type: 'file',
                sql: 'SELECT * FROM executive_metrics'
            }
        ]
    }
};

// GET /api/folders?id=folderId
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || 'root';

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const folder = fileSystem[id];
    if (!folder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json(folder);
}

// POST /api/folders
export async function POST(request: Request) {
    const body = await request.json();
    const { parentId, item } = body;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const parentFolder = fileSystem[parentId];
    if (!parentFolder || parentFolder.type !== 'folder') {
        return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 });
    }

    // Add new item to fileSystem
    if (item.type === 'folder') {
        fileSystem[item.id] = { ...item, children: [] };
    }
    
    // Add reference to parent's children
    parentFolder.children.push(item);

    return NextResponse.json(item);
}

// PATCH /api/folders
export async function PATCH(request: Request) {
    const body = await request.json();
    const { id, updates } = body;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const item = fileSystem[id];
    if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Update the item
    Object.assign(item, updates);

    return NextResponse.json(item);
}

// DELETE /api/folders?id=itemId
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const item = fileSystem[id];
    if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // If it's a folder, check if it's empty
    if (item.type === 'folder' && item.children.length > 0) {
        return NextResponse.json({ error: 'Cannot delete non-empty folder' }, { status: 400 });
    }

    // Remove item from parent's children
    Object.values(fileSystem).forEach(fsItem => {
        if (fsItem.type === 'folder') {
            fsItem.children = fsItem.children.filter(child => child.id !== id);
        }
    });

    // Remove item from fileSystem
    delete fileSystem[id];

    return NextResponse.json({ success: true });
} 