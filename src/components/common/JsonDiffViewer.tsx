import React from 'react';

interface JsonDiffViewerProps {
  oldValues?: string | null;
  newValues?: string | null;
}

export const JsonDiffViewer: React.FC<JsonDiffViewerProps> = ({ oldValues, newValues }) => {
  let parsedOld: any = null;
  let parsedNew: any = null;

  try {
    if (oldValues) parsedOld = JSON.parse(oldValues);
  } catch {
    parsedOld = oldValues;
  }

  try {
    if (newValues) parsedNew = JSON.parse(newValues);
  } catch {
    parsedNew = newValues;
  }

  return (
    <div className="json-diff-container">
      <div className="json-diff-column">
        <h4 className="json-diff-heading old">Before (Previous State)</h4>
        <pre className="json-diff-block">
          {parsedOld ? JSON.stringify(parsedOld, null, 2) : 'No previous data (Created)'}
        </pre>
      </div>
      <div className="json-diff-column">
        <h4 className="json-diff-heading new">After (Updated State)</h4>
        <pre className="json-diff-block">
          {parsedNew ? JSON.stringify(parsedNew, null, 2) : 'No new data (Deleted)'}
        </pre>
      </div>
    </div>
  );
};
