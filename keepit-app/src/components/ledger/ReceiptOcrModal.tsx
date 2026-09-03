"use client";

import React, { useState, useEffect, useRef } from "react";
import { SAMPLE_RECEIPTS, ParsedReceipt, parseReceiptText } from "@/lib/ocr/receiptScanner";
import { 
  X, 
  Camera, 
  Zap, 
  ZapOff, 
  RefreshCw, 
  Sparkles, 
  Check, 
  FileText, 
  CheckCircle2, 
  Receipt as ReceiptIcon,
  ChevronUp,
  SlidersHorizontal
} from "lucide-react";

interface ReceiptOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReceipt: (receipt: ParsedReceipt) => void;
}

export const ReceiptOcrModal: React.FC<ReceiptOcrModalProps> = ({
  isOpen,
  onClose,
  onConfirmReceipt,
}) => {
  const [selectedSample, setSelectedSample] = useState<string>("rcpt-fairprice");
  const [parsedData, setParsedData] = useState<ParsedReceipt>(SAMPLE_RECEIPTS[0].data);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCaptured, setHasCaptured] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [useRealWebcam, setUseRealWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setHasCaptured(false);
      setIsScanning(false);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [isOpen]);

  const handleStartRealCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setUseRealWebcam(true);
        }
      }
    } catch (err) {
      console.log("Webcam not available, using high-fidelity simulated camera feed", err);
      setUseRealWebcam(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectSample = (sampleId: string) => {
    setSelectedSample(sampleId);
    const sample = SAMPLE_RECEIPTS.find((s) => s.id === sampleId);
    if (sample) {
      setParsedData(sample.data);
    }
  };

  const handleTriggerShutter = () => {
    setIsScanning(true);
    setScanProgress(0);

    // Simulate OCR scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setHasCaptured(true);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleConfirm = () => {
    onConfirmReceipt(parsedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Mobile-Sized Camera Viewfinder Frame */}
      <div className="bg-[#080d14] border border-slate-800 sm:rounded-3xl w-full max-w-md h-full sm:h-[680px] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* 1. Camera Top Bar */}
        <div className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFlashOn(!isFlashOn)}
              className={`p-2 rounded-full border transition ${
                isFlashOn
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-black/40 text-slate-300 border-slate-700"
              }`}
            >
              {isFlashOn ? <Zap className="w-4 h-4 fill-amber-400" /> : <ZapOff className="w-4 h-4" />}
            </button>

            <span className="text-[11px] font-semibold text-slate-300 px-2.5 py-1 rounded-full bg-black/50 border border-slate-700">
              Singapore Receipt OCR
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Main Viewfinder Display */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950">
          {/* Flashlight Overlay simulation */}
          {isFlashOn && (
            <div className="absolute inset-0 bg-amber-100/10 pointer-events-none z-10 animate-pulse" />
          )}

          {/* Real Webcam Stream if available */}
          {useRealWebcam ? (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
          ) : (
            /* High-Fidelity Realistic Receipt Under Camera */
            <div className="w-[85%] h-[88%] bg-[#fcfcfc] text-slate-900 rounded-lg p-4 font-mono shadow-2xl relative overflow-hidden flex flex-col justify-between select-none rotate-[-0.5deg]">
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-400 pb-2">
                <div className="font-extrabold text-sm tracking-tight text-slate-950">
                  {parsedData.merchantName.toUpperCase()}
                </div>
                <div className="text-[10px] text-slate-600">
                  SINGAPORE TAX INVOICE #8921-SG
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  DATE: {parsedData.date} • TEL: 6552 2722
                </div>
              </div>

              {/* Receipt Items */}
              <div className="py-2 space-y-1 text-xs">
                {parsedData.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px]">
                    <span className="truncate pr-2">{item.name}</span>
                    <span className="font-bold">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Receipt Total */}
              <div className="border-t-2 border-dashed border-slate-900 pt-2">
                <div className="flex justify-between items-center text-sm font-black text-slate-950">
                  <span>TOTAL SGD</span>
                  <span className="text-base">${parsedData.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-600 mt-0.5 font-bold">
                  <span>PAYMENT MODE</span>
                  <span className="px-1 py-0.2 bg-slate-200 rounded">CASH OUTFLOW</span>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="text-center pt-2 text-[9px] text-slate-400">
                ||||| | |||| ||| ||||||| | ||||| |||||
              </div>

              {/* Simulated OCR Detection Bounding Boxes (When scanned) */}
              {(isScanning || hasCaptured) && (
                <>
                  <div className="absolute top-4 left-3 right-3 h-8 border-2 border-emerald-500 bg-emerald-500/10 rounded animate-pulse" />
                  <div className="absolute bottom-10 left-3 right-3 h-10 border-2 border-emerald-500 bg-emerald-500/20 rounded animate-pulse" />
                </>
              )}
            </div>
          )}

          {/* Camera Viewfinder Corners / Crosshair UI */}
          <div className="absolute inset-x-8 inset-y-12 pointer-events-none z-10 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
              <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
            </div>

            {/* Sweeping Laser Scan Line */}
            {isScanning && (
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/80 animate-bounce" />
            )}

            <div className="flex justify-between">
              <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
              <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
            </div>
          </div>

          {/* Quick Preset Receipt Selector Pills */}
          {!hasCaptured && (
            <div className="absolute bottom-3 inset-x-4 z-20 flex justify-center space-x-1.5 overflow-x-auto pb-1">
              {SAMPLE_RECEIPTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap backdrop-blur-md transition border ${
                    selectedSample === s.id
                      ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md"
                      : "bg-black/60 text-white border-slate-700 hover:bg-black/80"
                  }`}
                >
                  {s.data.merchantName.split(" ")[0]} (${s.data.totalAmount.toFixed(2)})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Camera Bottom Controls / Result Sheet */}
        {hasCaptured ? (
          /* Bottom Result Sheet */
          <div className="p-4 bg-[#0e1622] border-t border-slate-800 space-y-3 animate-slideUp z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Receipt Captured & Parsed
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    {parsedData.merchantName} • {parsedData.category}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-black text-emerald-300">
                  ${parsedData.totalAmount.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">Cash Spend</div>
              </div>
            </div>

            {/* Opportunity Cost Preview Tag */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Adding this will trigger an opportunity cost check against your expiring CDC vouchers!
              </span>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => setHasCaptured(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              >
                Retake Photo
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Log</span>
              </button>
            </div>
          </div>
        ) : (
          /* Camera Shutter Bar */
          <div className="p-5 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-around z-20">
            <button
              onClick={handleStartRealCamera}
              className="p-3 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
              title="Use Webcam"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Circular Shutter Button */}
            <button
              onClick={handleTriggerShutter}
              disabled={isScanning}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition shadow-lg shadow-emerald-500/20"
            >
              <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 font-bold">
                {isScanning ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-slate-950" />
                )}
              </div>
            </button>

            <button
              onClick={() => handleSelectSample("rcpt-kopitiam")}
              className="p-3 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Sample Presets"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
