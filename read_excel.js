const XLSX = require('xlsx');
const path = require('path');

const filePath = 'c:\\Users\\LUIGI\\Desktop\\demo HAPPY SAC\\recetas para erp30-03 (1).xlsx';
const workbook = XLSX.readFile(filePath);

workbook.SheetNames.forEach(sheetName => {
    console.log(`--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
});
