export interface CSVRow {
  [key: string]: any;
}

export function csvToJson(csvData: string): CSVRow[] {
  const lines: string[] = csvData.split("\n");
  const headers: string[] = lines[0]
    .split(",")
    .map((header) => header.trim().replace(/^"|"$/g, "").trim());
  const json: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine: string[] = lines[i].split(",");

    // Check if the row is empty or consists only of whitespace characters
    if (currentLine.every((value) => !value.trim())) {
      continue; // Skip the last empty row
    }

    const obj: CSVRow = {};
    for (let j = 0; j < headers.length; j++) {
      const fieldValue: string = currentLine[j]
        ? currentLine[j].replace(/^"|"$/g, "").trim()
        : "";
      obj[headers[j]] = fieldValue;
    }
    json.push(obj);
  }

  return json;
}
