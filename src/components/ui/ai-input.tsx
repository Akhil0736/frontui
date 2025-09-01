
'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Mic, X, Sparkles, Plus } from 'lucide-react';

const AIInputField = ({ onSend, isLoading }: { onSend: (message: string) => void, isLoading: boolean }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + sizes[i];
  };

  const handleSubmit = () => {
    if ((message.trim() || uploadedFiles.length > 0) && !isLoading) {
      onSend(message);
      setMessage('');
      setUploadedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Input Container */}
      <div className={`relative transition-all duration-500 ease-out ${
        isFocused || message || uploadedFiles.length > 0
          ? 'transform scale-105'
          : ''
      }`}>

        {/* Glow Effect */}
        <div className={`absolute -inset-2 rounded-3xl transition-all duration-500 ${
          isFocused
            ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl scale-110'
            : 'dark:bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 blur-lg'
        }`}></div>

        {/* Input Container */}
        <div className={`relative backdrop-blur-xl bg-white/80 dark:bg-slate-900/60 border-2 rounded-3xl transition-all duration-300 ${
          isFocused
            ? 'border-blue-400/50 shadow-2xl shadow-blue-500/25'
            : 'border-white/20 dark:border-slate-700/50 shadow-xl dark:shadow-slate-900/50'
        } hover:shadow-2xl hover:shadow-slate-400/30 dark:hover:shadow-purple-500/20`}>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="p-4 border-b border-white/20 dark:border-slate-700/50">
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="group flex items-center gap-2 bg-gradient-to-r from-slate-100/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-sm truncate max-w-32">{file.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">({formatFileSize(file.size)})</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all duration-200 hover:scale-110"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Input Area */}
          <div className="flex items-end p-4 md:p-6 gap-2 md:gap-4">

            {/* Left Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative p-3 rounded-2xl bg-gradient-to-br from-slate-100/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 hover:from-blue-100/80 hover:to-purple-100/80 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title="Upload files"
              >
                <Paperclip className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-300"></div>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.json"
              />

              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`group relative p-3 rounded-2xl transition-all duration-300 hover:scale-110 ${
                  isRecording
                    ? 'bg-gradient-to-br from-red-100/80 to-pink-100/80 dark:from-red-900/40 dark:to-pink-900/40 animate-pulse shadow-lg shadow-red-300/50'
                    : 'bg-gradient-to-br from-slate-100/80 to-white/80 dark:from-slate-800/80 dark:to-slate-700/80 hover:from-green-100/80 hover:to-emerald-100/80 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 hover:shadow-lg'
                }`}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                <Mic className={`w-5 h-5 transition-colors duration-300 ${
                  isRecording
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-600 dark:text-slate-300 group-hover:text-green-600 dark:group-hover:text-green-400'
                }`} />
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                  isRecording
                    ? 'bg-gradient-to-br from-red-400/20 to-pink-400/20'
                    : 'bg-gradient-to-br from-green-400/0 to-emerald-400/0 group-hover:from-green-400/20 group-hover:to-emerald-400/20'
                }`}></div>
              </button>
            </div>

            {/* Text Input - No Background */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask me anything... ✨"
                className="w-full resize-none border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-lg leading-relaxed min-h-[32px] max-h-32 bg-transparent font-medium selection:bg-blue-200/50"
                rows={1}
                style={{ background: 'transparent' }}
                disabled={isLoading}
              />

              {/* Cursor Animation */}
              {isFocused && !message && (
                <div className="absolute top-1 left-0 w-0.5 h-7 bg-gradient-to-b from-blue-500 to-purple-500 animate-pulse rounded-full"></div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || (!message.trim() && uploadedFiles.length === 0)}
              className={`group relative p-4 rounded-2xl font-medium transition-all duration-300 ${
                (message.trim() || uploadedFiles.length > 0) && !isLoading
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transform-gpu'
                  : 'bg-gradient-to-br from-slate-200/80 to-slate-300/80 dark:from-slate-800/80 dark:to-slate-700/80 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-6 h-6" />
              {(message.trim() || uploadedFiles.length > 0) && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>
          </div>

          {/* Magic Sparkles */}
          {isFocused && (
            <div className="absolute -top-2 -left-2 w-6 h-6">
              <Sparkles className="w-4 h-4 text-blue-400 animate-bounce" />
            </div>
          )}
          {isFocused && (
            <div className="absolute -top-1 -right-3 w-6 h-6">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
            </div>
          )}
          {isFocused && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6">
              <Plus className="w-3 h-3 text-pink-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl shadow-red-500/50">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="font-medium">Listening...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { AIInputField };
export default AIInputField;
