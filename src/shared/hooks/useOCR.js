import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';

export const useOCR = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');

  const validateImage = (file) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file (JPG, PNG, etc.).');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image file is too large. Please upload an image smaller than 10MB.');
    }
  };

  const processOCR = useCallback(async (imageFile) => {
    setIsProcessingOCR(true);
    setOcrProgress(0);
    setOcrStatus('Preparing image for OCR...');

    try {
      console.log('Starting OCR process for:', imageFile.name);
      
      // Create worker with enhanced options for receipt recognition
      const worker = await createWorker('eng', 1, {
        logger: m => {
          console.log('OCR Progress:', m);
          setOcrStatus(m.status || 'Processing...');
          if (m.progress) {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });

      // Set parameters optimized for receipt text
      await worker.setParameters({
        'tessedit_char_whitelist': '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz $.,@/():-#&',
        'tessedit_pageseg_mode': '6', // Uniform block of text
        'preserve_interword_spaces': '1'
      });

      console.log('OCR worker configured, starting recognition...');
      setOcrStatus('Reading text from image...');
      
      const { data: { text, confidence } } = await worker.recognize(imageFile);
      
      console.log('OCR completed. Confidence:', confidence);
      console.log('Extracted text:', text);
      
      await worker.terminate();

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the image. Please ensure the image is clear and contains readable text.');
      }

      if (confidence < 30) {
        console.warn('Low confidence OCR result:', confidence);
        setOcrStatus('⚠️ Low confidence - text may not be accurate');
      } else {
        setOcrStatus('✅ Text extracted successfully');
      }

      return { text, confidence };

    } catch (error) {
      console.error('OCR Error:', error);
      setOcrStatus('❌ OCR failed - please try again');
      
      let errorMessage = 'Failed to process the image. ';
      
      if (error.message.includes('Network')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message.includes('No text')) {
        errorMessage += 'No readable text found in the image. Please ensure the receipt is clear and well-lit.';
      } else {
        errorMessage += 'Please try with a clearer image or paste the text manually.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsProcessingOCR(false);
      
      // Keep status message visible for longer
      setTimeout(() => {
        if (!isProcessingOCR) {
          setOcrProgress(0);
        }
      }, 5000);
    }
  }, []);

  const handleImageUpload = useCallback(async (file, onTextExtracted) => {
    if (!file) return;

    console.log('Image selected:', file.name, file.size, file.type);

    try {
      validateImage(file);
      setUploadedImage(file);
      
      const { text } = await processOCR(file);
      
      if (onTextExtracted) {
        onTextExtracted(text);
      }
      
      return text;
    } catch (error) {
      alert(error.message);
      throw error;
    }
  }, [processOCR]);

  const clearImage = useCallback(() => {
    setUploadedImage(null);
    setOcrProgress(0);
    setOcrStatus('');
  }, []);

  const updateStatus = useCallback((status, itemCount = 0) => {
    if (itemCount === 0) {
      setOcrStatus('⚠️ No items found - try adjusting image or paste text manually');
    } else {
      setOcrStatus(`✅ Found ${itemCount} items from receipt!`);
    }
  }, []);

  return {
    uploadedImage,
    isProcessingOCR,
    ocrProgress,
    ocrStatus,
    handleImageUpload,
    clearImage,
    updateStatus
  };
}; 