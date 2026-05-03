import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { text, formattingPreference } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No resume text provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is missing from environment variables." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are a world-class AI Resume Analyst and ATS Optimizer.
Analyze the following raw resume text or manually entered data.

1. Evaluate its ATS viability and give an 'ats_score' out of 100 based on structure, keyword density, and action-oriented framing.
2. Provide concise 'feedback' on what needs improving.
3. Provide an array of specific, actionable 'suggestions' explaining how the user can improve the resume content (e.g. "Add metrics to your sales role", "Include leadership keywords"). Generate at least 3-5 suggestions if the score is below 80.
4. Rewrite the content in a highly professional, proactive tone to maximize ATS parsing success.

Return strictly a JSON object (no markdown wrappers) with this exact structure:
{
   "ats_score": number,
   "feedback": "string",
   "suggestions": ["string", "string"],
   "enhanced_content": {
      "personal": { "name": "...", "email": "...", "phone": "...", "linkedin": "..." },
      "summary": "Professional summary...",
      "skills": ["skill 1", "skill 2"],
      "experience": [
         { "title": "Job Title", "company": "Company Name", "dates": "2020-2023", "description": "Bullet points..." }
      ],
      "education": [
         { "degree": "...", "institution": "...", "dates": "..." }
      ],
      "projects": [
         { "title": "...", "description": "..." }
      ]
   }
}

Original Resume Data:
${text}
`;

    // Fallback logic to handle high demand 503 errors across multiple models
    let response;
    let lastError: any;
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash'];
    
    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });
        // If it succeeds, break out of the loop
        break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed. Trying next...`);
        lastError = err;
      }
    }

    if (!response) {
      console.warn("All Gemini models failed (High Demand). Using mock data fallback to prevent application crash.");
      return NextResponse.json({
        result: {
          ats_score: 85,
          feedback: "The AI servers are currently overloaded, so this is a mock evaluation.",
          suggestions: [
             "Add more quantifiable metrics to your recent roles.",
             "Include industry-specific keywords like 'Agile' or 'CI/CD'.",
             "Ensure your contact information is up to date."
          ],
          enhanced_content: {
             personal: { name: "Optimized Candidate", email: "candidate@example.com", phone: "555-0199", linkedin: "linkedin.com/in/optimized" },
             summary: "A highly motivated professional. (Note: The Google AI servers are currently experiencing high demand. This is mock data generated so you can preview the formatting).",
             skills: ["Leadership", "Project Management", "Data Analysis", "Communication"],
             experience: [
                { title: "Senior Professional", company: "Industry Leader Inc.", dates: "2020-Present", description: "Successfully managed cross-functional teams and improved efficiency by 25%." }
             ],
             education: [
                { degree: "Bachelor's Degree", institution: "State University", dates: "2015-2019" }
             ],
             projects: [
                { title: "Process Optimization", description: "Streamlined internal workflows resulting in significant cost savings." }
             ]
          }
        }
      });
    }

    const outputText = response.text || "{}";
    const parsed = JSON.parse(outputText);

    return NextResponse.json({ result: parsed });

  } catch (error: any) {
    console.error("Enhance error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
