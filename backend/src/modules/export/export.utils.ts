import ExcelJS from "exceljs";

export function exportToCSVBuffer(rows: any[], headers: string[]): Buffer {
  const escape = (val: any) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    // escape quotes + wrap if contains comma/newline
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines: string[] = [];
  lines.push(headers.join(","));

  for (const row of rows) {
    const line = headers.map((h) => escape(row[h])).join(",");
    lines.push(line);
  }

  return Buffer.from(lines.join("\n"), "utf8");
}

export async function exportToExcelBuffer(rows: any[], headers: string[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Export");

  ws.addRow(headers);

  for (const row of rows) {
    ws.addRow(headers.map((h) => row[h] ?? ""));
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
