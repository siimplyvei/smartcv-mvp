
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Upload, Eye } from "lucide-react";
import { generateCVTemplate } from "@/utils/cvTemplateGenerator";
import { useState } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownload = async () => {
    console.log('Downloading CV as PDF with content:', enhancedCV.enhancedContent);
    setIsGeneratingPDF(true);
    
    try {
      const htmlContent = generateCVTemplate(enhancedCV.enhancedContent);
      
      // Create a temporary div to render HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      document.body.appendChild(tempDiv);

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 800,
        height: tempDiv.scrollHeight
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      const fileName = enhancedCV.enhancedName.replace('.html', '.pdf');
      pdf.save(fileName);

      // Clean up
      document.body.removeChild(tempDiv);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to HTML download if PDF generation fails
      const htmlContent = generateCVTemplate(enhancedCV.enhancedContent);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = enhancedCV.enhancedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingPDF(false);
    }
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
            Google Gemini AI has successfully analyzed and improved your CV
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
            Here's what Google Gemini AI enhanced in your CV:
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
            Your AI-enhanced CV is ready for download as a formatted PDF file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">{enhancedCV.enhancedName?.replace('.html', '.pdf') || 'Enhanced_CV.pdf'}</p>
                <p className="text-sm text-gray-600">AI-Enhanced PDF CV</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handlePreview} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleDownload} disabled={isGeneratingPDF}>
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
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
