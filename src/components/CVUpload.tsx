
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

interface CVUploadProps {
  onCVUploaded: (file: File) => void;
}

const CVUpload = ({ onCVUploaded }: CVUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      handleFileUpload(pdfFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    onCVUploaded(file);
  };

  if (isProcessing) {
    return (
      <Card className="w-full">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">AI is Analyzing Your CV</h3>
          <p className="text-gray-600">
            Our advanced AI is reviewing your CV and preparing enhancements...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Upload Your CV</CardTitle>
        <CardDescription className="text-lg">
          Upload your current CV in PDF format to get started with AI enhancement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">
            Drag and drop your CV here
          </h3>
          <p className="text-gray-600 mb-6">
            or click to browse your files
          </p>
          
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="cv-upload"
          />
          
          <Button asChild className="mb-4">
            <label htmlFor="cv-upload" className="cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              Choose PDF File
            </label>
          </Button>
          
          <div className="text-sm text-gray-500">
            <p>Supported format: PDF only</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CVUpload;
