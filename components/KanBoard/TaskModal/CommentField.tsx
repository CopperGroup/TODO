"use client"

import { useState, useRef, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Bold, Italic, LinkIcon, List, ListOrdered, ImageIcon, Code, X, Paperclip } from 'lucide-react'

interface CommentFieldProps {
  onCommentAdd: (newComment: string, attachments?: File[]) => void
}

export default function CommentField({ onCommentAdd }: CommentFieldProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-invert min-h-[100px] w-full text-gray-100 focus:outline-none",
      },
    },
  })

  const [isEditorEmpty, setIsEditorEmpty] = useState(true)

  useEffect(() => {
    if (editor) {
      editor.on("update", () => {
        setIsEditorEmpty(editor.isEmpty)
      })
    }
  }, [editor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((!isEditorEmpty || attachments.length > 0) && editor) {
      onCommentAdd(editor.getHTML(), attachments)
      editor.commands.setContent("")
      setAttachments([])
      setIsExpanded(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result && editor) {
          editor.chain().focus().setImage({ src: e.target.result as string }).run()
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const toolbarActions = [
    { icon: Bold, tooltip: "Bold", action: () => editor?.chain().focus().toggleBold().run() },
    { icon: Italic, tooltip: "Italic", action: () => editor?.chain().focus().toggleItalic().run() },
    {
      icon: LinkIcon,
      tooltip: "Insert link",
      action: () => {
        const url = window.prompt("Enter the URL")
        if (url) {
          editor?.chain().focus().setLink({ href: url }).run()
        } else {
          editor?.chain().focus().unsetLink().run()
        }
      },
    },
    { icon: List, tooltip: "Bullet list", action: () => editor?.chain().focus().toggleBulletList().run() },
    { icon: ListOrdered, tooltip: "Numbered list", action: () => editor?.chain().focus().toggleOrderedList().run() },
    { icon: Code, tooltip: "Code block", action: () => editor?.chain().focus().toggleCodeBlock().run() },
    { icon: ImageIcon, tooltip: "Insert image", action: () => imageInputRef.current?.click() },
    { icon: Paperclip, tooltip: "Attach file", action: () => fileInputRef.current?.click() },
  ]

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {!isExpanded ? (
        <Input
          type="text"
          placeholder="Add comment..."
          className="bg-zinc-800/50 border-zinc-700 text-gray-100 placeholder-gray-400"
          onClick={() => setIsExpanded(true)}
          onFocus={() => setIsExpanded(true)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50">
            <div className="space-y-2">
              <div className="border-b border-zinc-700 p-2">
                <div className="flex flex-wrap gap-1">
                  {toolbarActions.map(({ icon: Icon, tooltip, action }, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 text-gray-100 p-0 hover:bg-zinc-700 hover:text-zinc-300"
                            onClick={(e) => {
                              e.preventDefault()
                              action()
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
              <div className="p-2">
                <EditorContent editor={editor} />
              </div>
              {attachments.length > 0 && (
                <div className="border-t border-zinc-700 p-2 text-gray-100">
                  <div className="text-sm font-medium mb-2">Attachments:</div>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center bg-zinc-700 rounded-md p-1">
                        <span className="text-xs text-zinc-300 mr-2">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-zinc-600 hover:text-zinc-300"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
            multiple 
          />
          <input 
            type="file" 
            ref={imageInputRef} 
            className="hidden" 
            onChange={handleImageUpload} 
            accept="image/*" 
          />

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              className="mr-2 text-gray-400 hover:text-gray-100 hover:bg-transparent"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="coppergroup-gradient" disabled={isEditorEmpty && attachments.length === 0}>
              Add Comment
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
