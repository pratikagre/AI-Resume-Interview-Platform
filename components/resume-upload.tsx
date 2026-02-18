"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onAnalysisComplete: (data: any) => void;
}

export function ResumeUpload({ onAnalysisComplete }: ResumeUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const onDrop = (acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile?.type !== "application/pdf") {
            toast({
                variant: "destructive",
                title: "Invalid file type",
                description: "Please upload a PDF file.",
            });
            return;
        }
        setFile(selectedFile);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
    });

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/resume/analyze", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to analyze resume");
            }

            const data = await response.json();
            toast({
                title: "Success",
                description: "Resume analyzed successfully!",
            });
            onAnalysisComplete(data);
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong during analysis.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            {!file ? (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
                        isDragActive
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground/25 hover:border-primary/50"
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Drop your resume here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        or click to select a PDF file
                    </p>
                </div>
            ) : (
                <div className="border rounded-lg p-6 bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        {!isUploading && (
                            <Button variant="ghost" size="icon" onClick={removeFile}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing Resume...
                            </>
                        ) : (
                            "Analyze Resume"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
