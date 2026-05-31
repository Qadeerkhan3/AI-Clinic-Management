import { GoogleGenerativeAI } from '@google/generative-ai';
import DiagnosisLog from '../models/DiagnosisLog.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Feature 1: Symptom Checker
export const symptomChecker = async (req, res) => {
  try {
    const { symptoms, age, gender, history } = req.body;

    const prompt = `
      You are a medical assistant. Here is the patient information:
      Age: ${age}, Gender: ${gender}
      Symptoms: ${symptoms}
      Medical History: ${history || 'None'}

      Respond with ONLY valid JSON in this exact format:
      {
        "possibleConditions": ["condition1", "condition2"],
        "riskLevel": "low|medium|high",
        "suggestedTests": ["test1", "test2"],
        "urgency": "routine|urgent|emergency",
        "advice": "brief advice in one or two sentences"
      }
    `;

    const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text   = result.response.text();

    const cleaned    = text.replace(/```json|```/g, '').trim();
    const aiResponse = JSON.parse(cleaned);

    await DiagnosisLog.create({
      symptoms, age, gender, history,
      aiResponse,
      riskLevel:  aiResponse.riskLevel,
      createdBy:  req.user._id,
    });

    res.json({ success: true, data: aiResponse });
  } catch (err) {
    console.error('AI symptomChecker error:', err.message);
    res.json({
      success:  false,
      fallback: true,
      message:  'AI analysis is temporarily unavailable. Please consult your doctor.',
    });
  }
};

// Feature 2: Prescription Explanation for patients
export const prescriptionExplain = async (req, res) => {
  try {
    const { medicines, diagnosis, instructions } = req.body;

    const prompt = `
      You are a friendly medical assistant explaining a prescription to a patient in simple English.
      Diagnosis: ${diagnosis}
      Medicines: ${JSON.stringify(medicines)}
      Instructions: ${instructions}

      Respond with ONLY valid JSON in this exact format:
      {
        "simpleExplanation": "what the patient needs to know in plain language",
        "lifestyleAdvice": ["advice1", "advice2"],
        "preventiveTips": ["tip1", "tip2"],
        "sideEffectsWarning": "common side effects to watch for"
      }
    `;

    const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text   = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();

    res.json({ success: true, data: JSON.parse(cleaned) });
  } catch (err) {
    console.error('AI prescriptionExplain error:', err.message);
    res.json({
      success:  false,
      fallback: true,
      message:  'Explanation is temporarily unavailable.',
    });
  }
};