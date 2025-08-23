"use client"
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { doctorAgent } from '../../_components/DoctorAgentCard'
import { Circle, Loader, PhoneCall, PhoneOff } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Vapi from '@vapi-ai/web';
import { toast } from 'sonner'

export type SessionDetail={
  id:number,
  notes:string,
  sessionId:string,
  report:JSON,
  selectedDoctor:doctorAgent,
  createdOn:string,
  conversation?: any
}

type messages={
  role: string,
  text:string
}

function MedicalVoiceAgent() {
  const {sessionId}=useParams();
  const [sessionDetail,setSessionDetail]=useState<SessionDetail>();
  const [callStarted,setCallStarted]=useState(false);
  const [vapiInstance,setVapiInstance]=useState<any>();
  const [currentRole,setCurrentRole]=useState<string|null>();
  const [liveTranscript,setLiveTranscript]=useState<string>();
  const [messages,setMessages]=useState<messages[]>([])
  const [loading,setLoading]=useState(false);
  const router=useRouter();
 

  useEffect(()=>{
    sessionId&&GetSessionDetails();
  },[sessionId])
  const GetSessionDetails=async()=>{
    const result=await axios.get('/api/session-chat?sessionId='+sessionId);
    console.log(result.data);
    setSessionDetail(result.data);
  }

  const StartCall=()=>{
    setLoading(true);
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY!);
    setVapiInstance(vapi);

    const VapiAgentConfig={
      name: 'AI Medical Voice Agent',
      firstMessage: "Hello, how can I help you today?",
      transcriber:{
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en'
      },
      voice:{
        provider:'playht',
        voiceId:sessionDetail?.selectedDoctor?.voiceId || 'will'
      },
      model:{
        provider:'openai',
        model:'gpt-3.5-turbo',
        messages:[
          {
            role:'system',
            content:sessionDetail?.selectedDoctor?.agentPrompt || 'You are a helpful medical AI assistant. Ask about symptoms and provide general health guidance.'
          }
        ],
        maxTokens: 150,
        temperature: 0.7
      },
      // Call settings to prevent premature ending
      endCallMessage: "Thank you for the consultation. Take care!",
      endCallPhrases: ["goodbye", "end call", "hang up", "that's all"],
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 600, // 10 minutes max
      backgroundSound: 'off'
    }
    //@ts-ignore
     vapi.start(VapiAgentConfig);
     
     // Listen for events
      vapi.on('call-start', () => {
        console.log('Call started');
        setCallStarted(true);
        setLoading(false);
      });
      vapi.on('call-end', async (callEndData?: any) => {
        setCallStarted(false);
        console.log('🔴 Call ended automatically!');
        console.log('📊 Call end data:', callEndData);
        console.log('📞 Call end reason:', callEndData?.reason || 'Unknown');

        // Only generate report if we have meaningful conversation
        if (messages.length > 1) {
          try {
            console.log('📋 Auto-generating report due to call end...');
            await GenerateReport();

            // Show success notification
            toast.success('Your report has been generated! Redirecting to dashboard...');

            // Wait 5 seconds then redirect to dashboard
            setTimeout(() => {
              router.replace('/dashboard');
            }, 5000);
          } catch (error: any) {
            console.error('❌ Auto-report generation failed:', error);
            toast.error('Failed to generate report. Please try again.');
          }
        }
      });
      vapi.on('message', (message) => {
        if (message.type === 'transcript') {
          const {role,transcriptType,transcript}=message;
          console.log(`${message.role}: ${message.transcript}`);
          if (transcriptType=='partial')
          {
          setLiveTranscript(transcript);
          setCurrentRole(role);
        }
        else if(transcriptType=='final'){
          //final transcript
          setMessages((prev:any)=>[...prev,{role:role,text:transcript}])
          setLiveTranscript("");
          setCurrentRole(null);
        }
      } 
      });

      vapi.on('speech-start', () => {
        console.log('🗣️ Assistant started speaking');
        setCurrentRole('assistant')
      });
      vapi.on('speech-end', () => {
        console.log('🔇 Assistant stopped speaking');
        setCurrentRole('user');
      });

      // Add error handling
      vapi.on('error', (error: any) => {
        console.error('🚨 VAPI Error:', error);
      });

      // Add volume level monitoring
      vapi.on('volume-level', (_volume: any) => {
        // console.log('🔊 Volume level:', _volume);
      });

  }

  const endCall = async () => {
    try {
      setLoading(true);
      console.log('📞 Ending call...');

      if (!vapiInstance) {
        console.warn('⚠️ No VAPI instance found');
        setLoading(false);
        return;
      }

      //stop the call
      vapiInstance.stop();
      //optionally remove listeners (good for memory management)
      try {
        vapiInstance.removeAllListeners('call-start');
        vapiInstance.removeAllListeners('call-end');
        vapiInstance.removeAllListeners('message');
        vapiInstance.removeAllListeners('speech-start');
        vapiInstance.removeAllListeners('speech-end');
      } catch (listenerError) {
        console.warn('⚠️ Error removing listeners:', listenerError);
      }
      //reset call state
      setCallStarted(false);
      setVapiInstance(null);

      console.log('📋 Call ended, generating report...');
      console.log('🔍 DEBUG: Messages array length:', messages.length);
      console.log('🔍 DEBUG: Messages content:', messages);
      console.log('🔍 DEBUG: Session detail exists:', !!sessionDetail);

      if (messages.length === 0) {
        console.warn('⚠️ No messages found - skipping report generation');
        alert('No conversation detected. Please have a conversation before ending the call.');
        setLoading(false);
        return;
      }

      // Generate report first
      const result = await GenerateReport();
      console.log('🎉 Report generation completed!', result);

      // Show success notification
      toast.success('Your report has been generated! Redirecting to dashboard...');

      // Wait 5 seconds then redirect to dashboard
      setTimeout(() => {
        router.replace('/dashboard');
      }, 5000);

    } catch (error) {
      console.error('❌ Error ending call or generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const GenerateReport=async()=>{
    try {
      console.log('🏥 Generating Medical Report...');
      console.log('📝 Messages to send:', messages);
      console.log('👨‍⚕️ Session Detail:', sessionDetail);
      console.log('🆔 Session ID:', sessionId);

      const result = await axios.post('/api/medical-report',{
        messages:messages,
        sessionDetail:sessionDetail,
        sessionId:sessionId
      }, {
        timeout: 30000 // 30 second timeout
      });

      console.log('✅ Medical Report Generated Successfully!');
      console.log('📋 Report Data:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ Error generating medical report:', error);
      if (axios.isAxiosError(error)) {
        console.error('📡 API Error Response:', error.response?.data);
        console.error('📊 Status Code:', error.response?.status);
      }
      throw error;
    }
  }


  return (
    <div className='p-5 border rounded-3xl bg-secondary'>
      <div className='flex justify-between items-center'>
        <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'><Circle className={`h-4 w-4 rounded-full ${callStarted?'bg-green-500': 'bg-red-500'}`}/> {callStarted?'Connected...':'Not Connected'} </h2>
        <h2 className='font-bold text-xl text-gray-400'>00:00</h2>
      </div>

      {sessionDetail&&
      <div className='flex items-center flex-col mt-10'>
        <Image src={sessionDetail?.selectedDoctor?.image} alt={sessionDetail?.selectedDoctor?.specialist??''}
        width={120}
        height={120}
        className='h-[100px] w-[100px] object-cover rounded-full'
        />
        <h2 className='mt-2 text-lg'>{sessionDetail?.selectedDoctor?.specialist}</h2>
        <p className='text-sm text-gray-400'>AI Voice Medical Agent</p>

        <div className='mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72'>
          {messages?.slice(-4).map((msg:messages,index)=>(

              <h2 className='text-gray-400 p-2' key={index}>{msg.role} : {msg.text}</h2>

          ))}
          
          {liveTranscript&&liveTranscript?.length>0 &&<h2 className='text-lg'>{currentRole}:{liveTranscript}</h2>}
        </div>

        <div className='flex flex-col gap-4 mt-20'>
          {!callStarted?(
            <Button onClick={StartCall} disabled={loading}>
              { loading?<Loader className='animate-spin'/>:<PhoneCall/>} Start Call
            </Button>
           ) : (<Button variant={'destructive'} onClick={endCall} disabled={loading}>
              { loading?<Loader className='animate-spin'/>:<PhoneOff/>} End Call
              </Button>
           )}

           {/* Debug buttons - remove these after testing */}
           <Button variant={'outline'} onClick={() => {
             console.log('🔍 DEBUG TEST: Current messages:', messages);
             console.log('🔍 DEBUG TEST: Session detail:', sessionDetail);
             console.log('🔍 DEBUG TEST: Session ID:', sessionId);
           }}>
             Debug Info
           </Button>

           <Button variant={'secondary'} onClick={async () => {
             console.log('🧪 TESTING: Manual report generation...');
             try {
               const result = await GenerateReport();
               console.log('✅ TEST SUCCESS: Report generated!', result);
               alert('Report generated successfully! Check console for details.');
             } catch (error) {
               console.error('❌ TEST FAILED:', error);
               alert('Report generation failed! Check console for error details.');
             }
           }} disabled={loading || messages.length === 0}>
             Test Report Generation
           </Button>
        </div>
      </div>}
    </div>
  )
}

export default MedicalVoiceAgent