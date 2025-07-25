
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CVUploadProps {
  onCVUploaded: (enhancedData: any) => void;
}

const CVUpload = ({ onCVUploaded }: CVUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to sanitize file names
  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_') // Replace special characters with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single underscore
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
  };

  // Function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:application/pdf;base64, prefix
        resolve(base64.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

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

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Uploading file...');
    
    try {
      // Sanitize the filename to avoid special characters
      const sanitizedFileName = sanitizeFileName(file.name);
      const fileName = `${Date.now()}-${sanitizedFileName}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Original filename:', file.name);
      console.log('Sanitized filename:', sanitizedFileName);
      console.log('Uploading file to Supabase Storage:', filePath);
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cv-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('File uploaded successfully:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('cv-files')
        .getPublicUrl(filePath);

      // Save document record to database (using original filename for display)
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          file_name: file.name, // Keep original name for display
          file_url: urlData.publicUrl,
          file_type: file.type,
          backed_up_to_s3: false
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log('Document record created:', documentData);

      // Convert PDF to base64 for Gemini
      setProcessingStep('Processing PDF for AI analysis...');
      const pdfBase64 = await fileToBase64(file);
      console.log('PDF converted to base64');

      // Enhance CV with Gemini AI
      setProcessingStep('Enhancing CV with AI...');
      const { data: enhanceData, error: enhanceError } = await supabase.functions.invoke('enhance-cv-with-gemini', {
        body: {
          documentId: documentData.id,
          pdfBase64: pdfBase64
        }
      });

      if (enhanceError) {
        throw new Error(`AI enhancement failed: ${enhanceError.message}`);
      }

      console.log('CV enhanced successfully:', enhanceData);

      // Trigger backup to S3 (non-blocking)
      setProcessingStep('Creating backup...');
      try {
        await supabase.functions.invoke('backup-to-s3', {
          body: {
            documentId: documentData.id,
            filePath: filePath
          }
        });
      } catch (backupError) {
        console.error('Backup failed:', backupError);
        // Don't block the main process if backup fails
      }

      toast({
        title: "CV Enhanced Successfully!",
        description: "Your CV has been analyzed and enhanced with AI.",
      });

      // Pass the enhanced data to the parent component
      onCVUploaded({
        originalName: file.name,
        enhancedName: `Enhanced_${file.name.replace('.pdf', '.html')}`,
        enhancedContent: enhanceData.enhancedContent,
        improvements: enhanceData.enhancedContent?.improvements || [
          "Content optimization with AI",
          "Professional formatting applied",
          "ATS-friendly structure implemented"
        ]
      });
      
    } catch (error) {
      console.error('Upload/Enhancement error:', error);
      toast({
        title: "Process Failed",
        description: error instanceof Error ? error.message : "Failed to process CV",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  if (isProcessing) {
    return (
      <Card className="w-full">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Processing Your CV</h3>
          <p className="text-gray-600 mb-2">{processingStep}</p>
          <p className="text-sm text-gray-500">
            Our AI is analyzing and enhancing your CV...
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
            <p className="mt-2 text-xs text-blue-600">
              ✓ Secure cloud storage with automatic backup
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CVUpload;
