"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { FiPaperclip, FiPlus, FiX, FiChevronDown } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronDown } from "lucide-react"
import { delay, motion } from "framer-motion"

interface TaskAttachmentsProps {
  attachments: string[]
  onAttachmentAdd: (files: File[]) => void
  onAttachmentRemove: (index: number) => void
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ attachments, onAttachmentAdd, onAttachmentRemove }) => {
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onAttachmentAdd(acceptedFiles)
      setIsDropzoneOpen(false)
    },
    [onAttachmentAdd],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const isImage = (fileName: string) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"]
    const extension = fileName.split(".").pop()?.toLowerCase()
    return extension ? imageExtensions.includes(extension) : false
  }

  return (
    <Accordion type="single" collapsible defaultValue="attachments" className="w-full">
      <AccordionItem value="attachments" className="text-zinc-100 border-0">
        <AccordionTrigger className="text-lg font-semibold text-zinc-100 hover:no-underline" onClick={() => setIsDropzoneOpen(false)}>
          Attachments
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-100 transition-transform duration-200" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div className="flex justify-end">
                <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDropzoneOpen(!isDropzoneOpen)}
                className="text-black justify-center"
                >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Attachment
                </Button>
            </div>

            <motion.div layout>
                {isDropzoneOpen && (
                <div
                    {...getRootProps()}
                    className={`min-h-[200px] flex justify-center items-center border-2 border-dashed border-zinc-700 rounded-lg p-4 text-center cursor-pointer ${
                    isDragActive ? "bg-zinc-800" : "bg-zinc-900"
                    }`}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                    <p className="text-zinc-300">Drop the files here ...</p>
                    ) : (
                    <p className="text-zinc-300">Drag &apos;n&apos; drop some files here, or click to select files</p>
                    )}
                </div>
                )}
            </motion.div>

            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                  {isImage(attachment) ? (
                    <img
                      src={attachment || "/placeholder.svg"}
                      alt={`Attachment ${index + 1}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <FiPaperclip className="text-zinc-400" />
                      <span className="text-zinc-300">{attachment}</span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAttachmentRemove(index)}
                    className="text-zinc-400 hover:text-zinc-100 hover:bg-transparent"
                  >
                    <FiX className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default TaskAttachments

