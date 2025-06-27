
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api';

// Set up the worker with a more reliable CDN URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log('Starting PDF text extraction for file:', file.name);
    
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      // Add some options to handle different PDF types
      useSystemFonts: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
    });
    
    const pdf: PDFDocumentProxy = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${pdf.numPages}`);
      
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
    }

    const finalText = fullText.trim();
    console.log('Text extraction completed, length:', finalText.length);
    
    if (!finalText) {
      throw new Error('No text could be extracted from the PDF. The PDF might be image-based or encrypted.');
    }

    return finalText;
  } catch (error) {
    console.error('Detailed PDF extraction error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('The uploaded file is not a valid PDF document.');
      } else if (error.message.includes('encrypted')) {
        throw new Error('The PDF is password protected or encrypted.');
      } else if (error.message.includes('worker')) {
        throw new Error('PDF processing failed due to worker issues. Please try again.');
      } else {
        throw new Error(`PDF text extraction failed: ${error.message}`);
      }
    }
    
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid, non-encrypted PDF.');
  }
};
