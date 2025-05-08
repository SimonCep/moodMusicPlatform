import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'; // Icons

interface FaceScanPopupProps {
  open: boolean;
  onClose: () => void;
  onEmotionDetected: (emotion: string) => void;
}

// Simplified capture steps for automatic capture
type CaptureStep = 
  | 'initial'          // Before anything starts
  | 'starting_camera'  // Camera is being initialized
  | 'waiting_for_face' // Camera is on, models loaded, waiting for a stable face
  | 'auto_capturing'   // Face detected, about to capture
  | 'analyzing'        // Image sent to backend
  | 'error'            // An error occurred
  | 'success';         // Emotion successfully detected

const STABLE_FACE_DETECTION_COUNT = 3;
const IMAGE_BURST_COUNT = 3; // Number of images to capture in a burst
const BURST_CAPTURE_DELAY_MS = 100; // Delay between burst captures

const FaceScanPopup: React.FC<FaceScanPopupProps> = ({ open, onClose, onEmotionDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveFaceDetectionsRef = useRef(0); // For stable detection

  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [captureStep, setCaptureStep] = useState<CaptureStep>('initial');
  const [feedbackMessage, setFeedbackMessage] = useState("Loading models...");
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  // No need for capturedImages array, will capture one and send

  const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Define callbacks first, ensuring dependencies are defined before dependents
  const stopDetectionInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    consecutiveFaceDetectionsRef.current = 0;
  }, []);
  
  // New function to call the OpenAI endpoint
  const sendImageToOpenAI = useCallback(async (image: string) => {
    setIsLoadingApi(true);
    setFeedbackMessage("Analyzing emotion...");
    try {
      const response = await fetch(`${VITE_API_URL}/api/analyze-emotion-openai/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: [image] }), // Backend expects an array with one image
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "AI analysis failed" }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const description = data.description || "Analysis complete, but no description provided.";
      setFeedbackMessage("AI Analysis Complete."); // Keep feedback short here
      setCaptureStep('success');
      onEmotionDetected(description); // Pass the full description back
      setTimeout(() => { onClose(); }, 2500); // Slightly longer timeout to read feedback
    } catch (error: any) {
      console.error("Error sending image to OpenAI backend:", error);
      setFeedbackMessage(error.message || "Failed to get AI analysis. Please try again.");
      setCaptureStep('error');
    } finally {
      setIsLoadingApi(false);
    }
  }, [onEmotionDetected, onClose, VITE_API_URL]);

  // Updated to call sendImageToOpenAI with the last image of the burst
  const handleAutoCaptureImageBurst = useCallback(async () => {
    if (captureStep !== 'waiting_for_face') return;
    if (!videoRef.current || !canvasRef.current) {
      setFeedbackMessage("Camera or canvas not ready.");
      setCaptureStep('error');
      return;
    }
    
    setCaptureStep('auto_capturing');
    setFeedbackMessage("Capturing burst...");
    stopDetectionInterval();

    const capturedImagesBurst: string[] = [];
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
        setFeedbackMessage("Error getting canvas context.");
        setCaptureStep('error');
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    for (let i = 0; i < IMAGE_BURST_COUNT; i++) {
        try {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageDataURL = canvas.toDataURL('image/jpeg', 0.9);
            capturedImagesBurst.push(imageDataURL);
            setFeedbackMessage(`Capturing burst (${i + 1}/${IMAGE_BURST_COUNT})...`);
            if (i < IMAGE_BURST_COUNT - 1) { 
                 await new Promise(resolve => setTimeout(resolve, BURST_CAPTURE_DELAY_MS));
            }
        } catch (captureError) {
            console.error("Error during image capture burst:", captureError);
            setFeedbackMessage("Error capturing image. Please try again.");
            setCaptureStep('error');
            return; 
        }
    }

    if (capturedImagesBurst.length === IMAGE_BURST_COUNT) {
        setCaptureStep('analyzing');
        // Send only the LAST image from the burst to OpenAI
        const lastImage = capturedImagesBurst[capturedImagesBurst.length - 1];
        await sendImageToOpenAI(lastImage); // Use the new function
    } else {
        setFeedbackMessage("Failed to capture required images.");
        setCaptureStep('error');
    }

  }, [stopDetectionInterval, captureStep, sendImageToOpenAI]);

  // Updated detection interval to call the burst capture function
  const startDetectionInterval = useCallback(() => {
    if (!videoRef.current || !faceapi.nets.tinyFaceDetector.isLoaded || intervalRef.current) return;
    
    consecutiveFaceDetectionsRef.current = 0; 

    intervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState >= 3 && !videoRef.current.paused) {
        const detections = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
        );

        if (detections) {
          consecutiveFaceDetectionsRef.current++;
          if (captureStep === 'waiting_for_face') {
             setFeedbackMessage("Face detected, hold still...");
          }
        } else {
          consecutiveFaceDetectionsRef.current = 0;
          if (captureStep === 'waiting_for_face') {
            setFeedbackMessage("Please position your face in the center.");
          }
        }

        if (captureStep === 'waiting_for_face' && consecutiveFaceDetectionsRef.current >= STABLE_FACE_DETECTION_COUNT) {
          handleAutoCaptureImageBurst(); 
        }
      }
    }, 700);
  }, [captureStep, handleAutoCaptureImageBurst]);

  const startCamera = useCallback(async () => {
    if (videoStream) return;
    setCaptureStep('starting_camera');
    setFeedbackMessage("Initializing camera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } });
      setVideoStream(stream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setFeedbackMessage("Camera access denied or no camera found. Please check permissions.");
      setCaptureStep('error');
    }
  }, [videoStream]);

  const stopCamera = useCallback(() => {
    stopDetectionInterval();
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoStream, stopDetectionInterval]);

  // Effect for loading models (runs once)
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setIsModelsLoaded(true);
        console.log("Face detection models loaded.");
      } catch (error) {
        console.error("Error loading face detection models:", error);
        setFeedbackMessage("Error loading models. Please try again later.");
        setCaptureStep('error');
      }
    };
    loadModels();
  }, []);

  // Effect to attach stream and play video
  useEffect(() => {
    if (videoRef.current && videoStream) {
      console.log("Attaching stream and playing video...");
      videoRef.current.srcObject = videoStream;
      let attempts = 0;
      const tryPlay = () => {
          videoRef.current?.play()
            .then(() => {
              console.log("Video play started successfully.");
              setCaptureStep('waiting_for_face');
              setFeedbackMessage("Please position your face in the center.");
            })
            .catch(err => {
              attempts++;
              console.error(`Error playing video (attempt ${attempts}):`, err);
              if (err.name === 'AbortError' && attempts < 3) {
                console.log("Retrying play...");
                setTimeout(tryPlay, 100);
              } else if (err.name !== 'AbortError') { 
                  setFeedbackMessage("Could not start camera. Check permissions/browser.");
                  setCaptureStep('error');
              }
            });
        };
      tryPlay();

    } else if (!videoStream && videoRef.current) {
         videoRef.current.srcObject = null;
    }
  }, [videoStream]);

  // Main effect for managing component state based on props and internal steps
   useEffect(() => {
    if (open) {
      if (!isModelsLoaded) {
        setFeedbackMessage("Loading face detection models...");
      } else if (captureStep === 'initial') {
        setFeedbackMessage("Click 'Start Scan' to activate camera.");
      }
      
      if (isModelsLoaded && videoStream && captureStep === 'waiting_for_face' && videoRef.current && !videoRef.current.paused) {
        startDetectionInterval();
      } else if (captureStep !== 'waiting_for_face') {
        stopDetectionInterval();
      }

    } else {
      stopCamera();
      setCaptureStep('initial');
      setIsLoadingApi(false);
      if (isModelsLoaded) {
        setFeedbackMessage("Models loaded. Click 'Start Scan' to begin.");
      }
    }
    
    return () => {
       if (intervalRef.current) {
          stopDetectionInterval();
       }
    };
  }, [open, isModelsLoaded, videoStream, captureStep, startDetectionInterval, stopDetectionInterval, stopCamera]);

  const handleStartScanClick = () => {
    if (!isModelsLoaded) {
        setFeedbackMessage("Models are still loading. Please wait.");
        return;
    }
    startCamera();
  };

  const handleCloseDialog = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleCloseDialog(); }}>
      <DialogContent className="sm:max-w-lg glass-card text-card-foreground text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            <Camera className="mr-2 h-5 w-5" /> Face Scan
          </DialogTitle>
          <DialogDescription className="text-card-foreground/80">
            {captureStep !== 'success' && captureStep !== 'analyzing' && captureStep !== 'error' && 
             `Position your face in the center of the frame.`}
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-video bg-muted/50 my-4 flex items-center justify-center rounded-lg border overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted 
            className={`w-full h-full object-cover ${videoStream ? 'block' : 'hidden'}`}
          />
          {captureStep === 'initial' && !videoStream && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <Camera size={48} className="text-muted-foreground mb-2"/>
                <p className="text-muted-foreground">Camera is off. Click "Start Scan".</p>
             </div>
          )}
          {(captureStep === 'starting_camera') && !videoStream && (
            <p className="text-muted-foreground p-4">Initializing camera...</p>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} /> 

        <div className={`bg-accent/30 p-3 rounded mb-4 border min-h-[60px] flex items-center justify-center 
                       ${captureStep === 'error' ? 'border-destructive text-destructive' : 
                         captureStep === 'success' ? 'border-green-500 text-green-600' : 'border-border'}`}>
          {isLoadingApi || captureStep === 'analyzing' || captureStep === 'auto_capturing' ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : captureStep === 'error' ? (
            <AlertTriangle className="h-5 w-5 mr-2" />
          ) : captureStep === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : null}
          <p className="text-sm">{feedbackMessage}</p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2">
          {captureStep === 'initial' && (
            <Button 
              type="button" 
              onClick={handleStartScanClick}
              disabled={!isModelsLoaded || isLoadingApi}
              className="w-full sm:w-auto"
            >
              <Camera className="mr-2 h-4 w-4" /> Start Scan
            </Button>
          )}
          {(captureStep !== 'initial' && captureStep !== 'success') && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseDialog} 
              disabled={isLoadingApi && captureStep === 'analyzing'}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
           {(captureStep === 'success' || captureStep === 'error') && (
             <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseDialog}
              className="w-full sm:w-auto"
            >
            Close
          </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FaceScanPopup; 