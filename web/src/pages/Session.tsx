import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Check, Star } from 'lucide-react';
import BreathingCircle from '../components/BreathingCircle';
import { useStore } from '../context/store';
import techniques from '../data/breathing-techniques.json';

type Phase = 'inhale' | 'hold' | 'exhale' | 'holdEmpty' | 'idle';
type SessionState = 'setup' | 'active' | 'paused' | 'completed';

function Session() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addSession } = useStore();

  const technique = techniques.techniques.find(t => t.id === id);

  const [sessionState, setSessionState] = useState<SessionState>('setup');
  const [currentPhase, setCurrentPhase] = useState<Phase>('idle');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [preMood, setPreMood] = useState<number | null>(null);
  const [postMood, setPostMood] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const duration = technique?.pattern.recommendedDuration || 300;
  const phases = technique?.pattern.phases || [];

  const getCurrentPhaseDuration = useCallback(() => {
    const phaseMap: Record<string, number> = {};
    phases.forEach(p => {
      phaseMap[p.name.toLowerCase()] = p.duration;
    });
    return phaseMap[currentPhase] || 4;
  }, [phases, currentPhase]);

  const getNextPhase = useCallback((current: Phase): Phase => {
    const phaseOrder: Phase[] = ['inhale', 'hold', 'exhale', 'holdEmpty'];
    const availablePhases = phaseOrder.filter(p => {
      const phaseData = phases.find(ph => ph.name.toLowerCase() === p);
      return phaseData && phaseData.duration > 0;
    });

    if (availablePhases.length === 0) return 'inhale';

    const currentIndex = availablePhases.indexOf(current);
    if (currentIndex === -1) return availablePhases[0];

    const nextIndex = (currentIndex + 1) % availablePhases.length;
    if (nextIndex === 0) {
      setCycleCount(prev => prev + 1);
    }
    return availablePhases[nextIndex];
  }, [phases]);

  const runPhase = useCallback(() => {
    const phaseDuration = getCurrentPhaseDuration();
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / phaseDuration, 1);
      setPhaseProgress(progress);

      if (progress >= 1) {
        setCurrentPhase(prev => getNextPhase(prev));
        setPhaseProgress(0);
      } else {
        phaseTimerRef.current = requestAnimationFrame(updateProgress);
      }
    };

    phaseTimerRef.current = requestAnimationFrame(updateProgress);
  }, [getCurrentPhaseDuration, getNextPhase]);

  useEffect(() => {
    if (sessionState === 'active') {
      runPhase();
    }

    return () => {
      if (phaseTimerRef.current) {
        cancelAnimationFrame(phaseTimerRef.current);
      }
    };
  }, [sessionState, currentPhase, runPhase]);

  useEffect(() => {
    if (sessionState === 'active') {
      startTimeRef.current = Date.now() - elapsedTime * 1000;

      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);

        if (elapsed >= duration) {
          handleComplete();
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionState, duration]);

  const handleStart = () => {
    if (preMood === null) return;
    setCurrentPhase('inhale');
    setSessionState('active');
  };

  const handlePause = () => {
    setSessionState('paused');
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) cancelAnimationFrame(phaseTimerRef.current);
  };

  const handleResume = () => {
    setSessionState('active');
  };

  const handleComplete = () => {
    setSessionState('completed');
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) cancelAnimationFrame(phaseTimerRef.current);
  };

  const handleSaveSession = () => {
    if (postMood === null || rating === null) return;

    addSession({
      techniqueId: id || '',
      date: new Date().toISOString(),
      duration: elapsedTime,
      completed: elapsedTime >= duration * 0.8,
      preMood,
      postMood,
      rating
    });

    navigate('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!technique) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Technique not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-purple-700 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        <h1 className="font-semibold">{technique.name}</h1>
        <div className="w-10" />
      </div>

      <AnimatePresence mode="wait">
        {/* Setup State */}
        {sessionState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center px-6 pt-12"
          >
            <h2 className="text-2xl font-bold mb-2">How are you feeling?</h2>
            <p className="text-white/70 mb-8">Rate your current state</p>

            <div className="flex space-x-4 mb-12">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setPreMood(num)}
                  className={`w-14 h-14 rounded-full text-xl font-bold transition-all ${
                    preMood === num
                      ? 'bg-white text-primary-600 scale-110'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="text-center mb-8">
              <p className="text-white/70 text-sm">Session duration</p>
              <p className="text-3xl font-bold">{formatTime(duration)}</p>
            </div>

            <button
              onClick={handleStart}
              disabled={preMood === null}
              className="bg-white text-primary-600 px-12 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <Play className="h-6 w-6" />
              <span>Begin Session</span>
            </button>
          </motion.div>
        )}

        {/* Active/Paused State */}
        {(sessionState === 'active' || sessionState === 'paused') && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center px-6 pt-8"
          >
            {/* Timer */}
            <div className="text-center mb-8">
              <p className="text-5xl font-bold">{formatTime(elapsedTime)}</p>
              <p className="text-white/70 mt-2">of {formatTime(duration)}</p>
            </div>

            {/* Breathing Circle */}
            <div className="mb-8">
              <BreathingCircle
                phase={currentPhase}
                progress={phaseProgress}
                size={280}
                color="#ffffff"
              />
            </div>

            {/* Cycle Counter */}
            <p className="text-white/70 mb-8">Cycle {cycleCount + 1}</p>

            {/* Controls */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => {
                  setElapsedTime(0);
                  setCycleCount(0);
                  setCurrentPhase('inhale');
                  setPhaseProgress(0);
                }}
                className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <RotateCcw className="h-6 w-6" />
              </button>

              {sessionState === 'active' ? (
                <button
                  onClick={handlePause}
                  className="p-6 bg-white rounded-full text-primary-600 hover:bg-white/90 transition-colors"
                >
                  <Pause className="h-8 w-8" />
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="p-6 bg-white rounded-full text-primary-600 hover:bg-white/90 transition-colors"
                >
                  <Play className="h-8 w-8" />
                </button>
              )}

              <button
                onClick={handleComplete}
                className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <Check className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Completed State */}
        {sessionState === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center px-6 pt-8"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <Check className="h-10 w-10" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Great job!</h2>
            <p className="text-white/70 mb-8">
              You completed {formatTime(elapsedTime)} of breathing
            </p>

            {/* Post-session mood */}
            <div className="w-full max-w-sm mb-8">
              <p className="text-center mb-4">How do you feel now?</p>
              <div className="flex justify-center space-x-4">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPostMood(num)}
                    className={`w-12 h-12 rounded-full text-lg font-bold transition-all ${
                      postMood === num
                        ? 'bg-white text-primary-600 scale-110'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="w-full max-w-sm mb-8">
              <p className="text-center mb-4">Rate this session</p>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRating(num)}
                    className="p-2 transition-all"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating !== null && num <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-white/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Mood improvement indicator */}
            {preMood !== null && postMood !== null && (
              <div className="bg-white/10 rounded-xl p-4 mb-8 text-center w-full max-w-sm">
                <p className="text-white/70 text-sm">Mood change</p>
                <p className="text-2xl font-bold">
                  {postMood > preMood ? '+' : ''}
                  {postMood - preMood}
                </p>
              </div>
            )}

            <button
              onClick={handleSaveSession}
              disabled={postMood === null || rating === null}
              className="bg-white text-primary-600 px-12 py-4 rounded-xl font-semibold text-lg disabled:opacity-50"
            >
              Save & Continue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Session;
