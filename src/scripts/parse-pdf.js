const fs = require('fs');
const PDFParser = require("pdf2json");

async function parse() {
  try {
    const filePath = process.argv[2];
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error("File path not provided or does not exist");
    }

    const pdfParser = new PDFParser(this, 1); // 1 = returns text

    pdfParser.on("pdfParser_dataError", errData => {
        console.error(JSON.stringify({ error: errData.parserError }));
        process.exit(1);
    });

    pdfParser.on("pdfParser_dataReady", pdfData => {
        // Output structured data via stdout
        const result = {
          text: pdfParser.getRawTextContent().replace(/\r\n/g, " "),
          pageCount: pdfData?.Pages?.length || 1
        };
        console.log(JSON.stringify(result));
    });

    pdfParser.loadPDF(filePath);

  } catch (error) {
    console.error(JSON.stringify({ error: error.message }));
    process.exit(1);
  }
}

parse();
