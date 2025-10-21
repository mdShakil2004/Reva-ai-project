import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause, FaTimes, FaRedo } from "react-icons/fa";
import "../style/Voice.css";
import { handleUserQuery, checkGreetingFuzzy } from "../service/ChatService"; // Add checkGreetingFuzzy import

// Clean text by removing markdown, LaTeX, emojis, and ensuring spaces after punctuation
const cleanText = (text) => {
  if (!text) return "";
  return text
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*|\*/g, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, (match) => match.replace(/`/g, ""))
    .replace(/>\s*/g, "")
    .replace(/^\s*-+\s*$/gm, "")
    .replace(/^\s*-\s*/gm, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\\\((.*?)?\\\)/g, "$1")
    .replace(/(?<!\|)\|(?!\|)/g, "")
    .replace(/:-+:|-+:/g, "")
    .replace(/([.!?])(?=\S)/g, "$1 ")
    .replace(/\s+/g, " ")
    .replace(/^\s*|\s*$/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "");
};

const Voice = ({ darkMode, setShowVoiceInteraction, handleNewChatMessage, currentChatId }) => {
  const canvasRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCaptions, setShowCaptions] = useState(false);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const isProcessingRef = useRef(false);
  const isListeningRef = useRef(false);
  const sentenceBufferRef = useRef("");
  const responseBufferRef = useRef("");
  const hasGreetedRef = useRef(false);
  const evtSourceRef = useRef(null);
  const captionTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const lastSpokenTextRef = useRef("");
  const ignoredTranscriptCountRef = useRef(0);
  const utteranceQueueRef = useRef([]);
  const apiRetryCountRef = useRef(0);
  const chatId = currentChatId || (Date.now().toString(36) + Math.random().toString(36).substring(2));

  // Validate transcript with enhanced echo prevention
  const isValidTranscript = (text) => {
    if (!text || !text.trim()) {
      console.log("Invalid transcript: empty or whitespace", { text });
      return false;
    }
    const words = text.trim().split(/\s+/);
    const alphabeticRatio = text.replace(/[^a-zA-Z]/g, "").length / text.length;
    if (words.length < 1 || text.length < 2) {
      console.log("Invalid transcript: too short or no words", { text, words });
      ignoredTranscriptCountRef.current += 1;
      return false;
    }
    const normalizedText = text.toLowerCase().replace(/[^a-zA-Z\s]/g, "").trim();
    const normalizedLastSpoken = lastSpokenTextRef.current.toLowerCase().replace(/[^a-zA-Z\s]/g, "").trim();
    // Enhanced echo detection
    if (
      normalizedLastSpoken &&
      (normalizedText === normalizedLastSpoken ||
        normalizedText.includes(normalizedLastSpoken) ||
        normalizedLastSpoken.includes(normalizedText)) &&
      text.length <= lastSpokenTextRef.current.length * 1.5
    ) {
      console.log("Transcript matches recent TTS, ignoring:", { text, normalizedText, normalizedLastSpoken });
      ignoredTranscriptCountRef.current += 1;
      return false;
    }
    // Block common TTS phrases
    const ttsPhrases = [
      "hi there how may i help you today",
      "error fetching response from api",
      "please try again",
      "network error",
      "api request timed out",
      "api rate limit exceeded"
    ];
    if (ttsPhrases.some(phrase => normalizedText.includes(phrase))) {
      console.log("Transcript matches known TTS phrase, ignoring:", { text, normalizedText });
      ignoredTranscriptCountRef.current += 1;
      return false;
    }
    if (alphabeticRatio < 0.5) {
      console.log("Invalid transcript: low alphabetic ratio", { text, alphabeticRatio });
      ignoredTranscriptCountRef.current += 1;
      return false;
    }
    ignoredTranscriptCountRef.current = 0;
    console.log("Valid transcript:", { text });
    return true;
  };

  // Stop recognition
  const stopRecognition = () => {
    if (recognitionRef.current) {
      console.log("Stopping SpeechRecognition");
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  // Start recognition
  const startRecognition = () => {
    stopRecognition();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition not supported in this browser.");
      const errorMsg = "Speech recognition is not supported in this browser.";
      setErrorMessage(errorMsg);
      speakText(errorMsg);
      setShowCaptions(true);
      resetCaptionTimeout();
      setIsListening(false);
      isListeningRef.current = false;
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-IN";
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      console.log("SpeechRecognition onresult:", {
        interimTranscript,
        finalTranscript,
        isListening: isListeningRef.current,
        isProcessing: isProcessingRef.current,
        isSpeaking,
      });

      if (isListeningRef.current && isValidTranscript(finalTranscript) && !isSpeaking && !isProcessingRef.current) {
        setTranscript(finalTranscript);
        finalTranscriptRef.current = finalTranscript;
        setErrorMessage("");
        setShowCaptions(true);
        resetCaptionTimeout();
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && !isProcessingRef.current && !isSpeaking && finalTranscriptRef.current) {
            console.log("Silence detected, sending transcript to backend:", finalTranscriptRef.current);
            fetchChatResponse(finalTranscriptRef.current);
          }
        }, 1500);
      } else {
        console.log("Ignoring transcript:", { finalTranscript, interimTranscript, isListening: isListeningRef.current, isSpeaking, isProcessing: isProcessingRef.current });
        setTranscript(interimTranscript);
        if (interimTranscript) {
          setShowCaptions(true);
          resetCaptionTimeout();
        }
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        if (ignoredTranscriptCountRef.current >= 3) {
          const errorMsg = "I didn’t understand, please try again.";
          setErrorMessage(errorMsg);
          speakText(errorMsg);
          setShowCaptions(true);
          resetCaptionTimeout();
          ignoredTranscriptCountRef.current = 0;
        }
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setTranscript("");
      finalTranscriptRef.current = "";
      setShowCaptions(true);
      resetCaptionTimeout();
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      let errorMsg = "";
      if (event.error === "network") {
        errorMsg = "Network error. Please check your connection and try again.";
      } else if (event.error === "aborted") {
        errorMsg = "Speech recognition was interrupted. Please try again.";
      } else if (event.error === "no-speech") {
        errorMsg = "No speech detected. Please speak again.";
      } else {
        errorMsg = `Speech recognition error: ${event.error}. Please try again.`;
      }
      setErrorMessage(errorMsg);
      speakText(errorMsg);
      stopRecognition();
      if (isListeningRef.current && !isSpeaking && !isProcessingRef.current) {
        console.log("Scheduling SpeechRecognition restart after error");
        setTimeout(() => {
          if (isListeningRef.current && !recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
            startRecognition();
          }
        }, 2000);
      }
    };

    recognitionRef.current.onend = () => {
      console.log("SpeechRecognition ended, isListening:", isListeningRef.current, "isSpeaking:", isSpeaking, "isProcessing:", isProcessingRef.current);
      if (isListeningRef.current && !isSpeaking && !isProcessingRef.current) {
        console.log("Scheduling SpeechRecognition restart");
        setTimeout(() => {
          if (isListeningRef.current && !recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
            startRecognition();
          }
        }, 2000);
      }
    };

    console.log("Starting SpeechRecognition");
    recognitionRef.current.start();
  };

  // Reset caption timeout
  const resetCaptionTimeout = () => {
    if (captionTimeoutRef.current) {
      clearTimeout(captionTimeoutRef.current);
    }
    captionTimeoutRef.current = setTimeout(() => {
      setShowCaptions(false);
    }, 5000);
  };

  // Fetch chat response with retry
  const fetchChatResponse = (prompt) => {
    console.log("fetchChatResponse called with prompt:", prompt);
    if (!isValidTranscript(prompt) || isProcessingRef.current || isSpeaking) {
      console.log("fetchChatResponse skipped: invalid prompt, processing, or speaking");
      return;
    }
    isProcessingRef.current = true;
    setResponseText("");
    setErrorMessage("");
    window.speechSynthesis.cancel();
    utteranceQueueRef.current = [];
    sentenceBufferRef.current = "";
    responseBufferRef.current = "";
    stopRecognition();

    const maxRetries = 3;
    let attempt = 0;

    const tryFetch = async () => {
      try {
        let hasValidResponse = false;
        let timeoutId = null;
        // Check for greeting locally
        const greeting = checkGreetingFuzzy(prompt);
        if (greeting) {
          console.log("Local greeting detected:", greeting);
          hasValidResponse = true;
          responseBufferRef.current = greeting;
          setResponseText(cleanText(greeting).replace(/deepseek/gi, "Reva").trim());
          setShowCaptions(true);
          resetCaptionTimeout();

          const sentences = greeting.split(/(?<=[.!?])\s+/);
          sentences.forEach((sentence) => {
            const trimmedSentence = sentence.trim();
            if (trimmedSentence) {
              console.log("Queueing sentence for speech:", trimmedSentence);
              utteranceQueueRef.current.push(trimmedSentence);
            }
          });
          speakNextInQueue();

          if (handleNewChatMessage && finalTranscriptRef.current) {
            const cleanedResponse = cleanText(greeting).replace(/deepseek/gi, "Reva").trim();
            console.log("Saving to chat history:", { query: finalTranscriptRef.current, response: cleanedResponse });
            handleNewChatMessage({
              id: new Date().toISOString(),
              title: finalTranscriptRef.current.slice(0, 50),
              query: finalTranscriptRef.current,
              response: [{ type: "text", content: cleanedResponse }],
            });
          }

          isProcessingRef.current = false;
          finalTranscriptRef.current = "";
          setTranscript("");
          sentenceBufferRef.current = "";
          responseBufferRef.current = "";
          apiRetryCountRef.current = 0;
          if (isListeningRef.current && !isSpeaking) {
            console.log("Scheduling SpeechRecognition restart after local greeting");
            setTimeout(() => {
              if (isListeningRef.current && !recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
                startRecognition();
              }
            }, 2000);
          }
          return;
        }

        // Non-greeting: Stream from backend
        await handleUserQuery(
          prompt,
          (chunk) => {
            console.log("Received chunk:", chunk);
            if (chunk === "[DONE]") return;
            const cleanedChunk = cleanText(chunk);
            const revaChunk = cleanedChunk.replace(/deepseek/gi, "Reva");
            if (revaChunk.trim()) {
              hasValidResponse = true;
              responseBufferRef.current += " " + revaChunk;
              setResponseText(cleanText(responseBufferRef.current).replace(/deepseek/gi, "Reva").trim());
              setShowCaptions(true);
              resetCaptionTimeout();
              console.log("Updated responseText:", responseBufferRef.current);

              sentenceBufferRef.current += revaChunk + " ";
              const sentences = sentenceBufferRef.current.split(/(?<=[.!?])\s+/);
              if (sentences.length > 1) {
                const completeSentences = sentences.slice(0, -1);
                completeSentences.forEach((sentence) => {
                  const trimmedSentence = sentence.trim();
                  if (trimmedSentence) {
                    console.log("Queueing sentence for speech:", trimmedSentence);
                    utteranceQueueRef.current.push(trimmedSentence);
                  }
                });
                sentenceBufferRef.current = sentences[sentences.length - 1]?.trim() || "";
                speakNextInQueue();
              }
            }
          },
          () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (sentenceBufferRef.current.trim()) {
              console.log("Queueing final buffered sentence:", sentenceBufferRef.current);
              utteranceQueueRef.current.push(sentenceBufferRef.current.trim());
              speakNextInQueue();
            }
            if (handleNewChatMessage && finalTranscriptRef.current && responseBufferRef.current && hasValidResponse) {
              const cleanedResponse = cleanText(responseBufferRef.current).replace(/deepseek/gi, "Reva").trim();
              console.log("Saving to chat history:", { query: finalTranscriptRef.current, response: cleanedResponse });
              handleNewChatMessage({
                id: new Date().toISOString(),
                title: finalTranscriptRef.current.slice(0, 50),
                query: finalTranscriptRef.current,
                response: [{ type: "text", content: cleanedResponse }],
              });
            }
            isProcessingRef.current = false;
            finalTranscriptRef.current = "";
            setTranscript("");
            sentenceBufferRef.current = "";
            responseBufferRef.current = "";
            evtSourceRef.current = null;
            apiRetryCountRef.current = 0;
            if (isListeningRef.current && !isSpeaking) {
              console.log("Scheduling SpeechRecognition restart after stream completion");
              setTimeout(() => {
                if (isListeningRef.current && !recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
                  startRecognition();
                }
              }, 2000);
            }
          },
          (error) => {
            if (timeoutId) clearTimeout(timeoutId);
            console.error("handleUserQuery error:", error);
            if (attempt < maxRetries - 1) {
              attempt += 1;
              apiRetryCountRef.current = attempt;
              console.log(`Retrying API call, attempt ${attempt + 1}/${maxRetries}`);
              setTimeout(tryFetch, 1000 * attempt);
              return;
            }
            let errorMsg = "Error fetching response from API. Please try again.";
            if (error.message?.includes("429")) {
              errorMsg = "API rate limit exceeded. Please wait and try again.";
            } else if (error.message?.includes("network") || error.message?.includes("timeout")) {
              errorMsg = "Network error during API call. Please check your connection.";
            }
            errorMsg = errorMsg.replace(/deepseek/gi, "Reva");
            setErrorMessage(errorMsg);
            setResponseText(hasValidResponse ? responseBufferRef.current.trim() : errorMsg);
            setShowCaptions(true);
            resetCaptionTimeout();
            utteranceQueueRef.current.push(errorMsg);
            speakNextInQueue();
            isProcessingRef.current = false;
            finalTranscriptRef.current = "";
            sentenceBufferRef.current = "";
            responseBufferRef.current = "";
            evtSourceRef.current = null;
            apiRetryCountRef.current = 0;
            if (isListeningRef.current && !isSpeaking) {
              console.log("Scheduling SpeechRecognition restart after stream error");
              setTimeout(() => {
                if (isListeningRef.current && !recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
                  startRecognition();
                }
              }, 2000);
            }
          },
          chatId
        );

        timeoutId = setTimeout(() => {
          if (evtSourceRef.current) {
            evtSourceRef.current.close();
            evtSourceRef.current = null;
          }
          if (attempt < maxRetries - 1) {
            attempt += 1;
            apiRetryCountRef.current = attempt;
            console.log(`Retrying API call after timeout, attempt ${attempt + 1}/${maxRetries}`);
            setTimeout(tryFetch, 1000 * attempt);
            return;
          }
          const errorMsg = "API request timed out. Please try again.";
          setErrorMessage(errorMsg);
          setResponseText(responseBufferRef.current ? cleanText(responseBufferRef.current).replace(/deepseek/gi, "Reva").trim() : errorMsg);
          setShowCaptions(true);
          resetCaptionTimeout();
          utteranceQueueRef.current.push(errorMsg);
          speakNextInQueue();
          isProcessingRef.current = false;
          finalTranscriptRef.current = "";
          sentenceBufferRef.current = "";
          responseBufferRef.current = "";
          apiRetryCountRef.current = 0;
          if (isListeningRef.current && !isSpeaking) {
            console.log("Scheduling SpeechRecognition restart after timeout");
            setTimeout(() => {
              if (isListeningRef.current && !recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
                startRecognition();
              }
            }, 2000);
          }
        }, 15000);
      } catch (error) {
        console.error("Error in fetchChatResponse:", error);
        if (attempt < maxRetries - 1) {
          attempt += 1;
          apiRetryCountRef.current = attempt;
          console.log(`Retrying API call after catch, attempt ${attempt + 1}/${maxRetries}`);
          setTimeout(tryFetch, 1000 * attempt);
          return;
        }
        let errorMsg = "Error fetching response from API. Please try again.";
        if (error.message?.includes("429")) {
          errorMsg = "API rate limit exceeded. Please wait and try again.";
        } else if (error.message?.includes("timeout")) {
          errorMsg = "API request timed out. Please try again.";
        } else if (error.message?.includes("network")) {
          errorMsg = "Network error during API call. Please check your connection.";
        }
        errorMsg = errorMsg.replace(/deepseek/gi, "Reva");
        setResponseText(responseBufferRef.current ? cleanText(responseBufferRef.current).replace(/deepseek/gi, "Reva").trim() : errorMsg);
        setErrorMessage(errorMsg);
        setShowCaptions(true);
        resetCaptionTimeout();
        utteranceQueueRef.current.push(errorMsg);
        speakNextInQueue();
        isProcessingRef.current = false;
        finalTranscriptRef.current = "";
        sentenceBufferRef.current = "";
        responseBufferRef.current = "";
        evtSourceRef.current = null;
        apiRetryCountRef.current = 0;
        if (isListeningRef.current && !isSpeaking) {
          console.log("Scheduling SpeechRecognition restart after catch error");
          setTimeout(() => {
            if (isListeningRef.current && !recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
              startRecognition();
            }
          }, 2000);
        }
      }
    };

    tryFetch();
  };

  // Speak next utterance in queue
  const speakNextInQueue = () => {
    if (isSpeaking || utteranceQueueRef.current.length === 0) return;
    const text = utteranceQueueRef.current.shift();
    if (!text) return;
    const revaText = text.replace(/deepseek/gi, "Reva");
    console.log("Speaking text:", revaText);
    lastSpokenTextRef.current = revaText;
    setIsSpeaking(true);
    stopRecognition();
    window.speechSynthesis.cancel();
    utteranceRef.current = new SpeechSynthesisUtterance(revaText);
    utteranceRef.current.lang = "en-US";

    const voices = window.speechSynthesis.getVoices();
    const clearVoice = voices.find((voice) => voice.lang === "en-US" && (voice.name.includes("Google") || voice.name.includes("Microsoft") || voice.name.includes("Samantha")));
    if (clearVoice) {
      utteranceRef.current.voice = clearVoice;
    }

    utteranceRef.current.rate = 0.9;
    utteranceRef.current.pitch = 1.0;
    utteranceRef.current.volume = 1.0;

    utteranceRef.current.onend = () => {
      setIsSpeaking(false);
      lastSpokenTextRef.current = "";
      console.log("Speech ended");
      if (utteranceQueueRef.current.length > 0) {
        setTimeout(speakNextInQueue, 750);
      } else if (isListeningRef.current && !isProcessingRef.current) {
        console.log("Scheduling SpeechRecognition restart after speech");
        setTimeout(() => {
          if (isListeningRef.current && !recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
            startRecognition();
          }
        }, 2000);
      }
    };

    utteranceRef.current.onerror = (event) => {
      console.error("SpeechSynthesis error:", event.error);
      setIsSpeaking(false);
      lastSpokenTextRef.current = "";
      if (event.error !== "interrupted") {
        const errorMsg = `Speech synthesis error: ${event.error}. Please try again.`;
        setErrorMessage(errorMsg);
        setShowCaptions(true);
        resetCaptionTimeout();
        utteranceQueueRef.current.push(errorMsg);
      }
      if (utteranceQueueRef.current.length > 0) {
        setTimeout(speakNextInQueue, 750);
      } else if (isListeningRef.current && !isProcessingRef.current) {
        console.log("Scheduling SpeechRecognition restart after speech error");
        setTimeout(() => {
          if (isListeningRef.current && !recognitionRef.current && !isSpeaking && !isProcessingRef.current) {
            startRecognition();
          }
        }, 2000);
      }
    };

    window.speechSynthesis.speak(utteranceRef.current);
  };

  // Speak text (add to queue)
  const speakText = (text) => {
    if (!text) return;
    utteranceQueueRef.current.push(text);
    speakNextInQueue();
  };

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      console.log("Pausing conversation");
      setIsListening(false);
      isListeningRef.current = false;
      stopRecognition();
      if (evtSourceRef.current) {
        evtSourceRef.current.close();
        evtSourceRef.current = null;
      }
      window.speechSynthesis.cancel();
      utteranceQueueRef.current = [];
      setTranscript("");
      setResponseText("");
      setErrorMessage("");
      setShowCaptions(false);
      finalTranscriptRef.current = "";
      isProcessingRef.current = false;
      sentenceBufferRef.current = "";
      responseBufferRef.current = "";
      hasGreetedRef.current = false;
      lastSpokenTextRef.current = "";
      ignoredTranscriptCountRef.current = 0;
      apiRetryCountRef.current = 0;
      if (captionTimeoutRef.current) {
        clearTimeout(captionTimeoutRef.current);
      }
    } else {
      console.log("Starting conversation");
      setIsListening(true);
      isListeningRef.current = true;
      setTranscript("");
      setResponseText("");
      setErrorMessage("");
      setShowCaptions(false);
      finalTranscriptRef.current = "";
      isProcessingRef.current = false;
      sentenceBufferRef.current = "";
      responseBufferRef.current = "";
      lastSpokenTextRef.current = "";
      ignoredTranscriptCountRef.current = 0;
      apiRetryCountRef.current = 0;
      utteranceQueueRef.current = [];
      if (!hasGreetedRef.current) {
        speakText("Hi there, how may I help you today?");
        hasGreetedRef.current = true;
      } else {
        startRecognition();
      }
    }
  };

  // Close captions
  const closeCaptions = () => {
    setShowCaptions(false);
    if (captionTimeoutRef.current) {
      clearTimeout(captionTimeoutRef.current);
    }
  };

  // Retry after error
  const handleRetry = () => {
    console.log("Retrying after error");
    setErrorMessage("");
    setIsListening(true);
    isListeningRef.current = true;
    setTranscript("");
    setShowCaptions(false);
    finalTranscriptRef.current = "";
    if (evtSourceRef.current) {
      evtSourceRef.current.close();
      evtSourceRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    if (captionTimeoutRef.current) {
      clearTimeout(captionTimeoutRef.current);
    }
    lastSpokenTextRef.current = "";
    ignoredTranscriptCountRef.current = 0;
    apiRetryCountRef.current = 0;
    utteranceQueueRef.current = [];
    speakText("Hi there, how may I help you today?");
    hasGreetedRef.current = true;
  };

  // Initialize voices and cleanup
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      console.log("Cleaning up on component unmount");
      window.speechSynthesis.cancel();
      stopRecognition();
      if (evtSourceRef.current) {
        evtSourceRef.current.close();
        evtSourceRef.current = null;
      }
      if (captionTimeoutRef.current) {
        clearTimeout(captionTimeoutRef.current);
      }
      utteranceQueueRef.current = [];
      apiRetryCountRef.current = 0;
    };
  }, []);

  // Sync isListeningRef
  useEffect(() => {
    isListeningRef.current = isListening;
    console.log("Updated isListeningRef:", isListeningRef.current);
    if (!isListening) {
      stopRecognition();
      window.speechSynthesis.cancel();
      utteranceQueueRef.current = [];
      lastSpokenTextRef.current = "";
      ignoredTranscriptCountRef.current = 0;
      apiRetryCountRef.current = 0;
    }
  }, [isListening]);

  // Canvas animation (unchanged)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let shootingStars = [];
    const totalStars = 100;
    const maxShootingStars = 2;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    class Star {
      constructor() {
        this.reset();
      }
      reset() {
        this.z = Math.random();
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = this.z * 2 + 0.5;
        this.speed = this.z * 0.3 + 0.01;
        this.alpha = Math.random() * 0.5 + 0.5;
        this.deltaAlpha = Math.random() * 0.02 - 0.01;
        this.dx = (Math.random() - 0.5) * this.speed;
        this.dy = (Math.random() - 0.5) * this.speed;
      }
      move() {
        this.x += this.dx;
        this.y += this.dy;
        this.alpha += this.deltaAlpha;
        if (this.alpha <= 0.3 || this.alpha >= 1) this.deltaAlpha *= -1;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
        ctx.fill();
      }
    }

    class ShootingStar {
      constructor() {
        this.reset();
      }
      reset() {
        this.z = Math.random() * 0.8 + 0.2;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        this.len = Math.random() * 150 + 50;
        this.speed = (Math.random() * 6 + 4) * this.z;
        this.angle = Math.random() * Math.PI / 4 + Math.PI / 6;
        this.alpha = Math.random() * 0.5 + 0.5;
      }
      move() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        if (this.y > canvas.height || this.x > canvas.width || this.x < 0) {
          this.reset();
        }
      }
      draw() {
        const grad = ctx.createLinearGradient(
          this.x,
          this.y,
          this.x - Math.cos(this.angle) * this.len,
          this.y - Math.sin(this.angle) * this.len
        );
        grad.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2 * this.z;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x - Math.cos(this.angle) * this.len,
          this.y - Math.sin(this.angle) * this.len
        );
        ctx.stroke();
      }
    }

    function init() {
      stars = [];
      for (let i = 0; i < totalStars; i++) {
        stars.push(new Star());
      }
      shootingStars = [];
      for (let i = 0; i < maxShootingStars; i++) {
        shootingStars.push(new ShootingStar());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.move();
        star.draw();
      });
      if (Math.random() < 0.007) {
        shootingStars.push(new ShootingStar());
        if (shootingStars.length > maxShootingStars) shootingStars.shift();
      }
      shootingStars.forEach((s) => {
        s.move();
        s.draw();
      });
      requestAnimationFrame(animate);
    }

    init();
    animate();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="voice-overlay fixed inset-0 z-[99999]">
      <div className="app-container">
        <canvas ref={canvasRef}></canvas>
        <div className="poster-text">Reva AI</div>
        <div className={`voice-container ${isListening ? "listening" : ""} ${isSpeaking ? "speaking" : ""}`} id="voiceUI">
          <div className="voice-text" id="voiceText">
            {showCaptions && (
              <div className="relative bg-black bg-opacity-50 rounded-lg p-4 mb-4 max-w-md mx-auto">
                <button
                  onClick={closeCaptions}
                  className="absolute top-2 right-2 text-white hover:text-gray-300"
                >
                  <FaTimes size={16} />
                </button>
                <div className="text-center">
                  {isListening ? "Listening..." : isSpeaking ? "Speaking..." : isProcessingRef.current ? "Processing..." : "Tap to Speak"}
                  {transcript && (
                    <div className="mt-2 text-sm text-gray-400">
                      You said: {transcript}
                    </div>
                  )}
                  {responseText && (
                    <div className="mt-2 text-sm text-gray-400">
                      Response: {responseText}
                    </div>
                  )}
                  {errorMessage && (
                    <div className="mt-2 text-center">
                      <div className="text-sm text-red-400">{errorMessage}</div>
                      <button
                        onClick={handleRetry}
                        className="mt-2 flex items-center justify-center mx-auto px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all"
                      >
                        <FaRedo className="text-sm mr-2" />
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {!showCaptions && (isListening ? "Listening..." : isSpeaking ? "Speaking..." : isProcessingRef.current ? "Processing..." : "Tap to Speak")}
          </div>
          <div className="voice-orb" id="voiceOrb" onClick={toggleListening}></div>
        </div>
        <div className="controls border rounded-xl border-blue flex justify-center gap-6 absolute bottom-6 left-1/2 transform -translate-x-1/2 text-2xl text-white">
          <button
            onClick={toggleListening}
            className="hover:scale-110 transition-transform duration-200"
          >
            {isListening ? (
              <FaPause className="text-green-400 hover:text-green-500" />
            ) : (
              <FaPlay className="text-blue-400 hover:text-blue-500" />
            )}
          </button>
          <button
            onClick={() => {
              setShowVoiceInteraction(false);
              stopRecognition();
              if (evtSourceRef.current) {
                evtSourceRef.current.close();
                evtSourceRef.current = null;
              }
              window.speechSynthesis.cancel();
              utteranceQueueRef.current = [];
              setIsListening(false);
              isListeningRef.current = false;
              setTranscript("");
              setResponseText("");
              setErrorMessage("");
              setShowCaptions(false);
              finalTranscriptRef.current = "";
              isProcessingRef.current = false;
              sentenceBufferRef.current = "";
              responseBufferRef.current = "";
              hasGreetedRef.current = false;
              lastSpokenTextRef.current = "";
              ignoredTranscriptCountRef.current = 0;
              apiRetryCountRef.current = 0;
              if (captionTimeoutRef.current) {
                clearTimeout(captionTimeoutRef.current);
              }
            }}
            className="hover:scale-110 transition-transform duration-200"
          >
            <FaTimes className="text-red-400 hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Voice;