
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api';

// Configure the worker with a reliable CDN
const configureWorker = () => {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    console.log('PDF.js worker configured successfully');
  } catch (error) {
    console.warn('Worker configuration failed:', error);
  }
};

// Initialize worker immediately
configureWorker();

export const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log('Starting PDF text extraction for file:', file.name);
  
  try {
    // Basic validation
    if (!file || file.size === 0) {
      throw new Error('Invalid or empty file provided');
    }

    if (file.type !== 'application/pdf') {
      throw new Error('File must be a PDF document');
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);

    // Load PDF document with minimal configuration
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      stopAtErrors: false
    });
    
    const pdf: PDFDocumentProxy = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);

    // Extract text from all pages
    let fullText = '';
    let processedPages = 0;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${pdf.numPages}`);
        
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Extract text items and filter out empty strings
        const pageStrings = textContent.items
          .filter((item): item is TextItem => 'str' in item)
          .map((item: TextItem) => item.str.trim())
          .filter(str => str.length > 0);

        if (pageStrings.length > 0) {
          fullText += pageStrings.join(' ') + '\n\n';
          processedPages++;
        }
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    const finalText = fullText.trim();
    console.log(`Extraction completed. Processed ${processedPages}/${pdf.numPages} pages. Text length:`, finalText.length);

    if (!finalText || finalText.length < 10) {
      throw new Error('No readable text found in the PDF. This might be an image-based PDF.');
    }

    return finalText;

  } catch (error) {
    console.error('PDF text extraction failed:', error);
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF') || error.message.includes('corrupted')) {
        throw new Error('The uploaded file is not a valid PDF or may be corrupted. Please try uploading a different PDF file.');
      } else if (error.message.includes('encrypted') || error.message.includes('password')) {
        throw new Error('This PDF is password protected. Please upload an unprotected PDF file.');
      } else if (error.message.includes('No readable text')) {
        throw new Error('No readable text found in this PDF. The file may be image-based or use an unsupported format.');
      }
    }
    
    throw new Error('Unable to extract text from this PDF. Please try uploading a different PDF file.');
  }
};
