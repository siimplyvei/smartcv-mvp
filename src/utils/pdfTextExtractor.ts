
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api';

// Set up the worker with multiple fallback options
const setupWorker = () => {
  // Try multiple CDN sources for better reliability
  const workerUrls = [
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`,
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`,
    `https://mozilla.github.io/pdf.js/build/pdf.worker.js`
  ];
  
  // Use the first URL as primary
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrls[0];
};

// Initialize worker
setupWorker();

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log('Starting PDF text extraction for file:', file.name);
    
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
    
    // Load the PDF document with correct settings
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
    console.log('PDF loaded successfully, pages:', pdf.numPages);

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${pdf.numPages}`);
      
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // More robust text extraction
        const pageStrings = textContent.items
          .filter((item): item is TextItem => 'str' in item)
          .map((item: TextItem) => item.str)
          .filter(str => str.trim().length > 0); // Filter out empty strings

        const pageText = pageStrings.join(' ');
        if (pageText.trim()) {
          fullText += pageText + '\n\n';
        }
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages even if one fails
      }
    }

    const finalText = fullText.trim();
    console.log('Text extraction completed, length:', finalText.length);
    
    if (!finalText) {
      throw new Error('No text could be extracted from the PDF. The PDF might be image-based or encrypted.');
    }

    return finalText;
  } catch (error) {
    console.error('Detailed PDF extraction error:', error);
    
    // If worker fails, try alternative approach
    if (error instanceof Error && error.message.includes('worker')) {
      console.log('Retrying PDF extraction with alternative approach...');
      try {
        return await extractTextWithAlternativeApproach(file);
      } catch (fallbackError) {
        console.error('Alternative extraction also failed:', fallbackError);
        throw new Error('PDF processing failed. The PDF might be corrupted or use an unsupported format.');
      }
    }
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('The uploaded file is not a valid PDF document.');
      } else if (error.message.includes('encrypted')) {
        throw new Error('The PDF is password protected or encrypted.');
      } else {
        throw new Error(`PDF text extraction failed: ${error.message}`);
      }
    }
    
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid, non-encrypted PDF.');
  }
};

// Alternative approach without worker configuration changes
const extractTextWithAlternativeApproach = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Use basic configuration
  const loadingTask = pdfjsLib.getDocument({ 
    data: arrayBuffer,
    stopAtErrors: false
  });
  
  const pdf: PDFDocumentProxy = await loadingTask.promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageStrings = textContent.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item: TextItem) => item.str)
      .filter(str => str.trim().length > 0);

    const pageText = pageStrings.join(' ');
    if (pageText.trim()) {
      fullText += pageText + '\n\n';
    }
  }

  return fullText.trim();
};
