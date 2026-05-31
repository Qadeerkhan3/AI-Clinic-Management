import { GoogleGenerativeAI } from '@google/generative-ai';
import DiagnosisLog from '../models/DiagnosisLog.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Feature 1: Symptom Checker
export const symptomChecker = async (req, res) => {
  try {
    const { symptoms, age, gender, history } = req.body;

    const prompt = `
      Tum ek medical assistant ho. Neeche patient ki info hai:
      Age: ${age}, Gender: ${gender}
      Symptoms: ${symptoms}
      Medical History: ${history || 'None'}

      Yeh batao (JSON format mein):
      {
        "possibleConditions": ["condition1", "condition2"],
        "riskLevel": "low/medium/high",
        "suggestedTests": ["test1", "test2"],
        "urgency": "routine/urgent/emergency",
        "advice": "short advice"
      }
      Sirf JSON return karo, kuch aur mat likho.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // JSON parse safely
    const cleaned = text.replace(/```json|```/g, '').trim();
    const aiResponse = JSON.parse(cleaned);

    // Log save karo
    await DiagnosisLog.create({
      symptoms, age, gender, history,
      aiResponse,
      riskLevel: aiResponse.riskLevel,
      createdBy: req.user._id,
    });

    res.json({ success: true, data: aiResponse });
  } catch (err) {
    // Graceful fallback — AI fail ho toh bhi system kaam kare
    res.json({
      success: false,
      fallback: true,
      message: 'AI abhi available nahi, doctor se consult karein',
    });
  }
};

// Feature 2: Prescription Explain karo patient ke liye
export const prescriptionExplain = async (req, res) => {
  try {
    const { medicines, diagnosis, instructions } = req.body;

    const prompt = `
      Tum ek friendly medical assistant ho jo patient ko simple Urdu/English mein samjhata hai.
      Diagnosis: ${diagnosis}
      Medicines: ${JSON.stringify(medicines)}
      Instructions: ${instructions}

      Yeh batao (JSON mein):
      {
        "simpleExplanation": "patient ke liye simple words mein",
        "lifestyleAdvice": ["advice1", "advice2"],
        "preventiveTips": ["tip1", "tip2"],
        "sideEffectsWarning": "common side effects"
      }
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();

    res.json({ success: true, data: JSON.parse(cleaned) });
  } catch {
    res.json({
      success: false,
      fallback: true,
      message: 'Explanation abhi available nahi',
    });
  }
};