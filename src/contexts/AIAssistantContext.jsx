import React, { createContext, useContext, useState, useCallback } from 'react';

const AIAssistantContext = createContext();

export function AIAssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am Quantrex AI, your 24/7 IIT-JEE Mathematics Expert. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const toggleAssistant = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openAssistant = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date().toISOString()
    };
    addMessage(userMsg);
    
    // Simulate thinking/typing
    setIsTyping(true);
    
    // Simulate backend response time
    setTimeout(() => {
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(content),
        timestamp: new Date().toISOString()
      };
      addMessage(assistantMsg);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000); // 1.5s to 3.5s response time
    
  }, [addMessage]);

  // Mock response generator based on master prompt features
  const generateMockResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('test') || lowerInput.includes('mock')) {
      return "I can help you generate a customized NTA style mock test. What topic or chapter would you like to focus on, and how many questions do you need?";
    }
    
    if (lowerInput.includes('notes') || lowerInput.includes('formula')) {
      return "Searching the notes and formula database... I found the complete revision sheet. Would you like me to open the mind map or the short notes?";
    }
    
    if (lowerInput.includes('vector') || lowerInput.includes('calculus') || lowerInput.includes('integration')) {
      return "I've searched the Question Bank for that topic. I found 45 previous year questions and 120 practice questions matching JEE Advanced difficulty. Should I generate a 20-question DPP for you?";
    }
    
    if (lowerInput.includes('explain') || lowerInput.includes('solution')) {
      return "Here is the step-by-step solution for this problem. \n\n**Step 1:** Analyze the given equation.\n**Shortcut Trick:** Notice the symmetry, you can directly use the property of definite integrals.\n\nWould you like a similar question to practice this concept?";
    }

    if (lowerInput.includes('analytics') || lowerInput.includes('mistake') || lowerInput.includes('progress')) {
      return "Analyzing your recent performance... Your accuracy in Coordinate Geometry is 85%, but Calculus needs attention (42%). I recommend revising Definite Integration. Should I create a targeted revision test for you?";
    }
    
    return "I've searched the Quantrex database for your query. Could you please specify if you're looking for a question, a concept explanation, or a test on this topic?";
  };

  return (
    <AIAssistantContext.Provider value={{
      isOpen,
      toggleAssistant,
      openAssistant,
      closeAssistant,
      messages,
      sendMessage,
      isTyping
    }}>
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}
