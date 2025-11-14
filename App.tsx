import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { generateReunificationImage } from './services/geminiService';

type PhotoState = {
  base64Data: string;
  mimeType: string;
} | null;

const App: React.FC = () => {
  const [childPhoto, setChildPhoto] = useState<PhotoState>(null);
  const [adultPhoto, setAdultPhoto] = useState<PhotoState>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileToPhotoState = (file: File): Promise<PhotoState> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve({
          base64Data: base64String.split(',')[1],
          mimeType: file.type,
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };
  
  const handleChildPhotoUpload = async (file: File) => {
    try {
      const photoState = await fileToPhotoState(file);
      setChildPhoto(photoState);
    } catch (e) {
      setError('Failed to read child photo.');
    }
  };

  const handleAdultPhotoUpload = async (file: File) => {
    try {
      const photoState = await fileToPhotoState(file);
      setAdultPhoto(photoState);
    } catch (e) {
      setError('Failed to read adult photo.');
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!childPhoto || !adultPhoto) {
      setError('Please upload both photos before generating.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultBase64 = await generateReunificationImage(childPhoto, adultPhoto);
      setGeneratedImage(`data:image/jpeg;base64,${resultBase64}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [childPhoto, adultPhoto]);

  const handleStartOver = () => {
    setChildPhoto(null);
    setAdultPhoto(null);
    setGeneratedImage(null);
    setError(null);
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'rewindpix_reunion.jpeg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isGenerateDisabled = !childPhoto || !adultPhoto || isLoading;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-5xl mx-auto flex flex-col flex-grow">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
            RewindPix
          </h1>
          <p className="mt-2 text-md sm:text-lg text-slate-400">A temporal hug. Reconnect with your younger self.</p>
        </header>

        <main className="flex-grow w-full">
          {!generatedImage && !isLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <ImageUploader
                  id="child-photo"
                  label="1. Upload Your Childhood Photo"
                  onImageUpload={handleChildPhotoUpload}
                />
                <ImageUploader
                  id="adult-photo"
                  label="2. Upload Your Recent Photo"
                  onImageUpload={handleAdultPhotoUpload}
                />
              </div>
              <div className="text-center">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerateDisabled}
                  className="px-8 py-3 w-full sm:w-auto bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  Generate Reunion
                </button>
              </div>
            </>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center bg-slate-800/80 p-10 rounded-lg">
              <Spinner />
              <p className="mt-4 text-lg text-teal-400 animate-pulse">Your special moment is being created...</p>
              <p className="mt-2 text-sm text-slate-400">This can take a minute. Please wait.</p>
            </div>
          )}

          {error && (
             <div className="text-center bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg my-8">
              <p className="font-bold">An Error Occurred</p>
              <p>{error}</p>
            </div>
          )}
          
          {generatedImage && !isLoading && (
            <div className="flex flex-col items-center text-center animate-fade-in w-full">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Your Reunion is Ready</h2>
              <div className="bg-slate-800/50 p-2 rounded-lg shadow-2xl max-w-2xl w-full">
                <img src={generatedImage} alt="Generated reunion" className="rounded-md w-full h-auto" />
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center max-w-sm sm:max-w-md">
                <button
                  onClick={handleStartOver}
                  className="w-full px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105"
                >
                  Create Another
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full px-6 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Image
                </button>
              </div>
            </div>
          )}
        </main>
        
        <footer className="text-center mt-auto pt-8 pb-4">
          <p className="text-sm text-slate-400">
            Created by Gupreet Singh
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
