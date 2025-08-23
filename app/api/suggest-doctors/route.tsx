import { openai } from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/shared/list";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    const {notes}=await req.json();
    try{
        const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: JSON.stringify(AIDoctorAgents) },
      {
        role: "user",
        content:
          `User Notes/Symptoms: ${notes}. Based on these symptoms, suggest the most relevant doctors from the provided list. Return ONLY the IDs of the most suitable doctors as a JSON array of numbers. Example: [1, 4, 7]`
      }
    ],
    max_tokens: 200
  });

    const rawResp=completion.choices[0].message;

    //@ts-ignore
    const Resp = rawResp.content.trim().replace('```json', '').replace('```', '');
    let suggestedIds = JSON.parse(Resp);

    // Ensure we have an array of numbers
    if (!Array.isArray(suggestedIds)) {
      suggestedIds = [];
    }

    // Filter and map the suggested doctors from AIDoctorAgents
    const suggestedDoctors = AIDoctorAgents.filter(doctor =>
      suggestedIds.includes(doctor.id)
    ).slice(0, 3); // Limit to 3 suggestions

    // If no matches found, return first 3 doctors as fallback
    if (suggestedDoctors.length === 0) {
      return NextResponse.json(AIDoctorAgents.slice(0, 3));
    }

    console.log(suggestedDoctors);
    return NextResponse.json(suggestedDoctors);

    }catch(e){
        console.error('Error in suggest-doctors API:', e);
        // Return fallback doctors in case of error
        return NextResponse.json(AIDoctorAgents.slice(0, 3));
    }


}