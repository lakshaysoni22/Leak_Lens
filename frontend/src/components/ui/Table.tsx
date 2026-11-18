import React from 'react';
import { cn } from '@/lib/utils';
import Skeleton from './Skeleton';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  loading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
  striped?: boolean;
}

function Table<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'No records found',
  emptyIcon,
  onRowClick,
  className,
  striped = true,
}: TableProps<T>) {
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-white/[0.08] bg-surface/50', className)}>
      <table className="w-full text-left text-sm border-collapse">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.02]">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider select-none',
                  getAlignClass(col.align),
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-white/[0.04]">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, rIdx) => (
              <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                {columns.map((_col, cIdx) => (
                  <td key={`skeleton-cell-${rIdx}-${cIdx}`} className="px-4 py-3.5">
                    <Skeleton variant="text" className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-text-muted"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  {emptyIcon}
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const rowKey = keyExtractor
                ? keyExtractor(item, index)
                : (item as { id?: string | number })?.id ?? index;

              const isClickable = !!onRowClick;

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(item, index)}
                  className={cn(
                    'transition-colors duration-150',
                    isClickable ? 'cursor-pointer hover:bg-white/[0.05]' : 'hover:bg-white/[0.02]',
                    striped && index % 2 === 1 && 'bg-white/[0.015]'
                  )}
                >
                  {columns.map((col) => {
                    const cellContent = col.render
                      ? col.render(item, index)
                      : (item as Record<string, unknown>)[col.key] as React.ReactNode;

                    return (
                      <td
                        key={`${String(rowKey)}-${col.key}`}
                        className={cn(
                          'px-4 py-3.5 text-text-primary text-sm whitespace-nowrap',
                          getAlignClass(col.align),
                          col.className
                        )}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
