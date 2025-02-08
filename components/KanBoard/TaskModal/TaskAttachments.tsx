"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { FiPlus, FiX, FiFile } from "react-icons/fi"
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileAlt } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { useUpload } from "@/lib/hooks/useUpload"
import { useDeleteFile } from "@/lib/hooks/useDeleteFile"

interface TaskAttachmentsProps {
  attachments: string[]
  onAttachmentAdd: (urls: string[]) => void
  onAttachmentRemove: (attachments: string[], index: number) => void
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ attachments, onAttachmentAdd, onAttachmentRemove }) => {
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(false)
  const { uploadFiles, isUploading, error } = useUpload()
  const { deleteFile } = useDeleteFile() // Initialize the delete hook

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsDropzoneOpen(false)
      const uploadedUrls = await uploadFiles(acceptedFiles)
      if (uploadedUrls.length > 0) {
        onAttachmentAdd(uploadedUrls)
      }
    },
    [uploadFiles, onAttachmentAdd],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "text/plain": [],
    },
  })

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return <FaFilePdf className="text-red-500 w-6 h-6" />
      case "doc":
      case "docx":
        return <FaFileWord className="text-blue-500 w-6 h-6" />
      case "xls":
      case "xlsx":
        return <FaFileExcel className="text-green-500 w-6 h-6" />
      case "txt":
        return <FaFileAlt className="text-gray-400 w-6 h-6" />
      default:
        return <FiFile className="text-gray-400 w-6 h-6" />
    }
  }

  const isImage = (attachment: string) => {
    return /\.(jpeg|jpg|gif|png|webp|bmp)$/i.test(attachment)
  }

  const handleAttachmentRemove = async (index: number, attachment: string) => {
    // Call the delete file hook to delete from Cloudinary (or your storage service)
    await deleteFile(attachment)
    onAttachmentRemove([attachment], index) // Remove from the local state after deletion
  }

  return (
    <Accordion type="single" collapsible defaultValue="attachments" className="w-full">
      <AccordionItem value="attachments" className="text-zinc-100 border-0">
        <AccordionTrigger
          className="text-lg font-semibold text-zinc-100 hover:no-underline"
          onClick={() => setIsDropzoneOpen(false)}
        >
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
                disabled={isUploading}
              >
                <FiPlus className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Add Attachment"}
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

            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative group">
                  {isImage(attachment) ? (
                    <img
                      src={attachment || "/placeholder.svg"}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 flex flex-col items-center justify-center bg-zinc-800 rounded-lg p-2">
                      {getFileIcon(attachment)}
                      <span className="mt-2 text-xs text-center text-zinc-400 truncate w-full">
                        {attachment.split("/").pop()}
                      </span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAttachmentRemove(index, attachment)}
                    className="absolute top-1 right-1 bg-zinc-900/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <FiX className="w-4 h-4" />
                  </Button>
                  <a
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 w-full h-full z-10"
                    aria-label={`View attachment ${index + 1}`}
                  />
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
