import { motion } from 'framer-motion';

interface BreathingCircleProps {
  phase: 'inhale' | 'hold' | 'exhale' | 'holdEmpty' | 'idle';
  progress: number;
  size?: number;
  color?: string;
}

function BreathingCircle({ phase, progress, size = 280, color = '#3b82f6' }: BreathingCircleProps) {
  const getScale = () => {
    switch (phase) {
      case 'inhale':
        return 1 + progress * 0.4;
      case 'hold':
        return 1.4;
      case 'exhale':
        return 1.4 - progress * 0.4;
      case 'holdEmpty':
        return 1;
      default:
        return 1;
    }
  };

  const getOpacity = () => {
    switch (phase) {
      case 'inhale':
        return 0.6 + progress * 0.4;
      case 'hold':
        return 1;
      case 'exhale':
        return 1 - progress * 0.4;
      case 'holdEmpty':
        return 0.6;
      default:
        return 0.6;
    }
  };

  const phaseLabels = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    holdEmpty: 'Hold',
    idle: 'Ready'
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer ring */}
      <div
        className="absolute rounded-full border-4 border-primary-200"
        style={{ width: size, height: size }}
      />

      {/* Progress ring */}
      <svg
        className="absolute"
        style={{ width: size, height: size, transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={Math.PI * (size - 8)}
          strokeDashoffset={Math.PI * (size - 8) * (1 - progress)}
          className="transition-all duration-100"
        />
      </svg>

      {/* Breathing circle */}
      <motion.div
        className="rounded-full flex items-center justify-center"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          backgroundColor: color
        }}
        animate={{
          scale: getScale(),
          opacity: getOpacity()
        }}
        transition={{
          type: 'tween',
          duration: 0.1
        }}
      >
        <span className="text-white text-xl font-semibold">
          {phaseLabels[phase]}
        </span>
      </motion.div>
    </div>
  );
}

export default BreathingCircle;
