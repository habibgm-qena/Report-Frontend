'use client';

import formatDate from '@/utils/dateFormatter';

interface ScoreProgressEntry {
    hash: string;
    score: number;
    date: string;
    limit: string;
    status: 'Paid' | 'Pending' | 'Overdue';
}

interface ScoreProgressTableProps {
    scoreProgressData: ScoreProgressEntry[];
}

const RenderScoreProgressTable: React.FC<ScoreProgressTableProps> = ({ scoreProgressData }) => (
    <div className='scrollbar-hidden overflow-x-scroll'>
        <table className='w-full' role='table'>
            <thead>
                <tr className='border-none'>
                    <th className='px-4 py-2 text-left font-medium'>Hash Number</th>
                    <th className='px-4 py-2 text-left font-medium'>Score</th>
                    <th className='px-4 py-2 text-left font-medium'>Date</th>
                    <th className='px-4 py-2 text-left font-medium'>Limit amount</th>
                    <th className='px-4 py-2 text-left font-medium'>Loan status</th>
                </tr>
            </thead>
            <tbody>
                {scoreProgressData.map((row, index) => (
                    <tr key={index} className='border-b hover:bg-gray-50'>
                        <td className='px-4 py-2'>{row.hash}</td>
                        <td className='px-4 py-2'>{row.score}</td>
                        <td className='px-4 py-2'>{formatDate(row.date)}</td>
                        <td className='px-4 py-2'>{row.limit}</td>
                        <td className='px-4 py-2'>
                            <span className='inline-flex items-center'>
                                <span className='mr-2 text-green-500' aria-hidden='true'>
                                    ●
                                </span>
                                {row.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default RenderScoreProgressTable;
