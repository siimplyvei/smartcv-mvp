
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Upload, User, Files } from "lucide-react";
import CVUpload from "@/components/CVUpload";
import CVPreview from "@/components/CVPreview";
import FileManager from "@/components/FileManager";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview'>('upload');
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [enhancedCV, setEnhancedCV] = useState<any>(null);
  const { user, signOut } = useAuth();

  const handleCVUploaded = (file: File) => {
    setUploadedCV(file);
    
    // Create enhanced CV data structure that matches what we expect
    const mockEnhancedContent = {
      personalInfo: {
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "(555) 123-4567",
        location: "New York, NY",
        summary: "Experienced software developer with 5+ years in web development. Skilled in JavaScript, React, and Node.js. Passionate about creating user-friendly applications and solving complex problems."
      },
      experience: [
        {
          title: "Senior Developer",
          company: "Tech Company",
          duration: "2020-2024",
          description: "Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software. Implemented responsive designs and optimized application performance."
        },
        {
          title: "Junior Developer",
          company: "Startup Inc",
          duration: "2018-2020",
          description: "Built frontend components using JavaScript and CSS. Participated in code reviews and agile development processes. Contributed to database design and API development."
        }
      ],
      education: [
        {
          degree: "Bachelor of Science in Computer Science",
          institution: "University of Technology",
          year: "2014-2018",
          details: "Graduated with honors, focusing on software engineering and web development."
        }
      ],
      skills: ["JavaScript", "React", "Node.js", "HTML", "CSS", "Git", "SQL", "MongoDB"],
      improvements: [
        "Optimized keywords for ATS systems",
        "Enhanced professional summary with quantifiable achievements",
        "Improved formatting and structure for better readability",
        "Added comprehensive skills section with relevant technologies",
        "Strengthened job descriptions with action verbs and measurable results",
        "Integrated modern CV design principles for visual appeal"
      ]
    };
    
    // Simulate AI processing
    setTimeout(() => {
      setEnhancedCV({
        originalName: file.name,
        enhancedName: `Enhanced_${file.name.replace('.pdf', '')}.html`,
        enhancedContent: mockEnhancedContent,
        improvements: mockEnhancedContent.improvements
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
                <span className="text-gray-700">{user?.user_metadata?.full_name || user?.email}</span>
              </div>
              <Button variant="outline" onClick={signOut}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email}!
          </h2>
          <p className="text-lg text-gray-600">
            Ready to enhance your CV with AI? Your files are securely stored with automatic cloud backup.
          </p>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="enhance" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="enhance" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Enhance CV
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Files className="h-4 w-4" />
              My Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enhance">
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

            {/* Enhancement Content */}
            {currentStep === 'upload' ? (
              <CVUpload onCVUploaded={handleCVUploaded} />
            ) : (
              <CVPreview 
                enhancedCV={enhancedCV} 
                onStartOver={handleStartOver}
              />
            )}
          </TabsContent>

          <TabsContent value="files">
            <FileManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
