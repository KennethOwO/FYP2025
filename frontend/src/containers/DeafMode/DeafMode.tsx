import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import style from "./DeafMode.module.css";
import axios from 'axios';

// Speech recognition interface for TypeScript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

// Type declarations for the web speech API
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor | undefined;
    webkitSpeechRecognition: SpeechRecognitionConstructor | undefined;
  }
}

// Define phrase type for phrases
interface Phrase {
  id: string;
  en: string;
  bm: string;
  isDefault?: boolean;
}

// Message type for conversation history
interface Message {
  id: string;
  originalText: string;
  translatedText: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
  showTranslated: boolean;
}

const DeafMode = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  // States
  const [activeTab, setActiveTab] = useState<'default' | 'twoway' | 'history'>('default');
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textToSpeak, setTextToSpeak] = useState("");
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  // States for security and browser support
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  // States for phrases
  const [defaultPhrases, setDefaultPhrases] = useState<Phrase[]>([]);
  const [customPhrases, setCustomPhrases] = useState<Phrase[]>([]);
  const [newPhraseEn, setNewPhraseEn] = useState("");
  const [newPhraseBm, setNewPhraseBm] = useState("");
  const [isAddingPhrase, setIsAddingPhrase] = useState(false);
  const [isRestoringDefaults, setIsRestoringDefaults] = useState(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initial default phrases
  const initialDefaultPhrases: Phrase[] = [
    { id: "default-1", en: "Excuse me, I am deaf. Can you please write down what you're saying?", bm: "Maaf, saya pekak. Boleh tuliskan apa yang anda katakan?", isDefault: true },
    { id: "default-2", en: "Can you please speak slower?", bm: "Boleh anda bercakap lebih perlahan?", isDefault: true },
    { id: "default-3", en: "I didn't understand. Can you repeat that?", bm: "Saya tidak faham. Boleh ulang?", isDefault: true },
    { id: "default-4", en: "Thank you for your patience.", bm: "Terima kasih atas kesabaran anda.", isDefault: true },
    { id: "default-5", en: "Do you know sign language?", bm: "Adakah anda tahu bahasa isyarat?", isDefault: true },
    { id: "default-6", en: "Can you help me please?", bm: "Boleh anda tolong saya?", isDefault: true },
    { id: "default-7", en: "I need assistance.", bm: "Saya memerlukan bantuan.", isDefault: true },
    { id: "default-8", en: "Please write it down or type it.", bm: "Sila tuliskan atau taipkan.", isDefault: true },
    { id: "default-9", en: "I am cold.", bm: "Saya sangat sejuk.", isDefault: true },
    { id: "default-10", en: "I am hungry.", bm: "Saya lapar.", isDefault: true },
    { id: "default-11", en: "Where is the bathroom?", bm: "Di manakah tandas?", isDefault: true },
    { id: "default-12", en: "Call for help, please.", bm: "Tolong panggil bantuan.", isDefault: true },
  ];

  // Check for secure context and speech recognition support
  useEffect(() => {
    // Check if we're in a secure context
    if (window.isSecureContext === false) {
      setIsSecureContext(false);
      console.warn('Running in non-secure context. Speech recognition requires HTTPS.');
    }

    // Check for browser support of SpeechRecognition
    const isSpeechRecognitionSupported = () => {
      return 'SpeechRecognition' in window ||
        'webkitSpeechRecognition' in window ||
        'mozSpeechRecognition' in window ||
        'msSpeechRecognition' in window;
    };

    if (!isSpeechRecognitionSupported()) {
      console.warn('Speech recognition is not supported in this browser.');
      setIsSpeechSupported(false);
    }
  }, []);

  // Ensure voices are loaded
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices when available
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log("Available voices loaded:", voices.length);
      };

      // Check if voices are already available
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        // Wait for voices to be loaded
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Load phrases and conversation history from localStorage on component mount
  useEffect(() => {
    // Load default phrases
    const savedDefaultPhrases = localStorage.getItem('defaultPhrases');
    if (savedDefaultPhrases) {
      try {
        setDefaultPhrases(JSON.parse(savedDefaultPhrases));
      } catch (error) {
        console.error('Failed to parse saved default phrases:', error);
        setDefaultPhrases(initialDefaultPhrases);
      }
    } else {
      setDefaultPhrases(initialDefaultPhrases);
    }

    // Load custom phrases
    const savedCustomPhrases = localStorage.getItem('customPhrases');
    if (savedCustomPhrases) {
      try {
        setCustomPhrases(JSON.parse(savedCustomPhrases));
      } catch (error) {
        console.error('Failed to parse saved custom phrases:', error);
      }
    }

    // Load conversation history
    const savedHistory = localStorage.getItem('conversationHistory');
    if (savedHistory) {
      try {
        setConversationHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse saved history:', error);
      }
    }
  }, []);

  // Save phrases to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('defaultPhrases', JSON.stringify(defaultPhrases));
  }, [defaultPhrases]);

  useEffect(() => {
    localStorage.setItem('customPhrases', JSON.stringify(customPhrases));
  }, [customPhrases]);

  // Save conversation history to localStorage
  useEffect(() => {
    localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
  }, [conversationHistory]);

  // Improved language detection function
  const detectLanguage = (text: string): 'en' | 'bm' => {
    if (!text) return lang === 'en' ? 'en' : 'bm'; // Default to UI language if no text

    // Common Malay words/patterns
    const malayWords = ['saya', 'anda', 'boleh', 'tidak', 'terima', 'kasih', 'maaf', 'selamat', 'pagi', 'petang', 'malam', 'apa', 'kenapa', 'siapa', 'di', 'ke', 'dari', 'untuk', 'dengan', 'dan', 'atau', 'tetapi'];

    // Count Malay words in the text
    const lowercaseText = text.toLowerCase();
    const words = lowercaseText.split(/\s+/);
    const malayWordCount = words.filter(word => malayWords.includes(word)).length;

    // Presence of certain characters can indicate Malay
    const hasSpecialMalayChars = /[ñŋáéíóúÁÉÍÓÚ]/.test(text);

    // Percentage of Malay words in the text
    const malayPercent = words.length > 0 ? (malayWordCount / words.length) * 100 : 0;

    // If text has multiple Malay words or special characters, consider it Malay
    if (malayWordCount >= 2 || hasSpecialMalayChars || malayPercent > 15) {
      return 'bm';
    }

    // Default to English
    return 'en';
  };

  // Function to directly translate text using Google Translate API
  const translateText = async (text: string, sourceLang: string, targetLang: string) => {
    try {
      setIsTranslating(true);

      // Make sure we're using the correct language codes for Google Translate API
      const source = sourceLang === 'en' ? 'en' : 'ms';
      const target = targetLang === 'en' ? 'en' : 'ms';

      const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
      const apiUrl = import.meta.env.VITE_GOOGLE_TRANSLATION_API_URL;

      if (!apiKey || !apiUrl) {
        throw new Error('Translation configuration missing');
      }

      // Make sure we have text to translate
      if (!text || text.trim() === '') {
        throw new Error('No text to translate');
      }

      const response = await axios.post(`${apiUrl}?key=${apiKey}`, {
        q: text,
        source: source,
        target: target,
        format: 'text'
      });

      if (!response.data?.data?.translations?.[0]?.translatedText) {
        throw new Error('Invalid translation response');
      }

      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    } finally {
      setIsTranslating(false);
    }
  };

  // Request microphone permission explicitly
  const requestMicrophonePermission = async () => {
    try {
      if (!isSecureContext) {
        console.error('Cannot request microphone permission in non-secure context');
        return false;
      }

      // This will trigger the browser's permission prompt
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasRequestedPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  };

  // Initialize speech recognition with explicit permission
  const initSpeechRecognition = async () => {
    // Check if already initialized
    if (recognitionRef.current !== null) return;

    // Check for secure context
    if (!isSecureContext) {
      console.error('Speech recognition requires secure context (HTTPS)');
      return;
    }

    // Check for browser support
    if (!isSpeechSupported) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    // Request permission first
    const permissionGranted = await requestMicrophonePermission();
    if (!permissionGranted) {
      console.error('Microphone permission not granted');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        // Set speech recognition language based on UI language
        recognition.lang = lang === 'en' ? 'en-US' : 'ms-MY';

        recognition.onresult = async (event: SpeechRecognitionEvent) => {
          try {
            const currentResult = event.results[event.resultIndex];
            const bestAlternative = currentResult[0]; // Get the top alternative
            const transcript = bestAlternative.transcript;

            // Show the raw transcript immediately
            setTranscript(transcript);

            // Add to conversation history if it's a final result
            if (currentResult.isFinal) {
              const now = new Date();
              const timestamp = now.toLocaleTimeString();

              // Always translate speech to the other language
              try {
                // Detect language of speech
                const detectedLang = detectLanguage(transcript);
                const sourceLang = detectedLang === 'en' ? 'en' : 'bm';
                const targetLang = detectedLang === 'en' ? 'bm' : 'en';

                const translatedText = await translateText(
                  transcript,
                  sourceLang,
                  targetLang
                );

                // Add both original and translated text to history
                const messageId = Date.now().toString();
                setConversationHistory(prev => [
                  ...prev,
                  {
                    id: messageId,
                    originalText: transcript,
                    translatedText: translatedText,
                    timestamp,
                    type: 'incoming',
                    showTranslated: false
                  }
                ]);
              } catch (err) {
                console.error('Failed to translate speech:', err);

                // Add message without translation on failure
                const messageId = Date.now().toString();
                setConversationHistory(prev => [
                  ...prev,
                  {
                    id: messageId,
                    originalText: transcript,
                    translatedText: transcript, // Same as original if translation fails
                    timestamp,
                    type: 'incoming',
                    showTranslated: false
                  }
                ]);
              }
            }
          } catch (error) {
            console.error('Error processing speech recognition result:', error);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            console.error('Microphone permission denied or not available in non-secure context');
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          if (isListening) {
            recognition.start(); // Restart on end
          }
        };

        recognitionRef.current = recognition;
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setIsSpeechSupported(false);
      }
    } else {
      console.error('Speech recognition not supported in this browser');
      setIsSpeechSupported(false);
    }
  };

  // Effect to initialize speech recognition when required
  useEffect(() => {
    if (isListening && recognitionRef.current === null) {
      initSpeechRecognition();
    }
  }, [isListening, lang]);

  // Toggle speech recognition
  const toggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setIsListening(true); // This will trigger initialization if needed

      // Initialize if not already done
      if (recognitionRef.current === null) {
        await initSpeechRecognition();
      }

      // Start listening if initialization successful
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    }
  };

  // Enhanced Speak text function with proper language support for both English and Bahasa Malaysia
  const speakText = async (text: string, forceLang?: 'en' | 'bm') => {
    if ('speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Determine which language to use for speaking
        let speakLang: string;

        if (forceLang) {
          // If language is explicitly specified, use it
          speakLang = forceLang === 'en' ? 'en-US' : 'ms-MY';
        } else {
          // Otherwise detect language based on content
          speakLang = detectLanguage(text) === 'en' ? 'en-US' : 'ms-MY';
        }

        // Configure parameters for speech
        let rate = 1.0;
        let pitch = 1.0;

        // Adjust parameters for Malay to improve pronunciation
        if (speakLang === 'ms-MY') {
          rate = 0.9; // Slower rate for better clarity
          pitch = 1.1; // Slightly higher pitch
        }

        // Create and configure utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speakLang;
        utterance.rate = rate;
        utterance.pitch = pitch;

        // Try to find an appropriate voice
        const voices = window.speechSynthesis.getVoices();

        // Log available voices for debugging
        console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));

        // First look for exact language match voices
        const exactMatch = voices.filter(voice => voice.lang === speakLang);

        // Then look for partial matches (just the language code)
        const languageCode = speakLang.split('-')[0]; // 'en' or 'ms'
        const partialMatch = voices.filter(voice => voice.lang.startsWith(languageCode));

        // Prefer female voices for clarity
        let selectedVoice = null;
        if (exactMatch.length > 0) {
          // Try to find a female voice first among exact matches
          selectedVoice = exactMatch.find(voice => voice.name.toLowerCase().includes('female'));
          // If no female voice, use any voice from exact matches
          if (!selectedVoice && exactMatch.length > 0) selectedVoice = exactMatch[0];
        } else if (partialMatch.length > 0) {
          // Try partial matches
          selectedVoice = partialMatch.find(voice => voice.name.toLowerCase().includes('female')) || partialMatch[0];
        }

        // Use selected voice if found
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        } else {
          console.warn(`No suitable voice found for ${speakLang}, using default`);
        }

        // Add event handler to log when speech has ended
        utterance.onend = () => {
          console.log("Speech finished");
        };

        // Add event handler for errors
        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
        };

        // Speak the text
        speechSynthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);

        // Prepare for history - translate to the other language
        const detectedLang = detectLanguage(text);
        const otherLang = detectedLang === 'en' ? 'bm' : 'en';

        let translatedText;
        try {
          translatedText = await translateText(text, detectedLang, otherLang);
        } catch (error) {
          console.error('Error translating for history:', error);
          translatedText = text; // Fallback to original
        }

        // Add to conversation history
        const now = new Date();
        const timestamp = now.toLocaleTimeString();
        const messageId = Date.now().toString();

        setConversationHistory(prev => [
          ...prev,
          {
            id: messageId,
            originalText: text,
            translatedText: translatedText,
            timestamp,
            type: 'outgoing',
            showTranslated: false
          }
        ]);
      } catch (error) {
        console.error('Error in speakText:', error);
      }
    } else {
      console.error('Speech synthesis not supported in this browser');
    }
  };

  // Handle phrase click from default or custom phrases
  const handlePhraseClick = (phrase: Phrase) => {
    // Get the phrase text in current UI language
    const text = lang === 'en' ? phrase.en : phrase.bm;

    // Use the appropriate language voice
    const phraseLang = lang === 'en' ? 'en' : 'bm';
    speakText(text, phraseLang);
  };

  // Handle form submission for text-to-speech
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textToSpeak.trim()) {
      // Use the detected language for speaking
      const detectedLang = detectLanguage(textToSpeak);
      speakText(textToSpeak, detectedLang === 'en' ? 'en' : 'bm');
      setTextToSpeak("");
    }
  };

  // Add new custom phrase with direct translation
  const addCustomPhrase = async () => {
    try {
      setIsTranslating(true);

      // Ensure at least one language is filled
      if (!newPhraseEn.trim() && !newPhraseBm.trim()) {
        return;
      }

      let finalEn = newPhraseEn.trim();
      let finalBm = newPhraseBm.trim();

      // Translate if one language is missing
      if (finalEn && !finalBm) {
        try {
          finalBm = await translateText(finalEn, 'en', 'bm');
        } catch (error) {
          console.error('Failed to translate to Malay:', error);
          finalBm = "Terjemahan gagal"; // Translation failed
        }
      } else if (!finalEn && finalBm) {
        try {
          finalEn = await translateText(finalBm, 'bm', 'en');
        } catch (error) {
          console.error('Failed to translate to English:', error);
          finalEn = "Translation failed";
        }
      }

      const newPhrase: Phrase = {
        id: `custom-${Date.now()}`,
        en: finalEn,
        bm: finalBm,
        isDefault: false
      };

      setCustomPhrases(prev => [...prev, newPhrase]);
      setNewPhraseEn("");
      setNewPhraseBm("");
      setIsAddingPhrase(false);
    } catch (error) {
      console.error('Error adding custom phrase:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Delete phrase (works for both default and custom phrases)
  const deletePhrase = (phrase: Phrase) => {
    if (phrase.isDefault) {
      setDefaultPhrases(prev => prev.filter(p => p.id !== phrase.id));
    } else {
      setCustomPhrases(prev => prev.filter(p => p.id !== phrase.id));
    }
  };

  // Restore default phrases
  const restoreDefaultPhrases = () => {
    setIsRestoringDefaults(true);
    setDefaultPhrases(initialDefaultPhrases);
    setTimeout(() => setIsRestoringDefaults(false), 1500);
  };

  // Clear conversation history
  const clearHistory = () => {
    setConversationHistory([]);
  };

  // Toggle between original and translated text for a message
  const toggleMessageLanguage = (id: string) => {
    setConversationHistory(prev =>
      prev.map(message =>
        message.id === id
          ? { ...message, showTranslated: !message.showTranslated }
          : message
      )
    );
  };

  // Get the display text for a message based on language preference
  const getMessageDisplayText = (message: Message) => {
    return message.showTranslated
      ? message.translatedText
      : message.originalText;
  };

  // Format conversation history as paragraphs
  const formatConversationHistory = () => {
    if (conversationHistory.length === 0) {
      return <p className={style.emptyHistory}>{t("no_conversation_history")}</p>;
    }

    // Group messages by date
    const groupedByDate = conversationHistory.reduce((groups, message) => {
      const date = message.timestamp.split(',')[0] || 'Today';
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    }, {} as Record<string, Message[]>);

    return Object.entries(groupedByDate).map(([date, messages]) => (
      <div key={date} className={style.historyDay}>
        <h3 className={style.historyDate}>{date}</h3>
        <div className={style.historyParagraph}>
          {messages.map((message) => (
            <span
              key={message.id}
              className={`${style.historyItem} ${style[message.type]}`}
            >
              <span className={style.messageContent}>
                {getMessageDisplayText(message)}
                <button
                  className={style.toggleLanguage}
                  onClick={() => toggleMessageLanguage(message.id)}
                  title={message.showTranslated ? t("show_original") : t("show_translation")}
                >
                  {message.showTranslated ? '🔄' : '🔄'}
                </button>
              </span>
            </span>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className={style.deafModeContainer}>
      <h1 className={style.heading}>
        <span>{t("deaf_mode")}</span>
      </h1>

      <div className={style.tabContainer}>
        <button
          className={`${style.tabButton} ${activeTab === 'default' ? style.active : ''}`}
          onClick={() => setActiveTab('default')}
        >
          {t("default_phrases")}
        </button>
        <button
          className={`${style.tabButton} ${activeTab === 'twoway' ? style.active : ''}`}
          onClick={() => setActiveTab('twoway')}
        >
          {t("two_way_communication")}
        </button>
        <button
          className={`${style.tabButton} ${activeTab === 'history' ? style.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          {t("conversation_history")}
        </button>
      </div>

      <div className={style.tabContent}>
        {/* Default Phrases Tab */}
        {activeTab === 'default' && (
          <motion.div
            className={style.defaultPhrasesContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className={style.tabDescription}>
              {t("default_phrases_description")}
            </p>

            <div className={style.sectionTitle}>
              <h3>{t("default_phrases")}</h3>
              <div className={style.sectionControls}>
                <button
                  className={style.restoreButton}
                  onClick={restoreDefaultPhrases}
                  disabled={isRestoringDefaults}
                >
                  {isRestoringDefaults ? t("restoring") : t("restore_defaults")}
                </button>
              </div>
            </div>

            {defaultPhrases.length > 0 ? (
              <div className={style.phrasesGrid}>
                {defaultPhrases.map((phrase) => (
                  <div key={phrase.id} className={style.phraseContainer}>
                    <button
                      className={style.phraseButton}
                      onClick={() => handlePhraseClick(phrase)}
                    >
                      {lang === 'en' ? phrase.en : phrase.bm}
                    </button>
                    <button
                      className={style.deletePhraseButton}
                      onClick={() => deletePhrase(phrase)}
                      aria-label={t("delete")}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={style.noPhrasesMessage}>
                {t("no_default_phrases")}
              </p>
            )}

            <div className={style.sectionTitle}>
              <h3>{t("custom_phrases")}</h3>
              {!isAddingPhrase && (
                <button
                  className={style.addPhraseButton}
                  onClick={() => setIsAddingPhrase(true)}
                >
                  {t("add_custom_phrase")}
                </button>
              )}
            </div>

            {isAddingPhrase && (
              <div className={style.addPhraseForm}>
                <input
                  type="text"
                  value={newPhraseEn}
                  onChange={(e) => setNewPhraseEn(e.target.value)}
                  placeholder={t("enter_phrase_english")}
                  className={style.phraseInput}
                />
                <input
                  type="text"
                  value={newPhraseBm}
                  onChange={(e) => setNewPhraseBm(e.target.value)}
                  placeholder={t("enter_phrase_malay")}
                  className={style.phraseInput}
                />
                {isTranslating && (
                  <div className={style.translatingIndicator}>
                    {t("translating")}...
                  </div>
                )}
                <div className={style.phraseFormButtons}>
                  <button
                    className={style.savePhraseButton}
                    onClick={addCustomPhrase}
                    disabled={(!newPhraseEn.trim() && !newPhraseBm.trim()) || isTranslating}
                  >
                    {t("save")}
                  </button>
                  <button
                    className={style.cancelButton}
                    onClick={() => {
                      setIsAddingPhrase(false);
                      setNewPhraseEn("");
                      setNewPhraseBm("");
                    }}
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            )}

            {customPhrases.length > 0 ? (
              <div className={style.phrasesGrid}>
                {customPhrases.map((phrase) => (
                  <div key={phrase.id} className={style.phraseContainer}>
                    <button
                      className={style.phraseButton}
                      onClick={() => handlePhraseClick(phrase)}
                    >
                      {lang === 'en' ? phrase.en : phrase.bm}
                    </button>
                    <button
                      className={style.deletePhraseButton}
                      onClick={() => deletePhrase(phrase)}
                      aria-label={t("delete")}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={style.noPhrasesMessage}>
                {t("no_custom_phrases")}
              </p>
            )}
          </motion.div>
        )}

        {/* Two-way Communication Tab */}
        {activeTab === 'twoway' && (
          <motion.div
            className={style.twoWayContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className={style.tabDescription}>
              {t("two_way_communication_description")}
            </p>

            {!isSecureContext && (
              <div className={style.securityWarning}>
                <p>{t("secure_context_required")}</p>
                <p>{t("use_https_instead")}</p>
              </div>
            )}

            <div className={style.speechToTextSection}>
              <h3>{t("speech_to_text")}</h3>

              {!isSecureContext || !isSpeechSupported ? (
                <div className={style.browserWarning}>
                  {!isSecureContext ? (
                    <p>{t("speech_requires_https")}</p>
                  ) : (
                    <p>{t("speech_not_supported")}</p>
                  )}
                  <p>{t("try_another_browser")}</p>
                </div>
              ) : (
                <>
                  <div className={style.transcriptBox}>
                    {isTranslating ? (
                      <div className={style.translatingIndicator}>
                        {t("translating")}...
                      </div>
                    ) : (
                      transcript || t("transcript_placeholder")
                    )}
                  </div>

                  {!hasRequestedPermission ? (
                    <button
                      className={style.permissionButton}
                      onClick={async () => {
                        const granted = await requestMicrophonePermission();
                        if (granted) {
                          toggleListening();
                        }
                      }}
                    >
                      {t("request_mic_permission")}
                    </button>
                  ) : (
                    <button
                      className={`${style.listenButton} ${isListening ? style.listening : ''}`}
                      onClick={toggleListening}
                    >
                      {isListening ? t("stop_listening") : t("start_listening")}
                      <i className={`${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                    </button>
                  )}
                </>
              )}
            </div>

            <div className={style.textToSpeechSection}>
              <h3>{t("text_to_speech")}</h3>
              <form onSubmit={handleSubmit}>
                <textarea
                  value={textToSpeak}
                  onChange={(e) => setTextToSpeak(e.target.value)}
                  placeholder={t("enter_text_to_speak")}
                  className={style.textInput}
                ></textarea>
                <button
                  type="submit"
                  className={style.speakButton}
                  disabled={isTranslating || !textToSpeak.trim()}
                >
                  {t("speak")} <i className="fa-volume-high"></i>
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Conversation History Tab - Displayed as paragraphs */}
        {activeTab === 'history' && (
          <motion.div
            className={style.historyContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className={style.tabDescription}>
              {t("conversation_history_description")}
            </p>

            <div className={style.historyControls}>
              <button onClick={clearHistory} className={style.clearButton}>
                {t("clear_history")}
              </button>
            </div>

            <div className={style.conversationLog}>
              {formatConversationHistory()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DeafMode;