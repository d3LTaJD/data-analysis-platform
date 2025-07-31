import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface AIInsightsProps {
  onAskQuestion: (question: string) => void;
  insights: Array<{
    question: string;
    response: string;
    timestamp: Date;
  }>;
  isProcessing?: boolean;
}

export const AIInsights: React.FC<AIInsightsProps> = ({
  onAskQuestion,
  insights,
  isProcessing
}) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onAskQuestion(question);
      setQuestion('');
    }
  };

  const suggestedQuestions = [
    "What are the key trends in this data?",
    "Identify any outliers or anomalies",
    "What correlations exist between variables?",
    "Provide a summary of the main insights"
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>
        
        {/* Chat Interface */}
        <div className="space-y-4">
          {/* Chat History */}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-2"
              >
                {/* User Question */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-3">
                    <p className="text-gray-800">{insight.question}</p>
                  </div>
                </div>
                
                {/* AI Response */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-800 whitespace-pre-wrap">{insight.response}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {insight.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Loading State */}
            {isProcessing && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Suggested Questions */}
          {insights.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400">💡 Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(suggestion)}
                    className="text-sm bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white px-3 py-1 rounded-full transition-colors border border-white/20"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your data..."
              className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isProcessing}
            />
            <Button
              type="submit"
              disabled={!question.trim() || isProcessing}
              loading={isProcessing}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};