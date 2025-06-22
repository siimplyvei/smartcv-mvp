
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Upload } from "lucide-react";

interface CVPreviewProps {
  enhancedCV: {
    originalName: string;
    enhancedName: string;
    improvements: string[];
  };
  onStartOver: () => void;
}

const CVPreview = ({ enhancedCV, onStartOver }: CVPreviewProps) => {
  const handleDownload = () => {
    // Simulate CV download
    const link = document.createElement('a');
    link.href = '#';
    link.download = enhancedCV.enhancedName;
    
    // Create a simple text content for demo
    const content = `Enhanced CV - ${enhancedCV.enhancedName}

This is your AI-enhanced CV with the following improvements:
${enhancedCV.improvements.map(improvement => `• ${improvement}`).join('\n')}

[In a real implementation, this would be the actual enhanced PDF]`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    link.href = URL.createObjectURL(blob);
    link.click();
    
    URL.revokeObjectURL(link.href);
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
            Your CV Has Been Enhanced!
          </CardTitle>
          <CardDescription className="text-green-700">
            Our AI has successfully analyzed and improved your CV
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Improvements Card */}
      <Card>
        <CardHeader>
          <CardTitle>AI Improvements Made</CardTitle>
          <CardDescription>
            Here's what our AI enhanced in your CV:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {enhancedCV.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Download Card */}
      <Card>
        <CardHeader>
          <CardTitle>Download Your Enhanced CV</CardTitle>
          <CardDescription>
            Your professionally enhanced CV is ready for download
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">{enhancedCV.enhancedName}</p>
                <p className="text-sm text-gray-600">AI-Enhanced PDF</p>
              </div>
            </div>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          
          <div className="flex space-x-4">
            <Button onClick={onStartOver} variant="outline" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Upload Another CV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Demo Note */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800">
            <strong>Demo Note:</strong> This is a frontend demonstration. In a full implementation with Supabase backend, the AI would process your actual PDF and generate a real enhanced version with proper formatting, content improvements, and professional layout.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CVPreview;
