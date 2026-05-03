import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const execAsync = util.promisify(exec);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    const { fileData, fileName } = req.body;
    
    if (!fileData) {
      return res.status(400).json({ error: "No file data sent" });
    }

    if (fileName && fileName.endsWith('.pdf')) {
      const base64Data = fileData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const tmpPath = path.join(os.tmpdir(), `upload_${Date.now()}.pdf`);
      fs.writeFileSync(tmpPath, buffer);

      const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'parse-pdf.js');
      
      try {
        const { stdout } = await execAsync(`node "${scriptPath}" "${tmpPath}"`);
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);

        const jsonStart = stdout.indexOf('{');
        const jsonString = stdout.substring(jsonStart);
        const parsedResult = JSON.parse(jsonString.trim());
        if (parsedResult.error) {
           return res.status(500).json({ error: parsedResult.error });
        }
        return res.status(200).json(parsedResult);
      } catch (err: any) {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        return res.status(500).json({ error: err.message });
      }
    }
    return res.status(501).json({ error: "Only PDF parsing is supported." });
  } catch (error: any) {
    return res.status(500).json({ error: String(error) });
  }
}
