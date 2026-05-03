import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req: Request) {
  try {
    const { content, format, templateId } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Missing enhanced resume content." }, { status: 400 });
    }

    if (format === 'docx') {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: content.personal?.name || "Professional Resume",
              heading: HeadingLevel.TITLE,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${content.personal?.email || ''} | ${content.personal?.phone || ''} | ${content.personal?.linkedin || ''}`, italics: true })
              ],
              spacing: { after: 400 },
            }),
            // Summary
            new Paragraph({ text: "Professional Summary", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: content.summary || "", spacing: { after: 400 } }),
            
            // Experience
            new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_1 }),
            ...(content.experience || []).flatMap((exp: any) => [
              new Paragraph({
                children: [
                  new TextRun({ text: exp.title, bold: true }),
                  new TextRun(` at ${exp.company} (${exp.dates})`)
                ]
              }),
              new Paragraph({ text: exp.description, spacing: { after: 200 } })
            ]),

            // Education
            new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_1 }),
            ...(content.education || []).flatMap((edu: any) => [
              new Paragraph({
                children: [
                   new TextRun({ text: edu.degree, bold: true }),
                   new TextRun(` - ${edu.institution} (${edu.dates})`)
                ],
                spacing: { after: 200 }
              })
            ]),

            // Skills
            new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: (content.skills || []).join(', '), spacing: { after: 200 } }),
          ],
        }],
      });

      const b64string = await Packer.toBase64String(doc);
      return NextResponse.json({ result: b64string, isBase64: true, filename: "resume.docx" });
    } 
    
    // PDF Generation via LaTeX
    else if (format === 'pdf') {
      // Basic AutoCV LaTeX template insertion
      const latexString = `\\documentclass[10pt,a4paper,sans]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{blue}
\\usepackage[scale=0.75]{geometry}
\\name{${content.personal?.name?.split(' ')[0] || ''}}{${content.personal?.name?.split(' ').slice(1).join(' ') || ''}}
\\email{${content.personal?.email || ''}}
\\phone[mobile]{${content.personal?.phone || ''}}
\\social[linkedin]{${content.personal?.linkedin || ''}}
\\begin{document}
\\makecvtitle
\\section{Summary}
${content.summary || ''}
\\section{Experience}
${(content.experience || []).map((exp: any) => `\\cventry{${exp.dates}}{${exp.title}}{${exp.company}}{}{}{${exp.description}}`).join('\n')}
\\section{Education}
${(content.education || []).map((edu: any) => `\\cventry{${edu.dates}}{${edu.degree}}{${edu.institution}}{}{}{}`).join('\n')}
\\section{Skills}
\\cvitem{Skills}{${(content.skills || []).join(', ')}}
\\end{document}
`;

      const tmpDir = os.tmpdir();
      const uniqueId = Date.now().toString();
      const texFile = path.join(tmpDir, `resume_${uniqueId}.tex`);
      const pdfFile = path.join(tmpDir, `resume_${uniqueId}.pdf`);

      fs.writeFileSync(texFile, latexString);

      return new Promise<NextResponse>((resolve) => {
        exec(`pdflatex -interaction=nonstopmode -output-directory=${tmpDir} ${texFile}`, (error, stdout, stderr) => {
          if (error) {
            console.error("pdflatex error:", error);
            // Fallback for missing pdflatex on user's machine (development flow)
            resolve(NextResponse.json({ 
               error: "pdflatex is not installed on the system. PDF Generation requires the Docker container on Render as configured. However, the raw LaTeX template has been successfully generated.", 
               latex: latexString 
            }, { status: 500 }));
            return;
          }
          
          if (fs.existsSync(pdfFile)) {
             const pdfBuffer = fs.readFileSync(pdfFile);
             const base64Pdf = pdfBuffer.toString('base64');
             resolve(NextResponse.json({ result: base64Pdf, isBase64: true, filename: "resume.pdf" }));
          } else {
             resolve(NextResponse.json({ error: "PDF generation failed" }, { status: 500 }));
          }
        });
      });
    }

    return NextResponse.json({ error: "Invalid format requested." }, { status: 400 });

  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
