"use client";

import 'regenerator-runtime/runtime';
import { useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
    onRecordingComplete: (transcript: string) => void;
    isProcessing: boolean;
}

export function VoiceRecorder({ onRecordingComplete, isProcessing }: VoiceRecorderProps) {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const { toast } = useToast();
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            toast({
                variant: "destructive",
                title: "Browser not supported",
                description: "Your browser does not support speech recognition. Please use Chrome.",
            });
        }
    }, [browserSupportsSpeechRecognition, toast]);

    const startListening = () => {
        resetTranscript();
        setHasStarted(true);
        SpeechRecognition.startListening({ continuous: true });
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
        if (transcript.length < 5) {
            toast({
                variant: "destructive",
                title: "Too short",
                description: "Please provide a longer answer.",
            });
            return;
        }
        onRecordingComplete(transcript);
    };

    if (!browserSupportsSpeechRecognition) {
        return <div className="text-red-500">Browser not supported.</div>;
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50 w-full min-h-[100px] text-center flex items-center justify-center">
                {listening ? (
                    <p className="italic text-muted-foreground animate-pulse">Listening...</p>
                ) : transcript ? (
                    <p className="text-sm">{transcript}</p>
                ) : (
                    <p className="text-sm text-muted-foreground">Click the microphone to start answering...</p>
                )}
            </div>

            <div className="flex space-x-2">
                {!listening ? (
                    <Button
                        onClick={startListening}
                        variant={hasStarted ? "secondary" : "default"}
                        disabled={isProcessing}
                    >
                        <Mic className="mr-2 h-4 w-4" />
                        {hasStarted ? "Retake Answer" : "Start Answer"}
                    </Button>
                ) : (
                    <Button
                        onClick={stopListening}
                        variant="destructive"
                    >
                        <Square className="mr-2 h-4 w-4" />
                        Stop & Submit
                    </Button>
                )}
            </div>
        </div>
    );
}
