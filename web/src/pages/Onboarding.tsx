import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, ChevronRight, Check } from 'lucide-react';
import { useStore } from '../context/store';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  options?: { value: string; label: string; emoji: string }[];
}

const steps: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to Breathe',
    subtitle: 'Your journey to better breathing starts here'
  },
  {
    id: 'goal',
    title: "What's your primary goal?",
    subtitle: "We'll personalize your experience",
    options: [
      { value: 'stress-reduction', label: 'Reduce stress and anxiety', emoji: '😌' },
      { value: 'sleep', label: 'Improve sleep', emoji: '😴' },
      { value: 'performance', label: 'Enhance focus and performance', emoji: '🎯' },
      { value: 'energy', label: 'Increase energy', emoji: '⚡' },
      { value: 'general', label: 'General wellness', emoji: '✨' }
    ]
  },
  {
    id: 'experience',
    title: "What's your experience level?",
    subtitle: "We'll recommend techniques that fit",
    options: [
      { value: 'beginner', label: "I'm new to breathing exercises", emoji: '🌱' },
      { value: 'intermediate', label: "I've tried some techniques", emoji: '🌿' },
      { value: 'advanced', label: 'I practice regularly', emoji: '🌳' }
    ]
  },
  {
    id: 'duration',
    title: 'How much time can you dedicate daily?',
    subtitle: 'Even 5 minutes makes a difference',
    options: [
      { value: '5', label: '5 minutes', emoji: '⏱️' },
      { value: '10', label: '10 minutes', emoji: '⏱️' },
      { value: '20', label: '20 minutes', emoji: '⏱️' },
      { value: '30', label: '30+ minutes', emoji: '⏱️' }
    ]
  },
  {
    id: 'complete',
    title: "You're all set!",
    subtitle: 'Your personalized program is ready'
  }
];

function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    goal: '',
    experience: '',
    duration: ''
  });

  const step = steps[currentStep];

  const handleOptionSelect = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
    }, 300);
  };

  const handleComplete = () => {
    completeOnboarding(answers);
    navigate('/');
  };

  const getRecommendedTechnique = () => {
    if (answers.goal === 'stress-reduction' || answers.goal === 'general') {
      return 'Cyclic Sighing';
    } else if (answers.goal === 'sleep') {
      return '4-7-8 Breathing';
    } else if (answers.goal === 'performance') {
      return 'Box Breathing';
    } else if (answers.goal === 'energy') {
      return 'Breath of Fire';
    }
    return 'Coherent Breathing';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-purple-700 flex flex-col p-6">
      {/* Progress dots */}
      <div className="flex justify-center space-x-2 mb-8">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentStep
                ? 'w-6 bg-white'
                : index < currentStep
                ? 'w-2 bg-white/70'
                : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col max-w-md mx-auto w-full"
        >
          {/* Welcome Step */}
          {step.id === 'welcome' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6"
              >
                <Wind className="h-12 w-12 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">{step.title}</h1>
              <p className="text-white/70 mb-8">{step.subtitle}</p>
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Option Steps */}
          {step.options && (
            <div className="flex-1 flex flex-col text-white">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">{step.title}</h1>
                <p className="text-white/70">{step.subtitle}</p>
              </div>

              <div className="space-y-3">
                {step.options.map((option) => {
                  const isSelected = answers[step.id as keyof typeof answers] === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOptionSelect(step.id, option.value)}
                      className={`w-full p-4 rounded-xl text-left flex items-center space-x-4 transition-all ${
                        isSelected
                          ? 'bg-white text-primary-600'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="flex-1 font-medium">{option.label}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check className="h-5 w-5" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Complete Step */}
          {step.id === 'complete' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
              >
                <Check className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">{step.title}</h1>
              <p className="text-white/70 mb-6">{step.subtitle}</p>

              {/* Recommended Technique */}
              <div className="bg-white/10 rounded-xl p-4 mb-8 text-left w-full">
                <p className="text-white/70 text-sm mb-2">Recommended Technique</p>
                <h3 className="font-semibold text-lg">{getRecommendedTechnique()}</h3>
                <p className="text-white/70 text-sm mt-1 capitalize">
                  Based on your goal: {answers.goal.replace(/-/g, ' ')}
                </p>
              </div>

              {/* Summary */}
              <div className="bg-white/5 rounded-xl p-4 w-full mb-8">
                <div className="flex justify-between py-2">
                  <span className="text-white/70">Goal</span>
                  <span className="font-medium capitalize">{answers.goal.replace(/-/g, ' ')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white/70">Experience</span>
                  <span className="font-medium capitalize">{answers.experience}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white/70">Daily time</span>
                  <span className="font-medium">{answers.duration} minutes</span>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2"
              >
                <span>Start Breathing</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Onboarding;
