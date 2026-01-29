import ExcelJS from "exceljs";

export function exportToCSVBuffer(rows: any[], headers: string[]) {
  const escape = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];

  return Buffer.from(lines.join("\n"), "utf-8");
}

export async function exportToExcelBuffer(rows: any[], headers: string[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Export");

  ws.addRow(headers);

  rows.forEach((r) => {
    ws.addRow(headers.map((h) => r[h] ?? ""));
  });

  // simple styling
  ws.getRow(1).font = { bold: true };

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}