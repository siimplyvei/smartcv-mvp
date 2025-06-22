
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Upload, User } from "lucide-react";
import CVUpload from "@/components/CVUpload";
import CVPreview from "@/components/CVPreview";

interface DashboardProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview'>('upload');
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [enhancedCV, setEnhancedCV] = useState<any>(null);

  const handleCVUploaded = (file: File) => {
    setUploadedCV(file);
    
    // Simulate AI processing
    setTimeout(() => {
      setEnhancedCV({
        originalName: file.name,
        enhancedName: `Enhanced_${file.name}`,
        improvements: [
          "Optimized keywords for ATS systems",
          "Enhanced professional summary",
          "Improved formatting and structure",
          "Added missing skills section",
          "Strengthened achievement descriptions"
        ]
      });
      setCurrentStep('preview');
    }, 2000);
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setUploadedCV(null);
    setEnhancedCV(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SmartCV</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">{user.name}</span>
              </div>
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-lg text-gray-600">
            Ready to enhance your CV with AI?
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-medium">Upload CV</span>
            </div>
            <div className={`w-16 h-px ${currentStep === 'preview' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-medium">AI Enhancement</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {currentStep === 'upload' ? (
          <CVUpload onCVUploaded={handleCVUploaded} />
        ) : (
          <CVPreview 
            enhancedCV={enhancedCV} 
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
