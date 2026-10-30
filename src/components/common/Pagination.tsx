import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { useLocale } from '../../context/LocaleContext';

interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pageNumber,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}) => {
  const { t } = useLocale();
  const startItem = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        {t('Common.showing', 'Showing')} <strong>{startItem}</strong> {t('Common.to', 'to')}{' '}
        <strong>{endItem}</strong> {t('Common.of', 'of')}{' '}
        <strong>{totalCount}</strong> {t('Common.results', 'results')}
      </div>
      <div className="pagination-actions">
        <Button
          variant="outline"
          size="sm"
          disabled={pageNumber <= 1}
          onClick={() => onPageChange(pageNumber - 1)}
          icon={<ChevronLeft size={16} />}
        >
          {t('Common.previous', 'Previous')}
        </Button>
        <span className="pagination-current-page">
          {t('Common.page', 'Page')} {pageNumber} {t('Common.of', 'of')} {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={pageNumber >= totalPages || totalPages === 0}
          onClick={() => onPageChange(pageNumber + 1)}
        >
          {t('Common.next', 'Next')} <ChevronRight size={16} style={{ marginLeft: '4px' }} />
        </Button>
      </div>
    </div>
  );
};
