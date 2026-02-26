import { useEffect, useRef, useState, useCallback } from 'react';
import { decodeQRFromImageData, hasBarcodeDetector } from '../utils/qrDecode';

interface BarcodeDetectorResult {
  readonly rawValue: string;
}

interface BarcodeDetectorClass {
  new (options: { formats: string[] }): {
    detect(source: ImageBitmapSource): Promise<BarcodeDetectorResult[]>;
  };
}

declare const BarcodeDetector: BarcodeDetectorClass | undefined;

interface ScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  isActive: boolean;
}

export function Scanner({ onScan, onError, isActive }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopCamera();
      return;
    }

    let cancelled = false;
    const detector = hasBarcodeDetector
      ? new BarcodeDetector!({ formats: ['qr_code'] })
      : null;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setHasPermission(true);

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const scanFrame = async () => {
          if (cancelled || !video.videoWidth) {
            rafRef.current = requestAnimationFrame(scanFrame);
            return;
          }

          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
          ctx.drawImage(video, 0, 0);

          try {
            if (detector) {
              const codes = await detector.detect(canvas);
              if (codes.length > 0 && !cancelled) {
                onScan(codes[0]!.rawValue);
              }
            } else {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const result = decodeQRFromImageData(imageData);
              if (result && !cancelled) {
                onScan(result);
              }
            }
          } catch {
            // Frame decode failed, continue scanning
          }

          if (!cancelled) {
            rafRef.current = requestAnimationFrame(scanFrame);
          }
        };

        rafRef.current = requestAnimationFrame(scanFrame);
      } catch (err) {
        if (!cancelled) {
          setHasPermission(false);
          onError?.(err instanceof Error ? err.message : 'Camera access denied');
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isActive, onScan, onError, stopCamera]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="scanner-container">
      {hasPermission === false && (
        <div className="scanner-error">
          Camera access denied. Please allow camera access to scan QR codes.
        </div>
      )}
      <video ref={videoRef} className="scanner-viewport" playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="scanner-hint">Point camera at a TESSSERA QR code</div>
    </div>
  );
}
