const XLSX = require('xlsx');

const filePath = 'c:\\Users\\LUIGI\\Desktop\\demo HAPPY SAC\\recetas para erp30-03 (1).xlsx';
const workbook = XLSX.readFile(filePath);

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    console.log(`--- START SHEET: ${sheetName} ---`);
    console.log(csv);
    console.log(`--- END SHEET: ${sheetName} ---`);
});
