import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ViewMode } from '@/store/fileManager';

interface ViewSortControlsProps {
    viewMode: ViewMode;
    sortBy: 'name' | 'date' | 'size';
    sortOrder: 'asc' | 'desc';
    onViewModeChange: (mode: ViewMode) => void;
    onSortChange: (sortBy: 'name' | 'date' | 'size') => void;
    onSortOrderChange: () => void;
}

function ViewSortControlsComponent({
    viewMode,
    sortBy,
    sortOrder,
    onViewModeChange,
    onSortChange,
    onSortOrderChange,
}: ViewSortControlsProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
            >
                <Grid className="mr-2 h-4 w-4" />
                Grid
            </Button>
            <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('list')}
            >
                <List className="mr-2 h-4 w-4" />
                List
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                        Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                        {sortOrder === 'asc' ? ' ↑' : ' ↓'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSortChange('name')}>
                        Name
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSortChange('date')}>
                        Date Modified
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSortChange('size')}>
                        Size
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export const ViewSortControls = memo(ViewSortControlsComponent); 