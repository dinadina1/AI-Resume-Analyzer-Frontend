import React, { useState, useRef } from 'react';
import {
  RiCloseLine, RiDownloadLine, RiAddLine,
  RiFilePaper2Line, RiEditLine, RiCheckLine,
} from 'react-icons/ri';
import { cn } from '@/utils/format';

interface Suggestion {
  message: string;
  source?: string;
  category?: string;
}

interface ResumePreviewProps {
  rawText: string;
  resumeName: string;
  suggestions?: Suggestion[];
  onClose: () => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  rawText,
  resumeName,
  suggestions = [],
  onClose,
}) => {
  const [editableText, setEditableText] = useState(rawText);
  const [addedSuggestions, setAddedSuggestions] = useState<Set<number>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleAddSuggestion = (idx: number, msg: string) => {
    if (addedSuggestions.has(idx)) return;
    setEditableText((prev) => `${prev}\n\n--- AI Suggestion ---\n${msg}`);
    setAddedSuggestions((prev) => new Set([...prev, idx]));
  };

  const handleExportTxt = () => {
    const blob = new Blob([editableText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resumeName.replace(/\.pdf$/i, '') + '_edited.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    const lines = editableText.split('\n');
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${resumeName}</title>
  <style>
    body { font-family: 'Georgia', serif; max-width: 780px; margin: 40px auto; color: #1a1a1a; line-height: 1.7; font-size: 14px; }
    h1 { font-size: 22px; border-bottom: 2px solid #333; padding-bottom: 8px; }
    p { margin: 4px 0; }
    .ai-suggestion { background: #f0f4ff; border-left: 4px solid #4f46e5; padding: 8px 12px; margin: 12px 0; border-radius: 4px; font-style: italic; color: #374151; }
    hr { border: 0; border-top: 1px solid #ddd; margin: 16px 0; }
  </style>
</head>
<body>
${lines.map((line) => {
      if (line.startsWith('--- AI Suggestion ---')) return '<div class="ai-suggestion">';
      if (line === '') return '<br/>';
      return `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
    }).join('\n')}
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resumeName.replace(/\.pdf$/i, '') + '_edited.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="w-full max-w-6xl bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <RiFilePaper2Line className="text-primary-400 text-xl" />
            <div>
              <h2 className="text-white font-semibold">{resumeName}</h2>
              <p className="text-xs text-surface-500">Resume Preview &amp; Editor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all',
                isEditing
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              )}
            >
              {isEditing ? <RiCheckLine /> : <RiEditLine />}
              {isEditing ? 'Done' : 'Edit'}
            </button>
            <button
              onClick={handleExportTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
              title="Export as .txt"
            >
              <RiDownloadLine /> .txt
            </button>
            <button
              onClick={handleExportHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-primary-600 hover:bg-primary-500 text-white transition-all"
              title="Export as formatted HTML"
            >
              <RiDownloadLine /> Export HTML
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
            >
              <RiCloseLine className="text-xl" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex gap-0 h-[75vh]">
          {/* Resume Text Panel */}
          <div className="flex-1 flex flex-col border-r border-surface-800">
            <div className="px-4 py-2.5 border-b border-surface-800 bg-surface-950/50">
              <p className="text-xs text-surface-500 font-medium">
                {isEditing ? '✏️ Editing — click text to modify' : '📄 Resume content (extracted text)'}
              </p>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {isEditing ? (
                <textarea
                  ref={textRef}
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  className="w-full h-full bg-transparent text-sm text-surface-200 font-mono leading-relaxed resize-none outline-none"
                  spellCheck={false}
                />
              ) : (
                <pre className="text-sm text-surface-200 font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {editableText}
                </pre>
              )}
            </div>
          </div>

          {/* Suggestions Panel */}
          {suggestions.length > 0 && (
            <div className="w-80 flex-shrink-0 flex flex-col">
              <div className="px-4 py-2.5 border-b border-surface-800 bg-surface-950/50">
                <p className="text-xs text-surface-500 font-medium">
                  ✨ AI Suggestions — click + to add to resume
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-3 rounded-lg border text-xs transition-all',
                      addedSuggestions.has(i)
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-surface-800 border-surface-700 text-surface-300'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="leading-relaxed flex-1">{s.message}</p>
                      <button
                        onClick={() => handleAddSuggestion(i, s.message)}
                        disabled={addedSuggestions.has(i)}
                        className={cn(
                          'flex-shrink-0 p-1 rounded-md transition-all',
                          addedSuggestions.has(i)
                            ? 'text-emerald-400 cursor-default'
                            : 'text-primary-400 hover:bg-primary-500/20'
                        )}
                        title={addedSuggestions.has(i) ? 'Added' : 'Add to resume'}
                      >
                        {addedSuggestions.has(i) ? <RiCheckLine /> : <RiAddLine />}
                      </button>
                    </div>
                    {addedSuggestions.has(i) && (
                      <p className="text-emerald-500 text-xs mt-1 font-medium">✓ Added to document</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-surface-800">
                <p className="text-xs text-surface-600 text-center">
                  {addedSuggestions.size} of {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} added
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
