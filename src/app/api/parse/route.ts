import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs';

const execAsync = util.promisify(exec);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { fileData, fileName } = await req.json();
    
    if (!fileData) {
      return NextResponse.json({ error: "No file data sent" }, { status: 400 });
    }

    if (fileName && fileName.endsWith('.pdf')) {
      // Decode the Base64 safely without touching Next.js request boundary stream bugs
      const base64Data = fileData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');

      const tmpPath = path.join(os.tmpdir(), `upload_${Date.now()}.pdf`);
      fs.writeFileSync(tmpPath, buffer);

      const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'parse-pdf.js');
      
      try {
        const { stdout } = await execAsync(`node "${scriptPath}" "${tmpPath}"`);
        fs.unlinkSync(tmpPath);

        const parsedResult = JSON.parse(stdout.trim());
        if (parsedResult.error) {
           throw new Error(parsedResult.error);
        }

        return NextResponse.json(parsedResult);
      } catch (err: any) {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        throw err;
      }
    }

    return NextResponse.json({ error: "Only PDF parsing is supported." }, { status: 501 });
  } catch (error: any) {
    console.error("Parse error isolated:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
