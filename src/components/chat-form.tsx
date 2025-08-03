import React, { useRef, useState, useEffect } from "react";
import { Send, Loader2, ImagePlus, X } from "lucide-react";
import { useEnterSubmit } from "@/hooks/use-enter-submit";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isValidMessage, isValidImageFile, formatFileSize } from "@/lib/utils";

interface ChatFormProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, selectedImage?: File | null) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatForm({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  disabled = false,
}: ChatFormProps) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const isValid = isValidMessage(input) || selectedImage;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidImageFile(file)) {
      setSelectedImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else if (file) {
      alert("Please select a valid image file (JPEG, PNG, GIF, WebP) under 10MB");
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent submission if disabled or loading
    if (disabled || isLoading) {
      e.preventDefault();
      return;
    }
    onSubmit(e, selectedImage);
    // Clear image after submit
    removeImage();
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-5xl mx-auto">
        <form ref={formRef} onSubmit={handleSubmit} className="flex items-end gap-2 p-2">
          {/* Image Preview */}
          {selectedImage && imagePreview && (
            <div className="relative inline-block">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-2 max-w-xs">
                <img 
                  src={imagePreview} 
                  alt="Selected image" 
                  className="max-w-full h-auto max-h-32 rounded"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedImage.name} ({formatFileSize(selectedImage.size)})
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Input Row */}
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              placeholder={
                selectedImage 
                  ? "Describe what you're concerned about in this image..." 
                  : "Describe your symptoms or health concerns..."
              }
              className="min-h-[52px] max-h-32 resize-none border-2 bg-white focus:border-red-400 focus:ring-0 rounded-2xl px-4 py-3 pr-12 text-sm transition-colors border-gray-200"
              disabled={disabled || isLoading}
              rows={1}
              maxLength={4000}
            />
            {/* Character count */}
            <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
              {input.length > 0 && (
                <span className={input.length > 3800 ? "text-orange-500" : ""}>
                  {input.length}/4000
                </span>
              )}
            </div>
          </div>

          {/* Image Upload Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-12 w-12 rounded-xl border-2 border-gray-200 hover:border-red-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
          >
            <ImagePlus className="h-5 w-5" />
          </Button>
          
          {/* Send Button */}
          <Button 
            type="submit" 
            disabled={disabled || isLoading || !isValid}
            className="min-w-[44px] h-[44px] bg-red-500 hover:bg-red-600"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </form>
      </div>
      
      <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
        <span>Baymax Lite provides healthcare information but is not a substitute for professional medical care.</span>
      </div>
    </div>
  );
}