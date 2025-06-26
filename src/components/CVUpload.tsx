
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPDF } from "@/utils/pdfTextExtractor";

interface CVUploadProps {
  onCVUploaded: (enhancedData: any) => void;
}

const CVUpload = ({ onCVUploaded }: CVUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

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
      // Create file path with user ID folder structure
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;
      
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

      // Save document record to database
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          file_name: file.name,
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

      // Extract text from PDF
      setProcessingStep('Extracting text from PDF...');
      const cvText = await extractTextFromPDF(file);
      console.log('Text extracted from PDF');

      // Enhance CV with Cohere AI
      setProcessingStep('Enhancing CV with AI...');
      const { data: enhanceData, error: enhanceError } = await supabase.functions.invoke('enhance-cv-with-cohere', {
        body: {
          documentId: documentData.id,
          cvText: cvText
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
