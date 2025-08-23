import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { SessionDetail } from '../medical-agent/[sessionId]/page'
import moment from 'moment'
import { Stethoscope } from 'lucide-react'

// Type for the report structure
type MedicalReport = {
  sessionId: string;
  agent: string;
  user: string;
  timestamp: string;
  chiefComplaint: string;
  summary: string;
  symptoms: string[];
  duration: string;
  severity: string;
  medicationsMentioned: string[];
  recommendations: string[];
}

type Props={
    record:SessionDetail
}

function ViewReportDialog({record}:Props) {
  // Parse the report JSON
  const report = record.report as unknown as MedicalReport;

  // If no report exists, show message
  if (!report) {
    return (
      <Dialog>
        <DialogTrigger>
          <Button variant={'link'} size={'sm'}>View Report</Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Stethoscope className="h-6 w-6 text-blue-500" />
                <span>Medical AI Voice Agent Report</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">No report available for this session.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant={'link'} size={'sm'}>View Report</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Stethoscope className="h-6 w-6" />
              <span>Medical AI Voice Agent Report</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Session Info Section */}
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-3 border-b-2 border-blue-200 pb-1">
              Session Info
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Doctor:</span> {report.agent || record.selectedDoctor?.specialist + ' AI' || 'General Physician'}
              </div>
              <div>
                <span className="font-semibold text-gray-700">User:</span> {report.user || 'Anonymous'}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Consulted On:</span> {moment(new Date(record.createdOn)).format('MMMM Do YYYY, h:mm a')}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Agent:</span> {report.agent || record.selectedDoctor?.specialist + ' AI'}
              </div>
            </div>
          </div>

          {/* Chief Complaint Section */}
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-3 border-b-2 border-blue-200 pb-1">
              Chief Complaint
            </h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              {report.chiefComplaint || 'Not specified'}
            </p>
          </div>

          {/* Summary Section */}
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-3 border-b-2 border-blue-200 pb-1">
              Summary
            </h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg leading-relaxed">
              {report.summary || 'No summary available'}
            </p>
          </div>

          {/* Symptoms Section */}
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-3 border-b-2 border-blue-200 pb-1">
              Symptoms
            </h3>
            {report.symptoms && report.symptoms.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-700 bg-gray-50 p-3 rounded-lg">
                {report.symptoms.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 bg-gray-50 p-3 rounded-lg">No symptoms reported</p>
            )}
          </div>

          {/* Duration & Severity Section */}
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-3 border-b-2 border-blue-200 pb-1">
              Duration & Severity
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="font-semibold text-gray-700">Duration:</span> {report.duration || 'Not specified'}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Severity:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  report.severity === 'severe' ? 'bg-red-100 text-red-800' :
                  report.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  report.severity === 'mild' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {report.severity || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Medications Section */}
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-3 border-b-2 border-blue-200 pb-1">
              Medications Mentioned
            </h3>
            {report.medicationsMentioned && report.medicationsMentioned.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-700 bg-gray-50 p-3 rounded-lg">
                {report.medicationsMentioned.map((medication, index) => (
                  <li key={index}>{medication}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 bg-gray-50 p-3 rounded-lg">No medications mentioned</p>
            )}
          </div>

          {/* Recommendations Section */}
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-3 border-b-2 border-blue-200 pb-1">
              Recommendations
            </h3>
            {report.recommendations && report.recommendations.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-gray-700 bg-blue-50 p-3 rounded-lg">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="leading-relaxed">{recommendation}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 bg-gray-50 p-3 rounded-lg">No recommendations provided</p>
            )}
          </div>

          {/* Session Details Footer */}
          <div className="border-t pt-4 mt-6 space-y-2">
            <p className="text-xs text-gray-500 text-center">
              Session ID: {report.sessionId} • Generated on {moment(report.timestamp).format('MMMM Do YYYY, h:mm a')}
            </p>
            <p className="text-xs text-gray-400 text-center italic">
              ⚠️ This report is generated by AI and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewReportDialog