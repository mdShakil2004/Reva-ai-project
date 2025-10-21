import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faRedo } from '@fortawesome/free-solid-svg-icons';
import { streamQuery } from '../service/ChatService';
import './UniverseOrb.css';

// Clean text by removing markdown, LaTeX, emojis, and ensuring spaces after punctuation
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s*/g, '') // Remove markdown headers
    .replace(/\*\*|\*/g, '') // Remove bold/italic markers
    .replace(/`{1,3}[^`]*`{1,3}/g, (match) => match.replace(/`/g, '')) // Remove code block markers
    .replace(/>\s*/g, '') // Remove blockquote markers
    .replace(/^\s*-+\s*$/gm, '') // Remove horizontal rules   
    .replace(/^\s*-\s*/gm, '') // Remove list markers
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove markdown links
    .replace(/\\\((.*?)?\\\)/g, '$1') // Remove LaTeX
    .replace(/(?<!\|)\|(?!\|)/g, '') // Remove single pipes
    .replace(/:-+:|-+:/g, '') // Remove table alignment
    .replace(/([.!?])(?=\S)/g, '$1 ') // Ensure space after punctuation
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .replace(/^\s*|\s*$/g, '') // Trim whitespace
    .replace(/\n{2,}/g, '\n') // Normalize newlines
    .replace(/[\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, ''); // Remove emojis
};

const UniverseOrb = () => {
  const canvasRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const isProcessingRef = useRef(false);
  const isListeningRef = useRef(false);
  const sentenceBufferRef = useRef('');
  const responseBufferRef = useRef('');
  const darkMode = true; // Fixed to dark mode for cosmic theme
  const chatId = 'universe-orb'; // Fixed chat ID for simplicity

  // Particle Class for Universe Tunnel Animation
  class FlowParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.radius = Math.random() * 200 + 200;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 2 + 0.8;
      this.size = Math.random() * 2 + 1.5;
      this.alpha = Math.random() * 0.6 + 0.4;
      this.color = `rgba(${100 + Math.random() * 155}, ${150 + Math.random() * 100}, 255, ${this.alpha})`;
    }
    update() {
      this.radius -= this.speed;
      if (this.radius < 5) this.reset();
      this.x = 100 + Math.cos(this.angle) * this.radius;
      this.y = 100 + Math.sin(this.angle) * this.radius;
      this.size *= 0.985;
      this.alpha *= 0.97;
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    }
  }

  // Initialize Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    const centerX = 100;
    const centerY = 100;

    let particles = [];
    for (let i = 0; i < 400; i++) {
      particles.push(new FlowParticle());
    }

    const animate = () => {
      requestAnimationFrame(animate);
      const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 90);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.2, 'rgba(20,20,40,0.9)');
      grad.addColorStop(0.6, 'rgba(0,0,80,0.7)');
      grad.addColorStop(1, 'rgba(0,0,20,1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 200, 200);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      let holeGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 20);
      holeGrad.addColorStop(0, 'rgba(10,13,13,1)');
      holeGrad.addColorStop(0.3, 'rgba(10,13,13,1)');
      holeGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
      ctx.fillStyle = holeGrad;
      ctx.fill();
    };

    animate();
  }, []);

  // Speak Initial Greeting on Mount
  useEffect(() => {
    const greeting = 'Hi there, how may I help you?';
    speakText(greeting);
  }, []);

  // Validate Transcript
  const isValidTranscript = (text) => {
    if (!text || !text.trim()) return false;
    const words = text.trim().split(/\s+/);
    if (words.length < 1 || text.length < 3) return false;
    const alphabeticRatio = text.replace(/[^a-zA-Z]/g, '').length / text.length;
    return alphabeticRatio > 0.6;
  };

  // Initialize SpeechRecognition
  const initializeRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (isListeningRef.current && isValidTranscript(finalTranscript)) {
          setTranscript(finalTranscript);
          finalTranscriptRef.current = finalTranscript;
          setErrorMessage('');
          if (!isProcessingRef.current) {
            fetchChatResponse(finalTranscript);
          }
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setTranscript('');
        finalTranscriptRef.current = '';
        if (event.error === 'network') {
          setErrorMessage('Network error. Please check your connection.');
          speakText('Network error. Please check your connection.');
          setIsListening(false);
          isListeningRef.current = false;
        } else if (event.error === 'aborted') {
          setErrorMessage('Speech recognition interrupted. Please try again.');
          speakText('Speech recognition interrupted. Please try again.');
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
          }
          if (isListeningRef.current) {
            setTimeout(() => {
              if (isListeningRef.current && !isSpeaking && !isProcessingRef.current) {
                initializeRecognition();
                if (recognitionRef.current) {
                  recognitionRef.current.start();
                }
              }
            }, 1000);
          }
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please speak again.');
          speakText('No speech detected. Please speak again.');
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
          }
          if (isListeningRef.current) {
            setTimeout(() => {
              if (isListeningRef.current && !isSpeaking && !isProcessingRef.current) {
                initializeRecognition();
                if (recognitionRef.current) {
                  recognitionRef.current.start();
                }
              }
            }, 1000);
          }
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}.`);
          speakText(`Speech recognition error: ${event.error}.`);
          setIsListening(false);
          isListeningRef.current = false;
        }
        isProcessingRef.current = false;
      };

      recognitionRef.current.onend = () => {
        if (isListeningRef.current && !isSpeaking && !isProcessingRef.current) {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
              recognitionRef.current.start();
            }
          }, 1000);
        }
      };
    } else {
      setErrorMessage('Speech recognition not supported in this browser.');
      speakText('Speech recognition not supported in this browser.');
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  // Sync isListeningRef
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Fetch Chat Response using streamQuery
  const fetchChatResponse = async (prompt) => {
    if (!isValidTranscript(prompt) || isProcessingRef.current) {
      return;
    }
    isProcessingRef.current = true;
    setResponseText('');
    setIsSpeaking(false);
    setErrorMessage('');
    window.speechSynthesis.cancel();
    sentenceBufferRef.current = '';
    responseBufferRef.current = '';

    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
    }

    try {
      let hasValidResponse = false;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API request timed out after 10 seconds')), 10000);
      });

      const streamPromise = new Promise((resolve, reject) => {
        streamQuery(
          chatId,
          prompt,
          (chunk) => {
            const cleanedChunk = cleanText(chunk).replace(/deepseek/gi, 'Grok');
            if (cleanedChunk.trim()) {
              hasValidResponse = true;
              responseBufferRef.current += ' ' + cleanedChunk;
              setResponseText(cleanText(responseBufferRef.current).replace(/deepseek/gi, 'Grok').trim());
              sentenceBufferRef.current += cleanedChunk + ' ';
              const sentences = sentenceBufferRef.current.split(/(?<=[.!?])\s+/);
              if (sentences.length > 1) {
                const completeSentences = sentences.slice(0, -1);
                completeSentences.forEach((sentence) => {
                  const trimmedSentence = sentence.trim();
                  if (trimmedSentence) {
                    speakText(trimmedSentence);
                  }
                });
                sentenceBufferRef.current = sentences[sentences.length - 1]?.trim() || '';
              }
            }
          },
          () => {
            if (sentenceBufferRef.current.trim()) {
              speakText(sentenceBufferRef.current.trim());
            }
            resolve();
          },
          (error) => {
            let errorMsg = 'Error fetching response from API. Please try again.';
            if (error.message?.includes('429')) {
              errorMsg = 'API rate limit exceeded. Please wait and try again.';
            } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
              errorMsg = 'Network error during API call. Please check your connection.';
            }
            errorMsg = errorMsg.replace(/deepseek/gi, 'Grok');
            setErrorMessage(errorMsg);
            setResponseText(hasValidResponse ? responseBufferRef.current.trim() : errorMsg);
            speakText(errorMsg);
            if (sentenceBufferRef.current.trim()) {
              speakText(sentenceBufferRef.current.trim());
            }
            sentenceBufferRef.current = '';
            responseBufferRef.current = '';
            reject(error);
          }
        );
      });

      await Promise.race([streamPromise, timeoutPromise]);

      if (!hasValidResponse && finalTranscriptRef.current) {
        const fallbackMsg = 'Sorry, I didn’t get a response. Please try again.';
        setResponseText(fallbackMsg);
        setErrorMessage(fallbackMsg);
        speakText(fallbackMsg);
      }

      isProcessingRef.current = false;
      finalTranscriptRef.current = '';
      setTranscript('');
      sentenceBufferRef.current = '';
      responseBufferRef.current = '';
    } catch (error) {
      let errorMsg = 'Error fetching response from API. Please try again.';
      if (error.message.includes('429')) {
        errorMsg = 'API rate limit exceeded. Please wait and try again.';
      } else if (error.message.includes('timeout')) {
        errorMsg = 'API request timed out. Please try again.';
      } else if (error.message.includes('network')) {
        errorMsg = 'Network error during API call. Please check your connection.';
      }
      errorMsg = errorMsg.replace(/deepseek/gi, 'Grok');
      setResponseText(responseBufferRef.current ? cleanText(responseBufferRef.current).replace(/deepseek/gi, 'Grok').trim() : errorMsg);
      setErrorMessage(errorMsg);
      speakText(errorMsg);
      isProcessingRef.current = false;
      finalTranscriptRef.current = '';
      if (sentenceBufferRef.current.trim()) {
        speakText(sentenceBufferRef.current.trim());
      }
      sentenceBufferRef.current = '';
      responseBufferRef.current = '';
    }
  };

  // Speak Text
  const speakText = (text) => {
    if (!text) return;
    const grokText = text.replace(/deepseek/gi, 'Grok');
    if (!isSpeaking) {
      setIsSpeaking(true);
      utteranceRef.current = new SpeechSynthesisUtterance(grokText);
      utteranceRef.current.lang = 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const clearVoice = voices.find(voice => voice.lang === 'en-US' && (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Samantha')));
      if (clearVoice) {
        utteranceRef.current.voice = clearVoice;
      }
      utteranceRef.current.rate = 1.0;
      utteranceRef.current.pitch = 1.0;
      utteranceRef.current.volume = 1.0;

      utteranceRef.current.onend = () => {
        setIsSpeaking(false);
        if (isListeningRef.current && recognitionRef.current && !isProcessingRef.current) {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
              recognitionRef.current.start();
            }
          }, 1000);
        }
      };
      utteranceRef.current.onerror = () => {
        setIsSpeaking(false);
        if (isListeningRef.current && recognitionRef.current && !isProcessingRef.current) {
          setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
              recognitionRef.current.start();
            }
          }, 1000);
        }
      };
      window.speechSynthesis.speak(utteranceRef.current);
    } else {
      utteranceRef.current.text += ' ' + grokText;
    }
  };

  // Toggle Listening
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      isListeningRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setTranscript('');
      setResponseText('');
      setErrorMessage('');
      finalTranscriptRef.current = '';
      isProcessingRef.current = false;
      sentenceBufferRef.current = '';
      responseBufferRef.current = '';
      window.speechSynthesis.cancel();
    } else {
      setIsListening(true);
      isListeningRef.current = true;
      setTranscript('');
      setResponseText('');
      setErrorMessage('');
      finalTranscriptRef.current = '';
      isProcessingRef.current = false;
      sentenceBufferRef.current = '';
      responseBufferRef.current = '';
      initializeRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }
  };

  // Retry after Error
  const handleRetry = () => {
    setErrorMessage('');
    setIsListening(true);
    isListeningRef.current = true;
    setTranscript('');
    finalTranscriptRef.current = '';
    initializeRecognition();
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  // Load Voices
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-radial">
      <div
        className="relative w-[40vw] max-w-[200px] h-[40vw] max-h-[200px] rounded-full flex items-center justify-center overflow-hidden bg-[#1E1E1E] shadow-gray-900/30"
      >
        <canvas ref={canvasRef} className="absolute w-[90%] h-[90%] rounded-full" />
        <div className="absolute w-80 h-80 rounded-full border-2 border-blue-500/30 animate-pulseRing"></div>
        <div className="absolute w-72 h-72 rounded-full border-2 border-blue-500/50 animate-pulseRing delay-200"></div>
        <div className="absolute w-64 h-64 rounded-full border-2 border-blue-500/70 animate-pulseRing delay-400"></div>
        <div className="relative flex flex-col items-center w-full px-4 z-10">
          
         
          {transcript && (
            <p className="mt-2 text-sm text-center text-gray-400">
              You said: {transcript}
            </p>
          )}
          {responseText && (
            <p className="mt-2 text-sm text-center text-gray-400">
              Response: {responseText}
            </p>
          )}
          {errorMessage && (
            <div className="mt-2 text-center">
              <p className="text-sm text-red-400">{errorMessage}</p>
              <button
                onClick={handleRetry}
                className="mt-2 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all"
              >
                <FontAwesomeIcon icon={faRedo} className="text-sm" />
                <span className="ml-2">Retry</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniverseOrb;