'use client';
import { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  Image, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Eye,
  Edit3
} from 'lucide-react';
import NotificationModal from './NotificationModal';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });
  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ isOpen: false, title: '', message: '', type: 'info' });
  const [isUploading, setIsUploading] = useState(false);

  // Update cursor position when selection changes
  const handleSelectionChange = () => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      setCursorPosition({ start, end });
    }
  };

  // Insert text at cursor position
  const insertText = (before: string, after: string = '', newlineAfter: boolean = false) => {
    if (!editorRef.current) return;

    const start = cursorPosition.start;
    const end = cursorPosition.end;
    const selectedText = value.substring(start, end);
    
    let newText;
    if (selectedText) {
      // Wrap selected text
      newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    } else {
      // Insert at cursor
      const insertion = before + after + (newlineAfter ? '\n' : '');
      newText = value.substring(0, start) + insertion + value.substring(end);
    }
    
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      if (editorRef.current) {
        const newCursorPos = selectedText ? start + before.length + selectedText.length + after.length : start + before.length;
        editorRef.current.setSelectionRange(newCursorPos, newCursorPos);
        editorRef.current.focus();
      }
    }, 0);
  };

  // Formatting functions
  const formatBold = () => insertText('**', '**');
  const formatItalic = () => insertText('*', '*');
  const formatUnderline = () => insertText('<u>', '</u>');
  const formatCode = () => insertText('`', '`');
  const formatCodeBlock = () => insertText('```\n', '\n```', true);
  const formatQuote = () => insertText('> ');
  const formatH1 = () => insertText('# ');
  const formatH2 = () => insertText('## ');
  const formatH3 = () => insertText('### ');
  const formatUnorderedList = () => insertText('- ');
  const formatOrderedList = () => insertText('1. ');
  const formatLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      const currentSelectedText = value.substring(cursorPosition.start, cursorPosition.end);
      if (currentSelectedText) {
        insertText(`[${currentSelectedText}](`, `${url})`);
      } else {
        insertText('[Link text](', `${url})`);
      }
    }
  };
  const formatImage = () => {
    if (isUploading) return; // Prevent multiple uploads
    
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setNotificationModal({
          isOpen: true,
          title: 'Invalid File Type',
          message: 'Please select a valid image file (JPEG, PNG, or WebP)',
          type: 'error'
        });
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotificationModal({
          isOpen: true,
          title: 'File Too Large',
          message: 'File size must be less than 5MB',
          type: 'error'
        });
        return;
      }
      
      setIsUploading(true);
      
      // Store current state for reliable replacement
      const currentValue = value;
      const currentCursor = cursorPosition;
      const uploadingText = '![Uploading image...]()';
      
      // Insert uploading placeholder
      const beforeText = currentValue.substring(0, currentCursor.start);
      const afterText = currentValue.substring(currentCursor.end);
      const newValueWithPlaceholder = beforeText + uploadingText + afterText;
      onChange(newValueWithPlaceholder);
      
      try {
        // Upload the file
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/blog/upload', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Replace the uploading text with the actual image
          const imageMarkdown = `![${file.name.split('.')[0]}](${result.url})`;
          const newValue = newValueWithPlaceholder.replace(uploadingText, imageMarkdown);
          onChange(newValue);
          
          setNotificationModal({
            isOpen: true,
            title: 'Upload Successful',
            message: 'Image has been uploaded and inserted successfully!',
            type: 'success'
          });
        } else {
          // Remove the uploading text on error
          const newValue = newValueWithPlaceholder.replace(uploadingText, '');
          onChange(newValue);
          
          setNotificationModal({
            isOpen: true,
            title: 'Upload Failed',
            message: result.error || 'Failed to upload image. Please try again.',
            type: 'error'
          });
        }
      } catch (error) {
        // Remove the uploading text on error
        const newValue = newValueWithPlaceholder.replace(uploadingText, '');
        onChange(newValue);
        
        console.error('Upload error:', error);
        setNotificationModal({
          isOpen: true,
          title: 'Upload Error',
          message: 'Failed to upload image. Please check your connection and try again.',
          type: 'error'
        });
      } finally {
        setIsUploading(false);
      }
    };
    
    // Trigger file selection
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  // Convert markdown to HTML for preview
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/gim, '<u>$1</u>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      .replace(/\n/gim, '<br>');
  };

  const toolbarButtons = [
    { icon: Bold, action: formatBold, title: 'Bold (Ctrl+B)' },
    { icon: Italic, action: formatItalic, title: 'Italic (Ctrl+I)' },
    { icon: Underline, action: formatUnderline, title: 'Underline' },
    { icon: Code, action: formatCode, title: 'Inline Code' },
    { icon: Heading1, action: formatH1, title: 'Heading 1' },
    { icon: Heading2, action: formatH2, title: 'Heading 2' },
    { icon: Heading3, action: formatH3, title: 'Heading 3' },
    { icon: List, action: formatUnorderedList, title: 'Bullet List' },
    { icon: ListOrdered, action: formatOrderedList, title: 'Numbered List' },
    { icon: Quote, action: formatQuote, title: 'Quote' },
    { icon: Link, action: formatLink, title: 'Insert Link' },
    { icon: Image, action: formatImage, title: 'Upload Image' },
  ];

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatBold();
          break;
        case 'i':
          e.preventDefault();
          formatItalic();
          break;
        case 'k':
          e.preventDefault();
          formatLink();
          break;
      }
    }
  };

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Formatting Buttons */}
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={button.action}
              title={button.title}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
            >
              <button.icon size={16} />
            </button>
          ))}
          
          {/* Separator */}
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {/* Code Block Button */}
          <button
            type="button"
            onClick={formatCodeBlock}
            title="Code Block"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
          >
            <Code size={16} />
            <span className="ml-1 text-xs">Block</span>
          </button>
          
          {/* Separator */}
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isPreviewMode 
                ? 'bg-[#81D7B4] text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {isPreviewMode ? <Edit3 size={16} /> : <Eye size={16} />}
            <span className="text-sm font-medium">
              {isPreviewMode ? 'Edit' : 'Preview'}
            </span>
          </button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative">
        {isPreviewMode ? (
          /* Preview Mode */
          <div 
            className="p-4 min-h-[400px] prose prose-lg max-w-none bg-white text-gray-900 prose-headings:text-gray-900 prose-p:text-gray-900 prose-li:text-gray-900 prose-strong:text-gray-900 prose-em:text-gray-900"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
          />
        ) : (
          /* Edit Mode */
          <textarea
            ref={editorRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleSelectionChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Start writing your content...'}
            className="w-full p-4 min-h-[400px] resize-none focus:outline-none text-gray-800 leading-relaxed bg-white border-0"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
          />
        )}
      </div>

      {/* Footer with helpful tips */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>💡 Use Ctrl+B for bold, Ctrl+I for italic</span>
            <span>📝 Supports full Markdown syntax</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{value.length} characters</span>
            <span>•</span>
            <span>~{Math.ceil(value.split(' ').length / 200)} min read</span>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal(prev => ({ ...prev, isOpen: false }))}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
      />
    </div>
  );
}