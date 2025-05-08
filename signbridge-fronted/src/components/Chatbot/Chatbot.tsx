import { useEffect, useState, useRef } from "react";
import styles from "./Chatbot.module.css";
import Groq from "groq-sdk";
import * as Popover from "@radix-ui/react-popover";
import { IoChatbubbleEllipses, IoSend } from "react-icons/io5";
import { RiRobot2Fill } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

const CHATBOT_API_KEY = import.meta.env.VITE_AI_CHATBOT_API_KEY;

// Initialize Groq SDK
const groq = new Groq({
  apiKey: CHATBOT_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Fetch the chatbot response
const getGroqResponse = async (input: string) => {
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: input }],
    model: "llama-3.1-70b-versatile",
  });
  return completion.choices[0]?.message?.content || "";
};

export default function Chatbot() {
  const [inputData, setInputData] = useState("");
  const [userInput, setUserInput] = useState("");
  interface Message {
    role: "user" | "bot";
    content: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Load messages from sessionStorage when the component mounts
  useEffect(() => {
    const savedMessages = sessionStorage.getItem("chatbotMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("chatbotMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Fetch input.txt content using useEffect
  useEffect(() => {
    fetch("/input.txt")
      .then((res) => res.text())
      .then((data) => {
        setInputData(data);
      })
      .catch((err) => console.error("Error loading input.txt:", err));
  }, []);

  // Add greeting when the chat opens and no messages exist
  useEffect(() => {
    if (isChatbotOpen && messages.length === 0) {
      setMessages([
        { role: "bot", content: "Hello! How can I assist you today?" },
      ]);
    }
  }, [isChatbotOpen]);

  // Prepare the question for the chatbot
  const question = `
        Here is the user input: ${userInput}

        Below is the data for you to answer the user's question:
        ${inputData}

        Your response must follow the format below and do not say anything else:
        {The answer to the user's question}
    `;

  // Handle the chatbot response
  const handleMessage = async () => {
    if (userInput.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: userInput },
      ]);
      setUserInput("");

      const response = await getGroqResponse(question);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "bot", content: response },
      ]);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleMessage();
    }
  };

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
    // clear input field when open the chatbot
    if (!isChatbotOpen) {
      setUserInput("");
    }
    setTimeout(() => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div>
      <Popover.Root open={isChatbotOpen} onOpenChange={toggleChatbot}>
        <Popover.Trigger asChild>
          <motion.div
            className={styles.circleChatbot}
            onClick={toggleChatbot}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isChatbotOpen ? (
              <IoIosArrowDown size={25} />
            ) : (
              <IoChatbubbleEllipses size={25} />
            )}
          </motion.div>
        </Popover.Trigger>

        <Popover.Content className={styles.PopoverContent}>
          <AnimatePresence>
            {isChatbotOpen && (
              <motion.div
                className={styles.chatContainer}
                key="chat-popover"
                initial={{ opacity: 0, originX: 1, originY: 1 }}
                animate={{
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    duration: 0.9,
                  },
                }}
                exit={{
                  opacity: 0,
                  originX: 1,
                  originY: 1,
                  transition: { duration: 0.2 },
                }}
                style={{
                  position: "relative",
                }}
                layout
              >
                {/* Name Bar */}
                <div className={styles.headerBar}>
                  <h4 className={styles.botName}>Sign Bot</h4>
                </div>

                <div
                  className={styles.response}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`${styles.messageContainer} ${
                        msg.role === "user"
                          ? styles.userMessage
                          : styles.botMessage
                      }`}
                    >
                      {msg.role === "bot" && (
                        <div className={styles.botIconContainer}>
                          <RiRobot2Fill className={styles.botIcon} />
                        </div>
                      )}
                      <div className={styles.side}>
                        <p className={styles.role}>
                          {msg.role === "user" ? "You " : "Bot "}
                        </p>
                        <div className={styles.messageContent}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
                <div className={styles.inputContainer}>
                  <input
                    className={styles.chatbot_input}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Message..."
                  />
                  <button
                    className={styles.sendBtn}
                    onClick={handleMessage}
                    disabled={!userInput.trim()}
                  >
                    <IoSend />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}
