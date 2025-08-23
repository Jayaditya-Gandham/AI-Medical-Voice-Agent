'use client'
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import AddNewSessionDialog from './AddNewSessionDialog';
import axios from 'axios';
import HistoryTable from './HistoryTable';
import { SessionDetail } from '../medical-agent/[sessionId]/page';


function HistoryList() {
  const [historyList,setHistoryList]=useState<SessionDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    GetHistoryList();
},[])

const GetHistoryList=async()=>{
    try {
      setLoading(true);
      console.log('🔍 Fetching history list...');
      const result=await axios.get('/api/session-chat?sessionId=all');
      console.log('📋 History data received:', result.data);
      console.log('📊 Number of sessions:', result.data?.length || 0);
      setHistoryList(result.data || []);
    } catch (error) {
      console.error('❌ Error fetching history:', error);
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
}


  if (loading) {
    return (
      <div className='mt-10 flex justify-center'>
        <p>Loading consultation history...</p>
      </div>
    );
  }

  return (
    <div className='mt-10'>
        {historyList.length==0?
         <div className='flex items-center flex-col justify-center p-7 border-4 border-dashed rounded-2xl'>
            <Image src={'/medical-assistance.png'} alt='empty'
            width={150}
            height={150}/>
            <h2 className='font-bold text-xl mt-2'>No Recent Consultations</h2>
            <p>It looks like you haven't consulted with any doctors yet.</p>
            <AddNewSessionDialog/>
         </div>
         :<div>
          <HistoryTable historyList={historyList}/>
         </div>
        }
    </div>
  )
}

export default HistoryList