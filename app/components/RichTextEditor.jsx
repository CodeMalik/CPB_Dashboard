"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, useRef, useCallback } from "react"
import { EditorContent, useEditor, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react"
import { Node as TiptapNode, Mark, mergeAttributes } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import TiptapBold from "@tiptap/extension-bold"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Code,
  Trash2,
  Palette,
  Square,
  Image as ImageIcon,
} from "lucide-react"

// ─── Custom Resizable Image Extension ──────────────────────────────────────
const ResizableImage = Image.extend({
  inline: true,
  group: 'inline',
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },
      height: {
        default: 'auto',
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) return {}
          return { height: attributes.height }
        },
      },
      style: {
        default: 'display: inline-block; margin: 0 8px; vertical-align: middle; border-radius: 8px; box-shadow: 0 2px 10px -3px rgba(0,0,0,0.1);',
        renderHTML: attributes => ({ style: attributes.style }),
      }
    }
  },
})

// ─── Custom BlockDecorator Node (for wrapping content in styled divs) ──────
const BlockDecorator = TiptapNode.create({
  name: 'blockDecorator',
  group: 'block',
  content: 'block+',
  defining: true,
  draggable: false,

  addAttributes() {
    return {
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {}
          return { style: `background-color: ${attributes.backgroundColor}` }
        },
      },
      borderRadius: {
        default: null,
        parseHTML: element => element.style.borderRadius,
        renderHTML: attributes => {
          if (!attributes.borderRadius) return {}
          return { style: `border-radius: ${attributes.borderRadius}` }
        },
      },
      padding: {
        default: '20px',
        parseHTML: element => element.style.padding,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {}
          return { style: `padding: ${attributes.padding || '20px'}` }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-block-decorator]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-block-decorator': '' }), 0]
  },

  addCommands() {
    return {
      setBlockStyle: attributes => ({ commands }) => {
        return commands.wrapIn(this.name, attributes)
      },
      unsetBlockStyle: () => ({ commands }) => {
        return commands.lift(this.name)
      },
    }
  },
})

// ─── Raw HTML Node View (renders inside the editor) ─────────────────────────
function RawHtmlNodeView({ node, selected, deleteNode, extension }) {
  const [hovering, setHovering] = useState(false)
  const showActions = selected || hovering

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this HTML block?")) {
      deleteNode()
    }
  }

  return (
    <NodeViewWrapper>
      <div
        contentEditable={false}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          border: selected ? '2px solid #f97316' : '1px dashed #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px 0',
          position: 'relative',
          backgroundColor: '#fafbfc',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '-10px',
            left: '12px',
            fontSize: '11px',
            color: '#f97316',
            fontFamily: 'monospace',
            backgroundColor: '#fff',
            padding: '0 6px',
            border: '1px solid #fed7aa',
            borderRadius: '4px',
          }}
        >
          HTML Block
        </span>

        {/* Action buttons — visible on hover or when selected */}
        {showActions && (
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              right: '12px',
              display: 'flex',
              gap: '4px',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={handleDelete}
              title="Remove HTML Block"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                border: '1px solid #fca5a5',
                backgroundColor: '#fef2f2',
                cursor: 'pointer',
                color: '#dc2626',
                padding: 0,
              }}
            >
              <Trash2 style={{ width: '13px', height: '13px' }} />
            </button>
          </div>
        )}

        <div dangerouslySetInnerHTML={{ __html: node.attrs.content }} />
      </div>
    </NodeViewWrapper>
  )
}

// ─── Custom RawHtml Tiptap Extension ────────────────────────────────────────
const RawHtml = TiptapNode.create({
  name: 'rawHtml',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      content: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-raw-html]',
        getAttrs: (element) => ({
          content: element.innerHTML,
        }),
      },
    ]
  },

  renderHTML({ node }) {
    // Return a real DOM node so getHTML() preserves the raw content exactly
    const dom = document.createElement('div')
    dom.setAttribute('data-raw-html', '')
    dom.innerHTML = node.attrs.content
    return dom
  },

  addNodeView() {
    return ReactNodeViewRenderer(RawHtmlNodeView)
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { selection } = this.editor.state
        if (selection.node && selection.node.type.name === 'rawHtml') {
          this.editor.commands.deleteSelection()
          return true
        }
        return false
      },
      Delete: () => {
        const { selection } = this.editor.state
        if (selection.node && selection.node.type.name === 'rawHtml') {
          this.editor.commands.deleteSelection()
          return true
        }
        return false
      },
    }
  },
})

// ─── Helper: extract body content from a full HTML document ─────────────────
function extractBodyContent(html) {
  const trimmed = html.trim()
  // If it looks like a full HTML document, extract the body content
  if (trimmed.match(/<!doctype|<html|<head|<body/i)) {
    const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    if (bodyMatch) {
      return bodyMatch[1].trim()
    }
  }
  return trimmed
}

// ─── Main Editor Component ──────────────────────────────────────────────────
export default function RichTextEditor({ value, onChange }) {
  const lastEmittedHtml = useRef(value)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
      }),
      TiptapBold.extend({
        renderHTML({ HTMLAttributes }) {
          return ['strong', HTMLAttributes, 0]
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-red-600 hover:text-red-800 underline cursor-pointer',
        },
      }),
      RawHtml,
      BlockDecorator,
      ResizableImage,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      lastEmittedHtml.current = html
      onChange(html)
    },
    editorProps: {
      handleKeyDown(view, event) {
        if (event.key === "Enter") {
          const { state, dispatch } = view;
          const tr = state.tr;
          state.storedMarks?.forEach((mark) => {
            tr.removeStoredMark(mark.type);
          });
          dispatch(tr);
        }
        return false;
      },
    },
  })

  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [isLinkActive, setIsLinkActive] = useState(false)
  const [linkError, setLinkError] = useState("")
  const [showHtmlInput, setShowHtmlInput] = useState(false)
  const [htmlCode, setHtmlCode] = useState("")
  const [showImageInput, setShowImageInput] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imgWidth, setImgWidth] = useState("100%")
  const [imgHeight, setImgHeight] = useState("auto")
  const [showStyleInput, setShowStyleInput] = useState(false)
  const [bgColor, setBgColor] = useState("#fff176")
  const [borderRadius, setBorderRadius] = useState("4px")

  useEffect(() => {
    if (editor) {
      setIsLinkActive(editor.isActive('link'))
      // Only sync if the value changed externally (not from our own onUpdate)
      if (value !== lastEmittedHtml.current && value !== editor.getHTML()) {
        editor.commands.setContent(value, false)
        lastEmittedHtml.current = value
      }
    }
  }, [editor, value])

  const insertRawHtml = useCallback(() => {
    if (!editor || !htmlCode.trim()) return
    const bodyContent = extractBodyContent(htmlCode.trim())

    editor.chain()
      .focus()
      .insertContent({
        type: 'rawHtml',
        attrs: { content: bodyContent },
      })
      .run()

    setHtmlCode('')
    setShowHtmlInput(false)
  }, [editor, htmlCode])

  const insertImage = useCallback(() => {
    if (!editor || !imageUrl.trim()) return
    editor.chain()
      .focus()
      .setImage({
        src: imageUrl,
        width: imgWidth,
        height: imgHeight
      })
      .run()
    setImageUrl('')
    setShowImageInput(false)
    setImgWidth('100%')
    setImgHeight('auto')
  }, [editor, imageUrl, imgWidth, imgHeight])

  if (!editor) {
    return null
  }

  const validateUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch (_) {
      return url.startsWith('#') || url.startsWith('/') || url.startsWith('mailto:') || url.startsWith('tel:')
    }
  }

  const addLink = () => {
    if (!linkUrl.trim()) {
      setLinkError('Please enter a URL')
      return
    }
    let processedUrl = linkUrl.trim()
    if (!/^https?:\/\//i.test(processedUrl) &&
      !processedUrl.startsWith('#') &&
      !processedUrl.startsWith('/') &&
      !processedUrl.startsWith('mailto:') &&
      !processedUrl.startsWith('tel:')) {
      processedUrl = 'https://' + processedUrl
    }
    if (!validateUrl(processedUrl)) {
      setLinkError('Please enter a valid URL')
      return
    }
    editor.chain().focus().extendMarkRange('link')
      .setLink({ href: processedUrl })
      .run()
    setLinkUrl('')
    setShowLinkInput(false)
    setLinkError('')
  }

  const handleLinkButtonClick = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      setShowLinkInput(false)
    } else {
      setShowLinkInput(true)
      const { from, to } = editor.state.selection
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, ' ')
        if (text) {
          setLinkUrl(text)
        }
      }
    }
  }

  return (
    <div className="border rounded-md prose max-w-none">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b sticky top-0 z-20 bg-white rounded-t-md">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("underline")}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <div className="mx-1 h-6 w-px bg-gray-300" />
        <Toggle
          size="sm"
          pressed={showStyleInput}
          onPressedChange={() => setShowStyleInput(!showStyleInput)}
          aria-label="Styles"
          title="Background & Border Radius"
          className={showStyleInput ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : ''}
        >
          <Palette className={`h-4 w-4 ${showStyleInput ? 'text-purple-700' : ''}`} />
        </Toggle>
        <div className="mx-1 h-6 w-px bg-gray-300" />
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 text-3xl w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <div className="mx-1 h-6 w-px bg-gray-300" />
        <Toggle
          size="sm"
          pressed={showImageInput}
          onPressedChange={() => {
            setShowImageInput(!showImageInput)
            if (!showImageInput) {
              setShowHtmlInput(false)
              setShowStyleInput(false)
            }
          }}
          aria-label="Insert Image"
          title="Insert Image by URL"
          className={showImageInput ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
        >
          <ImageIcon className={`h-4 w-4 ${showImageInput ? 'text-green-700' : ''}`} />
        </Toggle>
        <div className="mx-1 h-6 w-px bg-gray-300" />
        <Toggle
          size="sm"
          pressed={isLinkActive}
          onPressedChange={handleLinkButtonClick}
          aria-label="Add Link"
          className={isLinkActive ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
        >
          <LinkIcon className={`h-4 w-4 ${isLinkActive ? 'text-blue-700' : ''}`} />
        </Toggle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8"
        >
          <Redo className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-6 w-px bg-gray-300" />
        <Toggle
          size="sm"
          pressed={showHtmlInput}
          onPressedChange={() => {
            setShowHtmlInput(!showHtmlInput)
            if (showHtmlInput) setHtmlCode('')
          }}
          aria-label="Insert HTML"
          title="Insert HTML Code"
          className={showHtmlInput ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' : ''}
        >
          <Code className={`h-4 w-4 ${showHtmlInput ? 'text-orange-700' : ''}`} />
        </Toggle>
      </div>

      {showImageInput && (
        <div className="relative p-4 border-b bg-green-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="flex-1 space-y-3 w-full">
              <div className="space-y-1">
                <label className="text-xs font-bold text-green-800">Image URL</label>
                <Input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-white border-green-200 focus-visible:ring-green-500 h-9"
                  autoFocus
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-green-800">Width</label>
                  <Input
                    type="text"
                    placeholder="100%, 400px, etc"
                    value={imgWidth}
                    onChange={(e) => setImgWidth(e.target.value)}
                    className="bg-white border-green-200 focus-visible:ring-green-500 h-9"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-green-800">Height</label>
                  <Input
                    type="text"
                    placeholder="auto, 300px, etc"
                    value={imgHeight}
                    onChange={(e) => setImgHeight(e.target.value)}
                    className="bg-white border-green-200 focus-visible:ring-green-500 h-9"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={insertImage}
                  disabled={!imageUrl.trim()}
                  className="h-9 px-6 bg-green-600 hover:bg-green-700 text-white shadow-md transition-all active:scale-95"
                >
                  Insert Image
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowImageInput(false)
                    setImageUrl('')
                  }}
                  className="h-9 px-4 text-green-700 hover:bg-green-100"
                >
                  Cancel
                </Button>
              </div>
            </div>

            {imageUrl && (
              <div className="w-full md:w-32 lg:w-48 space-y-2">
                <p className="text-[10px] font-bold uppercase text-green-600 tracking-wider">Preview</p>
                <div className="aspect-video bg-white border border-green-200 rounded-lg overflow-hidden flex items-center justify-center p-1 shadow-sm">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showStyleInput && (
        <div className="relative p-3 border-b bg-purple-50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-purple-800">Background:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer border-purple-200"
              />
              <Input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-8 w-24 text-xs font-mono bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-purple-800 flex items-center gap-1">
                <Square className="h-3 w-3" /> Radius:
              </label>
              <Input
                type="text"
                placeholder="4px, 50%, etc"
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
                className="h-8 w-20 text-xs bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  editor.chain().focus().setBlockStyle({
                    backgroundColor: bgColor,
                    borderRadius: borderRadius
                  }).run()
                }}
                className="h-8 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs"
              >
                Apply Style
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  editor.chain().focus().unsetBlockStyle().run()
                }}
                className="h-8 px-3 text-xs text-purple-700 hover:bg-purple-100"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {showLinkInput && (
        <div className="relative p-3 border-b bg-gray-50">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-1">
              <Input
                type="text"
                placeholder="https://example.com or /page"
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value)
                  if (linkError) setLinkError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addLink()
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    setShowLinkInput(false)
                    setLinkUrl('')
                    setLinkError('')
                  }
                }}
                className={`h-9 ${linkError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                autoFocus
              />
              {linkError && (
                <p className="text-xs text-red-500 mt-1">{linkError}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Supports: https://, /page, #section, mailto:, tel:
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={addLink}
                className="h-9 px-4 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply Link
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowLinkInput(false)
                  setLinkUrl('')
                  setLinkError('')
                }}
                className="h-9 px-4 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showHtmlInput && (
        <div className="relative p-3 border-b bg-orange-50">
          <div className="space-y-2">
            <p className="text-xs font-medium text-orange-800">
              Paste your HTML / CSS code below. Full HTML documents are supported — the body content will be extracted automatically.
            </p>
            <Textarea
              placeholder='<div style="color: red;">Your HTML here...</div>'
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              className="font-mono text-sm min-h-[120px] bg-white border-orange-200 focus-visible:ring-orange-500"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault()
                  setShowHtmlInput(false)
                  setHtmlCode('')
                }
              }}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={insertRawHtml}
                disabled={!htmlCode.trim()}
                className="h-9 px-4 whitespace-nowrap bg-orange-600 hover:bg-orange-700 text-white"
              >
                Insert HTML
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowHtmlInput(false)
                  setHtmlCode('')
                }}
                className="h-9 px-4 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div
        className="relative p-4 min-h-[200px] cursor-text"
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent
          editor={editor}
          className="prose prose-sm md:prose-base max-w-none max-h-none focus:outline-none"
        />
        {editor && editor.isEmpty && (
          <p className="pointer-events-none absolute top-4 left-4 text-muted-foreground">
            Start typing...
          </p>
        )}
      </div>
    </div>
  )
}