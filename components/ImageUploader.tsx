/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './Spinner';
import { SparkleIcon } from './icons';

// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}


interface GeneratorScreenProps {
  onImageGenerated: (file: File) => void;
  onBack: () => void;
}

const GeneratorScreen: React.FC<GeneratorScreenProps> = ({ onImageGenerated, onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please describe the image you want to create.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const imageUrl = await generateImage(prompt);
            const imageFile = dataURLtoFile(imageUrl, `generated-${Date.now()}.png`);
            onImageGenerated(imageFile);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, onImageGenerated]);

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6 animate-fade-in text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-100 sm:text-5xl md:text-6xl">
                Create an Image with <span className="text-blue-400">AI</span>
            </h1>
            <p className="max-w-2xl text-lg text-gray-400 md:text-xl">
                Describe your vision in detail, and let our AI bring it to life. From photorealistic scenes to whimsical illustrations.
            </p>
            
            <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 backdrop-blur-sm mt-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., A welcome card for an 8-year-old girl named Isabella visiting Paris for the first time. The card should be in a vertical A4 format, featuring a magical, dreamy Paris with a pastel-colored Eiffel Tower decorated with flowers and fairy lights. Include cute illustrations like macarons and a carousel. The text '¡Bienvenida Isabella!' should be prominent. The style should be sweet and whimsical."
                    className="w-full bg-gray-900/70 border border-gray-600 text-gray-200 rounded-lg p-4 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none transition h-40 resize-none"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 text-lg rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? <Spinner /> : (
                        <>
                            <SparkleIcon className="w-6 h-6 mr-3" />
                            Generate Image
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="mt-4 text-center animate-fade-in bg-red-500/10 border border-red-500/20 p-4 rounded-lg max-w-2xl mx-auto flex flex-col items-center gap-2">
                    <p className="text-md text-red-400">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded-lg text-sm transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            )}
            
            <button 
                onClick={onBack}
                className="mt-4 flex items-center justify-center text-center text-gray-400 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:text-white active:scale-95 text-base"
            >
                Back to start
            </button>
        </div>
    );
};

export default GeneratorScreen;