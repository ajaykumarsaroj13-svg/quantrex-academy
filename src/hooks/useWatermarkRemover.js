import { useEffect } from 'react';

export const useWatermarkRemover = (dependencies = []) => {
  useEffect(() => {
    let isActive = true;

    const processImages = async () => {
      // Find all images that might have a watermark in math-content areas
      const images = document.querySelectorAll('.math-content img, .exam-math-content img, .nta-q-content img, .nta-option-text img, .nta-solution-text img');
      
      for (let img of images) {
        if (!isActive) break;
        if (img.dataset.watermarkProcessed === "true") continue;
        
        // Wait for image to load if not complete
        if (!img.complete || img.naturalWidth === 0) {
            await new Promise((resolve) => {
                const onLoad = () => { img.removeEventListener('load', onLoad); resolve(); };
                const onError = () => { img.removeEventListener('error', onError); resolve(); };
                img.addEventListener('load', onLoad);
                img.addEventListener('error', onError);
            });
        }
        
        if (!isActive) break;
        if (img.dataset.watermarkProcessed === "true") continue;
        img.dataset.watermarkProcessed = "true"; // mark as processed immediately to prevent loops

        const originalSrc = img.src;
        // Don't process if it's already a Data URI or a local asset
        if (originalSrc.startsWith('data:') || originalSrc.includes('localhost') || originalSrc.includes('vercel.app')) {
            continue;
        }

        try {
          // Use CORS proxy to avoid cross-origin canvas taint issues
          const proxySrc = `https://corsproxy.io/?url=${encodeURIComponent(originalSrc)}`;
          
          const response = await fetch(proxySrc);
          if (!response.ok) throw new Error("Network response was not ok");
          const blob = await response.blob();
          const imgBitmap = await createImageBitmap(blob);
          
          const canvas = document.createElement('canvas');
          canvas.width = imgBitmap.width;
          canvas.height = imgBitmap.height;
          const ctx = canvas.getContext('2d');
          
          ctx.drawImage(imgBitmap, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Pixel manipulation to remove watermark
          for (let i = 0; i < data.length; i += 4) {
             const r = data[i];
             const g = data[i+1];
             const b = data[i+2];
             
             // Average brightness
             const avg = (r + g + b) / 3;
             
             // The watermark is a light grey. Threshold at ~180.
             // If it's lighter than 180, force it to pure white (removes watermark).
             // If it's darker than 180, force it to pure black (keeps text/lines crisp).
             if (avg > 180) { 
                 data[i] = 255;
                 data[i+1] = 255;
                 data[i+2] = 255;
             } else {
                 data[i] = 0;
                 data[i+1] = 0;
                 data[i+2] = 0;
             }
          }
          
          ctx.putImageData(imageData, 0, 0);
          const cleanedDataUrl = canvas.toDataURL('image/png');
          
          // Replace the image source with the clean Data URI
          img.src = cleanedDataUrl;
          
        } catch (error) {
          console.error("Watermark removal failed for image:", originalSrc, error);
          // If proxy fails, let's just let it be, CSS filters might still hide it somewhat
        }
      }
    };

    // Run the processor immediately
    processImages();
    
    // Set up a mutation observer to catch images added dynamically (e.g. changing questions)
    const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;
        mutations.forEach(m => {
            if (m.addedNodes.length > 0) shouldProcess = true;
        });
        if (shouldProcess) {
            processImages();
        }
    });
    
    const container = document.body;
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      isActive = false;
      observer.disconnect();
    };
  }, dependencies);
};
