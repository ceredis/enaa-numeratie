
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
}

const TeacherSection: React.FC<TeacherSectionProps> = ({ 
  message, 
  speak, 
  onSpeechEnd, 
  use3DAvatar,
  className,
  animationType = 'idle'
}) => {
  return (
    <div className={`flex flex-col justify-start items-center h-full pt-[50px] ${className || ''}`}>
      <TeacherBubble 
        message={message}
        speak={speak}
        onSpeechEnd={onSpeechEnd}
        use3DAvatar={use3DAvatar}
        animationType={animationType}
      />
    </div>
  );
};

export default TeacherSection;
