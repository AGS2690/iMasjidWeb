export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  getValue?: (item: T) => any;
}

const escapeCsvCell = (value: string): string => {
  let firstNonWhitespace = value.length - value.trimStart().length;
  while (
    firstNonWhitespace < value.length &&
    (value.charCodeAt(firstNonWhitespace) <= 0x20 || value.charCodeAt(firstNonWhitespace) === 0xfeff)
  ) {
    firstNonWhitespace++;
  }
  const firstCharacter = value[firstNonWhitespace];
  const safeValue = firstCharacter && '=+-@'.includes(firstCharacter) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
};

export function exportToCsv<T>(data: T[], columns: ExportColumn<T>[], filename = 'export.csv') {
  if (!data || data.length === 0) return;

  const headers = columns.map((col) => escapeCsvCell(col.header)).join(',');

  const rows = data.map((item) =>
    columns
      .map((col) => {
        let val: any;
        if (col.getValue) {
          val = col.getValue(item);
        } else {
          val = (item as any)[col.key];
        }

        if (val === null || val === undefined) {
          return '""';
        }

        if (Array.isArray(val)) {
          val = val.join('; ');
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        }

        return escapeCsvCell(String(val));
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJson<T>(data: T[], filename = 'export.json') {
  if (!data || data.length === 0) return;

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
