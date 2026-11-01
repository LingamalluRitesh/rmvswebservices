import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Link as LinkIcon, Check, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { processDeviceImage } from '../../utils/imageUtils';

interface DeviceAvatarUploaderProps {
  currentAvatarUrl?: string | null;
  fallbackName?: string;
  size?: 'sm' | 'md' | 'lg';
  onAvatarChange: (newAvatarUrl: string | null) => void;
  onDirectUploadSuccess?: (avatarUrl: string | null) => void;
  directUploadApiUrl?: string; // e.g. '/developers/me/avatar'
}

export const DeviceAvatarUploader: React.FC<DeviceAvatarUploaderProps> = ({
  currentAvatarUrl,
  fallbackName = 'User',
  size = 'md',
  onAvatarChange,
  onDirectUploadSuccess,
  directUploadApiUrl,
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarUrl || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop changes
  React.useEffect(() => {
    setAvatarPreview(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  const handleFileSelection = async (file: File) => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsProcessing(true);

    try {
      const result = await processDeviceImage(file, 512, 0.85);
      setAvatarPreview(result.dataUrl);
      onAvatarChange(result.dataUrl);
      setStatusMessage(`Selected from device (${result.sizeKb} KB optimized WebP)`);

      // If directUploadApiUrl is provided, upload immediately to backend & cloud DB
      if (directUploadApiUrl) {
        const { default: api } = await import('../../api/client');
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post(directUploadApiUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setStatusMessage('Auto-synced across all devices!');
        if (onDirectUploadSuccess) {
          onDirectUploadSuccess(res.data.avatar_url);
        }
      }
    } catch (err: any) {
      console.error('Failed to process image:', err);
      setErrorMessage(err.message || 'Could not process the selected image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
    // Reset input value so re-selecting same file triggers change
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleRemovePhoto = async () => {
    setErrorMessage(null);
    setAvatarPreview(null);
    onAvatarChange(null);
    setUrlInputValue('');
    setStatusMessage('Photo removed. Using initials.');

    if (directUploadApiUrl) {
      try {
        const { default: api } = await import('../../api/client');
        await api.delete(directUploadApiUrl);
        if (onDirectUploadSuccess) {
          onDirectUploadSuccess(null);
        }
      } catch (e) {
        console.error('Failed to delete avatar from server', e);
      }
    }
  };

  const handleApplyUrl = () => {
    const clean = urlInputValue.trim();
    if (!clean) return;
    setAvatarPreview(clean);
    onAvatarChange(clean);
    setStatusMessage('Applied image URL');
    setErrorMessage(null);
  };

  const initialLetter = fallbackName ? fallbackName.charAt(0).toUpperCase() : 'U';

  const avatarSizeClasses = {
    sm: 'w-16 h-16 text-xl rounded-2xl',
    md: 'w-20 h-20 text-2xl rounded-2xl sm:w-24 sm:h-24 sm:rounded-3xl',
    lg: 'w-28 h-28 text-3xl rounded-3xl sm:w-32 sm:h-32',
  }[size];

  return (
    <div className="space-y-3">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif, image/bmp"
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleInputChange}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Interactive Avatar Area / Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer shrink-0 transition-all duration-200 ${
            isDragging ? 'ring-4 ring-emerald-500 scale-105' : 'hover:scale-[1.02]'
          }`}
          title="Click or drag an image here to upload from device"
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt={fallbackName}
              className={`${avatarSizeClasses} object-cover ring-2 ring-black/10 shadow-md bg-slate-100`}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
              }}
            />
          ) : (
            <div
              className={`${avatarSizeClasses} bg-gradient-to-br from-slate-100 to-slate-200 border border-black/10 flex items-center justify-center text-slate-800 font-bold shadow-sm`}
            >
              {initialLetter}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/45 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
            {isProcessing ? (
              <RefreshCw size={20} className="animate-spin text-white" />
            ) : (
              <>
                <Camera size={20} className="mb-1" />
                <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">
                  Change
                </span>
              </>
            )}
          </div>

          {/* Loading indicator */}
          {isProcessing && (
            <div className="absolute inset-0 bg-[#060b19]/80 rounded-2xl sm:rounded-3xl flex items-center justify-center">
              <RefreshCw size={22} className="animate-spin text-cyan-400" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Select from Device button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Upload size={14} />
              <span>Select from Device</span>
            </button>

            {/* Mobile Camera Button */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-[#070e22] hover:bg-[#0e1938] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border border-blue-500/30"
              title="Take a photo with device camera"
            >
              <Smartphone size={14} className="text-cyan-400" />
              <span>Camera</span>
            </button>

            {/* Remove Photo */}
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isProcessing}
                className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-all border border-rose-500/30"
                title="Remove custom photo"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            )}

            {/* Optional URL toggle */}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-3 py-2 rounded-xl bg-transparent hover:bg-[#070e22] text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <LinkIcon size={13} />
              <span>{showUrlInput ? 'Hide URL' : 'Use URL'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Choose any photo (PNG, JPG, WebP) directly from your phone, laptop, or camera. It will be center-cropped, auto-optimized, and synchronized across all devices.
          </p>

          {/* URL Input Accordion */}
          {showUrlInput && (
            <div className="pt-2 flex items-center gap-2">
              <input
                type="url"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 bg-slate-50 border border-black/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-black/30"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-black transition-colors"
              >
                Apply
              </button>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
              <Check size={13} className="text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
              <AlertCircle size={13} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
