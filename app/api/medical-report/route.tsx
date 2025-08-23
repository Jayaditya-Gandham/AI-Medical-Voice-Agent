import { db } from "@/config/db";
import { openai } from "@/config/OpenAiModel";
import { SessionChatTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const REPORT_GENERATE_PROMPT=`You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based on doctor AI AGENT info and conversation between ai medical agent and user, generate a structured report with ALL the following fields (even if empty):

REQUIRED FIELDS - ALL MUST BE INCLUDED:
1. sessionId: the session identifier provided
2. agent: the medical specialist name (e.g., "General Physician AI")
3. user: name of the patient or "Anonymous" if not provided
4. timestamp: current date and time in ISO format
5. chiefComplaint: one-sentence summary of the main health concern
6. summary: a 2-3 sentence summary of the conversation, symptoms, and recommendations
7. symptoms: array of symptoms mentioned by the user (empty array if none)
8. duration: how long the user has experienced the symptoms ("Not specified" if not mentioned)
9. severity: "mild", "moderate", "severe", or "Not specified"
10. medicationsMentioned: array of any medicines mentioned (empty array if none)
11. recommendations: array of AI suggestions (empty array if none)

IMPORTANT: You MUST include ALL 11 fields in your response. Use empty arrays [] for lists with no items, and "Not specified" for unknown text fields.

Return ONLY this exact JSON format with ALL fields:
{
  "sessionId": "string",
  "agent": "string",
  "user": "string",
  "timestamp": "ISO Date string",
  "chiefComplaint": "string",
  "summary": "string",
  "symptoms": ["symptom1", "symptom2"],
  "duration": "string",
  "severity": "string",
  "medicationsMentioned": ["med1", "med2"],
  "recommendations": ["rec1", "rec2"]
}

Respond with ONLY the JSON object, nothing else.`;

export async function POST(req:NextRequest) {
    try {
        const {sessionId,sessionDetail,messages}=await req.json();
        console.log('📋 Medical Report API - Received data:');
        console.log('Session ID:', sessionId);
        console.log('Session Detail:', sessionDetail);
        console.log('Messages:', messages);

        if (!sessionId) {
            console.error('❌ Session ID is missing');
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        if (!messages || messages.length === 0) {
            console.error('❌ No messages found');
            return NextResponse.json({ error: 'No conversation messages found' }, { status: 400 });
        }

        const UserInput="AI DOCTOR AGENT INFO:"+JSON.stringify(sessionDetail)+" , Conversation :"+JSON.stringify(messages);
        console.log('🤖 Sending to OpenAI...');

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: REPORT_GENERATE_PROMPT },
              {
                role: "user",
                content:UserInput
              }
            ],
            max_tokens: 500
        });

        const rawResp=completion.choices[0].message;
        console.log('🤖 OpenAI Raw Response:', rawResp.content);

        //@ts-ignore
        const Resp = rawResp.content.trim().replace('```json', '').replace('```', '');
        console.log('🧹 Cleaned Response:', Resp);

        let JSONResp = JSON.parse(Resp);
        console.log('📊 Parsed JSON Report (raw):', JSONResp);

        // Ensure all required fields are present
        const completeReport = {
            sessionId: JSONResp.sessionId || sessionId,
            agent: JSONResp.agent || sessionDetail?.selectedDoctor?.specialist + ' AI' || 'AI Medical Agent',
            user: JSONResp.user || 'Anonymous',
            timestamp: JSONResp.timestamp || new Date().toISOString(),
            chiefComplaint: JSONResp.chiefComplaint || 'Not specified',
            summary: JSONResp.summary || 'Medical consultation completed.',
            symptoms: Array.isArray(JSONResp.symptoms) ? JSONResp.symptoms : [],
            duration: JSONResp.duration || 'Not specified',
            severity: JSONResp.severity || 'Not specified',
            medicationsMentioned: Array.isArray(JSONResp.medicationsMentioned) ? JSONResp.medicationsMentioned : [],
            recommendations: Array.isArray(JSONResp.recommendations) ? JSONResp.recommendations : []
        };

        console.log('📊 Complete Report with all fields:', completeReport);
        JSONResp = completeReport;

        //save to database
        console.log('💾 Saving to database...');
        const result=await db.update(SessionChatTable).set({
            report:JSONResp,
            conversation:messages
        }).where(eq(SessionChatTable.sessionId, sessionId));
        console.log('✅ Database update result:', result);

        console.log('🎉 Medical Report Generated Successfully!');
        return NextResponse.json(JSONResp);
    }catch(e){
        console.error('❌ Medical Report API Error:', e);
        return NextResponse.json({
            error: 'Failed to generate medical report',
            details: e instanceof Error ? e.message : 'Unknown error'
        }, { status: 500 });
    }
}