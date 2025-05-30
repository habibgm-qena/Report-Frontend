import { NextResponse } from 'next/server';

import $axios from '@/lib/axiosInstance';

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

type BackendNodeType = {
    id: string;
    name: string;
    description: string | null;
    parent: string | null;
    organization: string;
    sql_query?: string;
    children: BackendNodeType[];
    type: 'file' | 'folder';
};

// Transform backend response to frontend format
function transformBackendToFrontend(node: BackendNodeType): FileType | FolderType {
    if (node.type === 'file') {
        console.log('node', node);
        return {
            id: node.id,
            name: node.name,
            type: 'file',
            sql: node.sql_query || '' // Assuming the first query contains the SQL
        };
    }

    return {
        id: node.id,
        name: node.name,
        type: 'folder',
        children: (node.children || []).map((child: BackendNodeType) => transformBackendToFrontend(child))
    };
}

// Mock database
const fileSystem: { [key: string]: FolderType | FileType } = {
    root: {
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
    const id = searchParams.get('id');

    try {
        const apiEndpoint = id && id !== 'root' ? `/nodes/${id}/` : '/nodes/';
        // console.log('fetching folders from backend /api/folders', process.env.NEXT_PUBLIC_X_API_KEY);
        const { data } = await $axios.get(apiEndpoint, {
            headers: {
                'X-API-KEY': process.env.NEXT_PUBLIC_X_API_KEY
                // 'ROLE': 'admin'
            }
        });

        return NextResponse.json(data);
    } catch (error) {
        console.log('error fetching folders from backend /api/folders', error);
        return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
    }
}

// POST /api/folders
export async function POST(request: Request) {
    const body = await request.json();
    const { parentId, item } = body;

    try {
        if (item.type === 'file') {
            const { data } = await $axios.post(
                `database/${item.databaseId}/queries/`,
                {
                    name: item.name,
                    node: parentId === 'root' ? null : parentId,
                    sql_query: item.sql,
                },
                {
                    headers: {
                        'x-api-key': process.env.NEXT_PUBLIC_X_API_KEY,
                        ROLE: 'admin'
                    }
                }
            );

            return NextResponse.json(data);
        } else {
            const { data } = await $axios.post(
                '/nodes/',
                {
                    name: item.name,
                    parent_id: parentId === 'root' ? null : parentId
                },
                {
                    headers: {
                        'x-api-key': process.env.NEXT_PUBLIC_X_API_KEY,
                        ROLE: 'admin'
                    }
                }
            );

            return NextResponse.json(data);
        }
    } catch (error) {
        console.log('error fetching folders from backend /api/folders', error);
        return NextResponse.json({ error: (error as any).response.data }, { status: (error as any).response.status });
    }
}

// PATCH /api/folders
export async function PATCH(request: Request) {
    const body = await request.json();
    const { id, updates } = body;

    try {
        const { data } = await $axios.patch(`/nodes/${id}/`, updates, {
            headers: {
                'x-api-key': process.env.NEXT_PUBLIC_X_API_KEY,
                ROLE: 'admin'
            }
        });

        return NextResponse.json(data);
    } catch (error) {
        console.log('error fetching folders from backend /api/folders', error);
        return NextResponse.json({ error: (error as any).response.data }, { status: (error as any).response.status });
    }
}

// DELETE /api/folders?id=itemId
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        const { data } = await $axios.delete(`/nodes/${id}/`, {
            headers: {
                'x-api-key': process.env.NEXT_PUBLIC_X_API_KEY,
                ROLE: 'admin'
            }
        });

        return NextResponse.json(data);
    } catch (error) {
        console.log('error fetching folders from backend /api/folders', error);
        return NextResponse.json({ error: (error as any).response.data }, { status: (error as any).response.status });
    }
}
