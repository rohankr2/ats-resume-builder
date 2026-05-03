const pdfParse = require('pdf-parse');
console.log('typeof:', typeof pdfParse);
console.log('keys:', Object.keys(pdfParse));
if (typeof pdfParse === 'object') {
    if (pdfParse.default) console.log('default typeof:', typeof pdfParse.default);
    if (pdfParse.pdfParse) console.log('pdfParse typeof:', typeof pdfParse.pdfParse);
}
