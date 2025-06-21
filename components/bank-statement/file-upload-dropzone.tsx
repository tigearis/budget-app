"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface FileUploadDropzoneProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  acceptedFormats?: string[]
  isProcessing?: boolean
}

interface UploadedFile {
  file: File
  id: string
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  error?: string
}

export function FileUploadDropzone({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFormats = [".pdf", ".csv", ".ofx", ".qif"],
  isProcessing = false,
}: FileUploadDropzoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setErrors([])

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const newErrors = rejectedFiles.map(({ file, errors }) => {
          const errorMessages = errors.map((e: any) => {
            switch (e.code) {
              case "file-too-large":
                return `${file.name}: File is too large (max ${maxSize / 1024 / 1024}MB)`
              case "file-invalid-type":
                return `${file.name}: Invalid file type. Accepted: ${acceptedFormats.join(", ")}`
              case "too-many-files":
                return `Too many files. Maximum ${maxFiles} files allowed`
              default:
                return `${file.name}: ${e.message}`
            }
          })
          return errorMessages.join(", ")
        })
        setErrors(newErrors)
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
          file,
          id: Math.random().toString(36).substring(7),
          status: "pending",
          progress: 0,
        }))

        setUploadedFiles((prev) => [...prev, ...newFiles])
        onFilesSelected(acceptedFiles)
      }
    },
    [maxFiles, maxSize, acceptedFormats, onFilesSelected],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
      "application/x-ofx": [".ofx"],
      "application/x-qif": [".qif"],
    },
    maxFiles,
    maxSize,
    disabled: isProcessing,
  })

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "csv":
        return <File className="h-5 w-5 text-green-500" />
      case "ofx":
      case "qif":
        return <File className="h-5 w-5 text-blue-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 hover:border-gray-400"}
              ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />

            {isDragActive ? (
              <p className="text-lg font-medium text-blue-600">Drop your bank statements here...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium">Drag & drop your bank statements here</p>
                <p className="text-sm text-gray-500">or click to browse files</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {acceptedFormats.map((format) => (
                    <Badge key={format} variant="secondary">
                      {format.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Maximum {maxFiles} files, up to {maxSize / 1024 / 1024}MB each
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Uploaded Files</h3>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getFileIcon(uploadedFile.file.name)}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{uploadedFile.file.name}</p>
                    <p className="text-sm text-gray-500">{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</p>

                    {uploadedFile.status === "uploading" && <Progress value={uploadedFile.progress} className="mt-2" />}

                    {uploadedFile.error && <p className="text-sm text-red-500 mt-1">{uploadedFile.error}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(uploadedFile.status)}

                    {!isProcessing && (
                      <Button variant="ghost" size="sm" onClick={() => removeFile(uploadedFile.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
