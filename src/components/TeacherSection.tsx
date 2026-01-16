import React from 'react';
import TeacherBubble from '@/components/TeacherBubble';
import { AnimationType } from '@/components/TeacherAvatar';

interface TeacherSectionProps {
  message: string;
  speak: boolean;
  onSpeechEnd: () => void;
  use3DAvatar: boolean;
  className?: string;
  animationType?: AnimationType;
  /**
   * Clé de contexte pour resynchroniser l'animation quand l'état du jeu change
   * (ex: phase actuelle). Si elle change, l'avatar peut choisir une nouvelle
   * variation d'animation.
   */
  animationContextKey?: string;
}

const TeacherSection: React.FC<TeacherSectionProps> = ({
  message,
  speak,
  onSpeechEnd,
  use3DAvatar,
  className,
  animationType = 'idle',
  animationContextKey,
}) => {
  return (
    <div className={`flex flex-col justify-start items-center h-full pt-[50px] ${className || ''}`}>
      <TeacherBubble
        message={message}
        speak={speak}
        onSpeechEnd={onSpeechEnd}
        use3DAvatar={use3DAvatar}
        animationType={animationType}
        animationContextKey={animationContextKey}
      />
    </div>
  );
};

export default TeacherSection;

