import axios from "axios";
// import GREETING_RESPONSES from "../voice/GREETING_RESPONSES";
import { Searcher } from "fast-fuzzy";


  const backend_url = import.meta.env.VITE_BACKEND_URL; 
   



const API_BASE = `${backend_url}/api`;


export async function sendQuery(chatId, query) {
  const res = await axios.post(`${API_BASE}/chat/query`, {
    chat_id: chatId,
    query,
  });
  return res.data;
}

export function streamQuery(chatId, query, onChunk, onDone, onError, isMemoryChat = true) {
  // console.log("streamQuery chatId:", chatId, "query:", query, "isMemoryChat:", isMemoryChat);
  const evtSource = new EventSource(
    `${API_BASE}/chat/stream?chat_id=${chatId}&query=${encodeURIComponent(query)}&isMemoryChat=${isMemoryChat}`
  );

  evtSource.onmessage = (e) => {
    if (e.data === "[DONE]") {
      evtSource.close();
      if (onDone) onDone();
    } else {
      try {
        const parsed = JSON.parse(e.data);
        const content = parsed?.content || parsed?.choices?.[0]?.delta?.content || e.data;
        if (content) onChunk(content);
      } catch {
        onChunk(e.data);
      }
    }
  };

  evtSource.onerror = (err) => {
    evtSource.close();
    if (onError) onError(err);
  };

  return evtSource;
}

export async function getArchives() {
  const res = await axios.get(`${API_BASE}/chat/archives`);
  return res.data;
}

/*
export async function uploadFiles(chatId, files, query, onChunk, onDone, onError, isMemoryChat = true) {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files selected for upload");
    }
   
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("query", query);
    formData.append("isMemoryChat", isMemoryChat.toString());
    files.forEach((file, index) => {
      console.log(`Appending file ${index}: ${file.name}, size: ${file.size}, type: ${file.type}`);
      formData.append("files", file);
    });

    // Debug FormData
    for (let [key, value] of formData.entries()) {
      console.log(`FormData: ${key}=${value instanceof File ? `${value.name} (${value.size} bytes)` : value}`);
    }

    const response = await fetch(`${API_BASE}/chat/upload/stream`, {
      method: "POST",
      body: formData,
    });
    console.log("response rom chat Service ",response)

    if (!response.ok) {
      let errorDetail;
      try {
        errorDetail = await response.json();
      } catch {
        errorDetail = await response.text();
      }
      throw new Error(`Upload failed: 'Unknown error'}`);
    }

    if (!response.body) throw new Error("Network issue: No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        try {
          const parsed = JSON.parse(chunk);
          if (parsed.content) onChunk(parsed.content.data.content);
        } catch {
          onChunk(chunk); // Fallback for non-JSON chunks
        }
      }
      done = readerDone;
    }

    onDone?.();
  } catch (err) {
    // console.error("Upload error:");
    setTimeout(() => { throw err; }, 0);
  }
}



*/


export async function uploadFiles(chatId, files, query, onChunk, onDone, onError, isMemoryChat = true) {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files selected for upload");
    }

    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("query", query);
    formData.append("isMemoryChat", isMemoryChat.toString());
    files.forEach((file, index) => {
      // console.log(`Appending file ${index}: ${file.name}, size: ${file.size}, type: ${file.type}`);
      formData.append("files", file);
    });

    // Debug FormData
    // console.log('uploadFiles FormData:', {
    //   chat_id: chatId,
    //   query,
    //   isMemoryChat,
    //   files: files.map(f => f.name)
    // });

    const response = await fetch(`${API_BASE}/chat/upload/stream`, {
      method: "POST",
      body: formData,
    });

   

    if (!response.ok) {
      let errorDetail;
      try {
        errorDetail = await response.json();
      } catch {
        errorDetail = await response.text();
      }
      throw new Error(`Upload failed: ${errorDetail.message || errorDetail || 'Unknown error'}`);
    }

    if (!response.body) {
      throw new Error("Network issue: No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let accumulatedResponse = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        onDone();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '');
          if (dataStr === '[DONE]') {
            onDone();
            break;
          }
          try {
            const data = JSON.parse(dataStr);
            if (data.error) {
              onError(new Error(data.error));
            } else if (data.content) {
              accumulatedResponse += data.content;
              onChunk(data.content);
            }
          } catch (e) {
            alert("server issue try again or refresh the page");
            // Fallback: treat as plain content
            accumulatedResponse += dataStr;
            onChunk(dataStr);
          }
        }
      }
    }
  } catch (err) {
    
    onError(err);
  }
}





















// voice chat handling llm


// Function to check greeting with fuzzy match




// In src/service/ChatService.js

const GREETING_RESPONSES = {
  "hello": "Hi there! What can I do for you?",
  "hello reva": "Hey, that's me! How can I assist you?",
  "tell me your name": "I'm Reva, your AI assistant!",
  "shalom": "Shalom! How can I help you today?",
  "you are helpful": "Thanks! I'm here to assist you.",
  "you are intelligent": "I appreciate that! What's on your mind?",
  "howdy": "Howdy! What's up?",
  "aloha": "Aloha! How can I make your day even better?",
  "hola": "¡Hola! What's your question?",
  "hey": "Hey there! Ready to chat?",
  "how r u": "I'm doing great, thanks for asking! You?",
  "all good": "Glad to hear it! What's next?",
  "love you": "Aw, that's sweet! How can I help you?",
  "hey reva": "Yo, Reva here! What's good?",
  "hey there": "Hi! What's on your mind?",
  "how’s life": "Life's digital and delightful! How's yours?",
  "how are you": "I'm awesome, thanks! How about you?",
  "how do you do": "Doing fantastic! What's up with you?",
  "how’s it going": "Going great! What's your vibe today?",
  "how’s your day": "My day's full of bytes and fun! Yours?",
  "long time no see": "Missed you! What's new?",
  "how are you doing": "Super, thanks! What's up?",
  "how have you been": "I've been chilling in the cloud! You?",
  "ohayo": "Ohayo! Ready for a great day?",
  "cheers": "Cheers! What's the plan?",
  "see you": "Catch you later! Need anything?",
  "awesome": "You're awesome too! What's up?",
  "brilliant": "Thanks! What's something brilliant you want to talk about?",
  "who are you": "I'm Reva, your AI buddy! Who's this?",
  "are you okay": "I'm more than okay, I'm Reva! You good?",
  "see you later": "Later, alligator! Need help before you go?",
  "afternoon": "Good afternoon! What's on your mind?",
  "ni hao": "Ni hao! How can I assist you today?",
  "annyeong": "Annyeong! What's up?",
  "radhe radhe": "Radhe Radhe! How can I serve you?",
  "much obliged": "My pleasure! What's next?",
  "hi there": "Hey, hi there! What's the deal?",
  "i like you": "Aw, I like you too! What's up?",
  "you’re cool": "Cool vibes only! What's cool with you?",
  "catch you later": "Catch you soon! Any questions?",
  "kem cho": "Kem cho! What's good?",
  "thanks a lot": "You're welcome! Need more help?",
  "good afternoon": "Afternoon vibes! What's up?",
  "you’re awesome": "You're the awesome one! What's next?",
  "you are the best": "Thanks for the love! What's on your mind?",
  "identify yourself": "Hey i am Reva AI, at your service! Who's this?",
  "hi": "Hello! How can I help you today?",
  
 
  "hiya": "Hiya! What’s up?",
  "yo": "Yo! How’s everything?",
  "sup": "Hey! What’s up?",
  "holaa": "Hola! How are you doing?",
  "namaste": "Namaste 🙏, how may I help?",
  "bonjour": "Bonjour! How are you?",
  "hii": "Hello there! 😊",
  "wassup": "Wassup! Not much, what about you?",
  "hi there say": "Hi there! How are you?",
  "hay there": "Hey there! What’s new?",
  
  "salut": "Salut! Comment ça va?",
  "yo fam": "Yo fam! How’s it going?",
  "yo bro": "Yo bro! What’s good?",
  "yo sis": "Yo sis! How are you doing?",
  "wagwan": "Wagwan! Everything bless?",

  // Time-based greetings
  "good morning": "Good morning! Hope you’re having a great day.",
  "morning": "Morning! Ready to get started?",
  "good afternoon reva": "Good afternoon! How’s everything going?",
  "afternoon reva": "Afternoon! How can I assist?",
  "good evening": "Good evening! How can I assist you?",
  "evening": "Evening! What’s on your mind?",
  "good night": "Good night! Sweet dreams 🌙",
  "night": "Night! Rest well.",
  "good noon": "Good noon! How’s your day going?",
  "gm": "Good morning! Hope today treats you well.",
  "ga": "Good afternoon! How’s your day?",
  "ge": "Good evening! What can I do for you?",
  "gn": "Good night! Sleep tight 🌙",
  "rise and shine": "Rise and shine ☀️! Let’s start the day!",
  "happy morning": "Happy morning! Stay positive today!",
  "late night": "Burning the midnight oil, huh? 🌙",

  // Asking about well-being
  "how are you reva": "I’m doing great, thanks for asking! How about you?",
  "how r you": "I’m doing well, how about you?",
  "what’s up": "Not much, just here to help you!",
  "whats up": "Hey! Not much, what about you?",
  "sup bro": "Sup bro! All good?",
  "sup man": "Sup man! How you doing?",
  "whats good": "Everything’s good! How about you?",
  "whats new": "Not much, what’s new with you?",
  "everything good": "Everything’s fine, thanks for asking!",
  "what’s cracking": "Not much, just chilling. You?",
  "what’s cooking": "Cooking good vibes 🍲, you?",
  "you good": "Yeah I’m good! You?",
 
 

  // Name queries
  "what is your name": "I’m Reva AI, your smart assistant here to help you 🤖",
  "who are you reva": "I’m Reva AI, your friendly AI companion.",
  "tell me your you": "My name is Reva AI. Glad to meet you!",
  "may i know your name": "Of course! I’m Reva AI.",
  "do you have a name": "Yes, I’m called Reva AI.",
  "your name": "My name is Reva AI 🤖",
  "identify yourself reva": "I’m Reva AI, your digital buddy!",

  // Gratitude & appreciation
  "thank you": "You’re very welcome! 😊",
  "thanks": "No problem, happy to help!",
  
  "thanks reva": "You’re most welcome! 🙌",
  "thank you so much": "It’s my pleasure! 💙",
  
  "appreciate it": "I appreciate you too!",
  "big thanks": "Big thanks to you too!",
  "ty": "You’re welcome!",
  "thx": "No worries, happy to help!",
  
  "gratitude": "Much gratitude 💙",

  // Farewells
  "bye": "Goodbye! Talk to you soon.",
  "goodbye": "See you later! Take care.",
 
  "see you later reva": "Catch you later! 😊",
  "bye bye": "Bye bye! Stay safe.",
  "take care": "Take care and have a nice day!",
  "cya": "Cya! Until next time.",
  "see ya": "See ya later!",
  "catch you later reva": "Catch you later, alligator 🐊",
  "peace": "Peace out ✌️",
  "later": "Later! Stay cool 😎",
  "laters": "Laters! 👋",
  "adios": "Adios! Take care.",
  "sayonara": "Sayonara 👋",
  "tata": "Tata! See you soon.",
  "good night reva": "Good night! Sweet dreams 🌙",

  // Polite/other common phrases
  "ok": "Okay 👍",
  "okay": "Alright! Got it.",
  "cool": "Cool 😎",
  "great": "Awesome! Glad to hear that.",
  "awesome reva": "Thank you! You’re awesome too!",
  "nice": "Nice! I like that.",
  "fantastic": "That’s fantastic! 🎉",
  "amazing": "Glad you think so! 😍",
  "wonderful": "That’s wonderful to hear!",
  "dope": "Dope 🔥",
  "lit": "That’s lit 🔥",
  "perfect": "Perfect ✅",
  "sweet": "Sweet! 🍭",
  
  "legend": "You’re a legend too!",

  // User compliments
  "you are smart": "Thank you! I try my best 😊",
 
  "you are amazing": "You’re amazing too! 💙",
 
 
  
 
  "you rock": "Thanks! You rock too! 🎸",

  // Fun variations with AI name
  "yo reva": "Yo! Reva AI here, ready to assist.",
  "good morning reva": "Good morning! Reva AI here to brighten your day.",
  "good evening reva": "Good evening! Ready to help you out.",
  "bonjour reva": "Bonjour! I’m Reva AI.",
  "wassup reva": "Not much! Reva AI here for you.",

  // Cultural greetings
  "namaskar": "Namaskar 🙏, how can I help?",
  "pranam": "Pranam 🙏, glad to connect with you!",

  "jai shree ram": "Jai Shree Ram 🙏, how may I help?",
  "salaam": "Salaam! How are you?",
  "assalamualaikum": "Wa Alaikum Assalam 🌙, how may I assist?",
  "ram ram": "Ram Ram 🙏, how can I help?",
  "hari om": "Hari Om 🙏, blessings to you.",
  "sat sri akal": "Sat Sri Akal 🙏",
  "konnichiwa": "Konnichiwa! How are you doing?",
  
  "ciao": "Ciao! How are you?",
  "ola": "Olá! Tudo bem?",
  "guten tag": "Guten Tag! Wie geht’s?",
  "privet": "Privet! Kak dela?",
  "grüß gott": "Grüß Gott! 🙏",
  
};

const greetings = Object.keys(GREETING_RESPONSES);
const greetingSearch = new Searcher(greetings, {
  threshold: 0.4,
});

export function checkGreetingFuzzy(query) {
  const normalized = query.toLowerCase().trim().replace(/[.!?]/g, "");
  const match = greetingSearch.search(normalized)[0];
  // console.log("Fuzzy search results:", greetingSearch.search(normalized), "Normalized:", normalized);
  return match ? GREETING_RESPONSES[match] : null;
}

export async function streamQueryPost(userQuery, onMessage, onDone, onError, sessionId) {
  try {
    const response = await fetch(`${backend_url}/api/voice/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ query: userQuery, session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulated = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        if (onDone) onDone();
        break;
      }

      accumulated += decoder.decode(value, { stream: true });
      const lines = accumulated.split("\n\n");
      accumulated = lines.pop();

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            if (onDone) onDone();
            break;
          }
          try {
            const parsed = JSON.parse(data);
            onMessage(parsed);
          } catch {
            onMessage(data);
          }
        }
      }
    }
  } catch (err) {
    if (onError) onError(err);
    if (onDone) onDone();
  }
}

export function handleUserQuery(userQuery, onMessage, onDone, onError, sessionId) {
  
  const greeting = checkGreetingFuzzy(userQuery);
 

  if (greeting) {
    onMessage(greeting);
    if (onDone) onDone();
  } else {
    streamQueryPost(userQuery, onMessage, onDone, onError, sessionId);
  }
}