export const columns = [
  'id', 'name', 'description', 'website', 'phone_number', 'logo',
  'governance', 'created_at', 'updated_at',
];

export function validateAgencies(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Expected a non-empty agency array.');
  }
  const ids = new Set();
  return data.map((agency) => {
    if (!agency || typeof agency !== 'object') throw new Error('Invalid agency record.');
    const row = {};
    for (const column of columns) {
      const value = agency[column];
      if (value === null && ['phone_number', 'logo'].includes(column)) {
        row[column] = null;
      } else if (typeof value === 'string' && !value.includes('\0')) {
        row[column] = value;
      } else {
        throw new Error(`Invalid agency field: ${column}`);
      }
    }
    if (!row.id || !row.name || ids.has(row.id)) throw new Error('Missing/duplicate agency identity.');
    ids.add(row.id);
    return row;
  });
}
