
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api';

// Set up the worker with a more reliable approach
const setupWorker = () => {
  try {
    // Use a more reliable worker URL
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    console.log('PDF.js worker configured successfully');
  } catch (workerError) {
    console.warn('Failed to configure PDF.js worker:', workerError);
  }
};

// Initialize worker
setupWorker();

export const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log('Starting PDF text extraction for file:', file.name, 'Size:', file.size);
  
  try {
    // Validate file first
    if (!file || file.size === 0) {
      throw new Error('Invalid or empty file provided');
    }

    if (file.type !== 'application/pdf') {
      throw new Error('File must be a PDF document');
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('File appears to be empty or corrupted');
    }

    // Try to load and extract text with primary method
    return await extractTextWithPrimaryMethod(arrayBuffer);
    
  } catch (error) {
    console.error('Primary extraction failed:', error);
    
    // Try fallback method
    try {
      console.log('Attempting fallback extraction method...');
      const arrayBuffer = await file.arrayBuffer();
      return await extractTextWithFallbackMethod(arrayBuffer);
    } catch (fallbackError) {
      console.error('Fallback extraction also failed:', fallbackError);
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF') || error.message.includes('corrupted')) {
          throw new Error('The uploaded file is not a valid PDF or may be corrupted. Please try uploading a different PDF file.');
        } else if (error.message.includes('encrypted') || error.message.includes('password')) {
          throw new Error('This PDF is password protected. Please upload an unprotected PDF file.');
        } else if (error.message.includes('worker')) {
          throw new Error('PDF processing service is temporarily unavailable. Please try again in a moment.');
        }
      }
      
      throw new Error('Unable to extract text from this PDF. The file may be image-based, corrupted, or use an unsupported format.');
    }
  }
};

// Primary extraction method with full configuration
const extractTextWithPrimaryMethod = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const loadingTask = pdfjsLib.getDocument({ 
    data: arrayBuffer,
    stopAtErrors: false,
    maxImageSize: 1024 * 1024,
    cMapPacked: true,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
    useSystemFonts: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
  });
  
  const pdf: PDFDocumentProxy = await loadingTask.promise;
  console.log('PDF loaded successfully with primary method, pages:', pdf.numPages);
  
  return await extractTextFromPDF_Internal(pdf);
};

// Fallback extraction method with minimal configuration
const extractTextWithFallbackMethod = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const loadingTask = pdfjsLib.getDocument({ 
    data: arrayBuffer,
    stopAtErrors: false
  });
  
  const pdf: PDFDocumentProxy = await loadingTask.promise;
  console.log('PDF loaded successfully with fallback method, pages:', pdf.numPages);
  
  return await extractTextFromPDF_Internal(pdf);
};

// Internal text extraction logic
const extractTextFromPDF_Internal = async (pdf: PDFDocumentProxy): Promise<string> => {
  let fullText = '';
  let successfulPages = 0;

  // Extract text from each page
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      console.log(`Processing page ${pageNum}/${pdf.numPages}`);
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Extract and clean text
      const pageStrings = textContent.items
        .filter((item): item is TextItem => 'str' in item && item.str.trim().length > 0)
        .map((item: TextItem) => item.str.trim())
        .filter(str => str.length > 0);

      if (pageStrings.length > 0) {
        const pageText = pageStrings.join(' ');
        fullText += pageText + '\n\n';
        successfulPages++;
      }
    } catch (pageError) {
      console.warn(`Error processing page ${pageNum}:`, pageError);
      // Continue with other pages
    }
  }

  const finalText = fullText.trim();
  console.log(`Text extraction completed. Processed ${successfulPages}/${pdf.numPages} pages. Total text length:`, finalText.length);
  
  if (!finalText || finalText.length < 10) {
    throw new Error('No readable text found in the PDF. This might be an image-based PDF or the content may be encrypted.');
  }

  return finalText;
};
