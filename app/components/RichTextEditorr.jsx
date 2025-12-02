'use client';

import { useState, useEffect, useRef } from 'react';

export default function RichTextEditor({ value, onChange, onWordCountChange }) {
  const [editorValue, setEditorValue] = useState(value);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleInput = (e) => {
    const newValue = e.target.innerHTML;
    setEditorValue(newValue);
    onChange(newValue);
    
    // Calculate word count
    const text = newValue.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    onWordCountChange?.(words.length);
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateToolbar();
  };

  const updateToolbar = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const insertHeading = (level) => {
    formatText('formatBlock', `<h${level}>`);
  };

  const insertList = (type) => {
    formatText('insert' + (type === 'ordered' ? 'OrderedList' : 'UnorderedList'));
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      formatText('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      formatText('insertImage', url);
    }
  };

  const wordCount = editorValue.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap items-center gap-2">
        {/* Font Style */}
        <div className="flex items-center border-r border-gray-300 pr-3 gap-1">
          <button
            type="button"
            onClick={() => formatText('bold')}
            className={`p-2 rounded ${isBold ? 'bg-red-100 text-red-700' : 'hover:bg-gray-200 text-gray-700'}`}
            title="Bold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => formatText('italic')}
            className={`p-2 rounded ${isItalic ? 'bg-red-100 text-red-700' : 'hover:bg-gray-200 text-gray-700'}`}
            title="Italic"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => formatText('underline')}
            className={`p-2 rounded ${isUnderline ? 'bg-red-100 text-red-700' : 'hover:bg-gray-200 text-gray-700'}`}
            title="Underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center border-r border-gray-300 pr-3 gap-1">
          <button
            type="button"
            onClick={() => insertHeading(2)}
            className="p-2 text-sm font-bold hover:bg-gray-200 text-gray-700 rounded"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertHeading(3)}
            className="p-2 text-sm font-bold hover:bg-gray-200 text-gray-700 rounded"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => insertHeading(4)}
            className="p-2 text-sm font-bold hover:bg-gray-200 text-gray-700 rounded"
            title="Heading 4"
          >
            H4
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center border-r border-gray-300 pr-3 gap-1">
          <button
            type="button"
            onClick={() => insertList('unordered')}
            className="p-2 hover:bg-gray-200 text-gray-700 rounded"
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => insertList('ordered')}
            className="p-2 hover:bg-gray-200 text-gray-700 rounded"
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {/* Insert */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={insertLink}
            className="p-2 hover:bg-gray-200 text-gray-700 rounded"
            title="Insert Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
          </button>
          <button
            type="button"
            onClick={insertImage}
            className="p-2 hover:bg-gray-200 text-gray-700 rounded"
            title="Insert Image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </button>
        </div>

        {/* Word Count */}
        <div className="ml-auto text-sm text-gray-500">
          {wordCount} words
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[400px] p-4 focus:outline-none overflow-y-auto prose max-w-none"
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: editorValue }}
        placeholder="Start writing your blog post here..."
      />

      {/* Help Text */}
      <div className="bg-gray-50 border-t border-gray-300 p-3 text-sm text-gray-500">
        <p>💡 <strong>Tips:</strong> Use headings for structure, add images to make it engaging, and keep paragraphs short for better readability.</p>
      </div>
    </div>
  );
}