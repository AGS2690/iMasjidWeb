import React from 'react';
import { Pagination } from './Pagination';
import { Input } from './Input';
import { Button } from './Button';
import { Search, Download, Inbox } from 'lucide-react';
import { exportToCsv, exportToJson, ExportColumn } from '../../utils/exportUtils';
import { useLocale } from '../../hooks/useLocale';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  exportValue?: (item: T) => any;
}

export interface PaginationConfig {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyField?: keyof T | ((item: T) => string);
  isLoading?: boolean;
  pagination?: PaginationConfig;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
  toolbarActions?: React.ReactNode;
  exportFilename?: string;
  enableExport?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  isLoading = false,
  pagination,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder,
  toolbarActions,
  exportFilename = 'records_export',
  enableExport = true,
  emptyMessage,
  emptyTitle,
}: DataTableProps<T>) {
  const { t } = useLocale();
  const getKey = (item: T, index: number): string => {
    if (typeof keyField === 'function') return keyField(item);
    return item[keyField] ? String(item[keyField]) : String(index);
  };

  const handleExportCsv = () => {
    const exportCols: ExportColumn<T>[] = columns
      .filter((c) => c.key !== 'actions')
      .map((c) => ({
        key: c.key,
        header: c.header,
        getValue: c.exportValue || ((item: T) => (c.render ? item[c.key] : item[c.key])),
      }));
    exportToCsv(data, exportCols, `${exportFilename}.csv`);
  };

  const handleExportJson = () => {
    exportToJson(data, `${exportFilename}.json`);
  };

  const showToolbar = onSearchChange !== undefined || toolbarActions !== undefined || enableExport;

  return (
    <div style={{ width: '100%' }}>
      {/* Search & Filter Toolbar */}
      {showToolbar && (
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ flex: '1', minWidth: '240px', maxWidth: '400px' }}>
            {onSearchChange !== undefined && (
              <Input
                placeholder={searchPlaceholder || t('Common.searchPlaceholder', 'Search records...')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                leftIcon={<Search size={16} />}
                style={{ marginBottom: 0 }}
              />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {toolbarActions}

            {enableExport && data.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download size={14} />}
                  onClick={handleExportCsv}
                  title="Export current view to CSV spreadsheet"
                >
                  {t('Common.exportCsv', 'Export CSV')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportJson}
                  title="Export raw JSON"
                >
                  {t('Common.exportJson', 'JSON')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Table Wrapper */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    width: col.width,
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="spinner-icon" style={{ width: '28px', height: '28px', borderTopColor: 'var(--primary-500)' }}></span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('Common.loadingRecords', 'Loading records...')}</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Inbox size={36} strokeWidth={1.5} />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      {emptyTitle || t('Common.noRecordsFound', 'No Records Found')}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      {emptyMessage || t('Common.noRecordsMatching', 'No records found matching your current filter criteria.')}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={getKey(item, index)}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        textAlign: col.align || 'left',
                      }}
                    >
                      {col.render ? col.render(item, index) : (item[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination && (
          <Pagination
            pageNumber={pagination.pageNumber}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        )}
      </div>
    </div>
  );
}
