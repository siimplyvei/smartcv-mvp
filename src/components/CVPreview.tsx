
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Upload, Eye } from "lucide-react";
import { generateCVTemplate, downloadCVAsHTML } from "@/utils/cvTemplateGenerator";
import { useState } from "react";

interface CVPreviewProps {
  enhancedCV: {
    originalName: string;
    enhancedName: string;
    enhancedContent: any;
    improvements: string[];
  };
  onStartOver: () => void;
}

const CVPreview = ({ enhancedCV, onStartOver }: CVPreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleDownload = () => {
    console.log('Downloading CV with content:', enhancedCV.enhancedContent);
    const htmlContent = generateCVTemplate(enhancedCV.enhancedContent);
    downloadCVAsHTML(htmlContent, enhancedCV.enhancedName);
  };

  const handlePreview = () => {
    console.log('Previewing CV with content:', enhancedCV.enhancedContent);
    const htmlContent = generateCVTemplate(enhancedCV.enhancedContent);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Your CV Has Been Enhanced with AI!
          </CardTitle>
          <CardDescription className="text-green-700">
            Cohere AI has successfully analyzed and improved your CV
          </CardDescription>
        </CardHeader>
      </Card>

      {/* CV Details Card */}
      {enhancedCV.enhancedContent?.personalInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Enhanced CV Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {enhancedCV.enhancedContent.personalInfo.name && (
                <p><strong>Name:</strong> {enhancedCV.enhancedContent.personalInfo.name}</p>
              )}
              {enhancedCV.enhancedContent.personalInfo.email && (
                <p><strong>Email:</strong> {enhancedCV.enhancedContent.personalInfo.email}</p>
              )}
              {enhancedCV.enhancedContent.personalInfo.summary && (
                <div>
                  <strong>Professional Summary:</strong>
                  <p className="mt-1 text-gray-700">{enhancedCV.enhancedContent.personalInfo.summary}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvements Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI Improvements Made</CardTitle>
          <CardDescription>
            Here's what Cohere AI enhanced in your CV:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {enhancedCV.improvements && enhancedCV.improvements.length > 0 ? (
              enhancedCV.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{improvement}</span>
                </li>
              ))
            ) : (
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">AI enhancement completed successfully</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Download Card */}
      <Card>
        <CardHeader>
          <CardTitle>Download Your Enhanced CV</CardTitle>
          <CardDescription>
            Your AI-enhanced CV is ready for download as a formatted HTML file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">{enhancedCV.enhancedName || 'Enhanced_CV.html'}</p>
                <p className="text-sm text-gray-600">AI-Enhanced HTML CV</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handlePreview} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button onClick={onStartOver} variant="outline" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Upload Another CV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CVPreview;
