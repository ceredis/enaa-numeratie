
import React, { useState } from 'react';
import SpeechSynthesis from './SpeechSynthesis';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import TeacherAvatar, { AnimationType } from './TeacherAvatar';

interface TeacherBubbleProps {
  message: string;
  speak: boolean;
  onSpeechEnd?: () => void;
  use3DAvatar?: boolean;
  animationType?: AnimationType;
}

const TeacherBubble: React.FC<TeacherBubbleProps> = ({ 
  message, 
  speak, 
  onSpeechEnd,
  use3DAvatar = false,
  animationType = 'idle'
}) => {
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  return (
    <div className="flex flex-col items-center mt-0">
      <div className="speech-bubble mb-2 max-w-md bg-blue-50 p-4 rounded-lg shadow-md border border-blue-200">
        <p className="text-lg">{message}</p>
      </div>

      {use3DAvatar ? (
        <div className="w-64 h-[470px] relative mt-2">
          {!avatarLoaded && (
            <img 
              src="/lovable-uploads/e4e7aa88-b633-45df-8859-71a60a13e30a.png" 
              alt="Institutrice (chargement…)" 
              className="w-full h-full object-contain absolute top-0 left-0 z-10 animate-pulse" 
            />
          )}
          <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0.2, 2.5], fov: 40 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <TeacherAvatar 
                isSpeaking={speak} 
                animationType={animationType}
                onLoad={() => setAvatarLoaded(true)} 
                position={[0, -1.0, 0]} 
                scale={0.95}
                rotation={[0, 0, 0]} 
              />
              <OrbitControls 
                enableZoom={false} 
                enablePan={false}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.8}
              />
            </Canvas>
          </div>
        </div>
      ) : (
        <img 
          src="/lovable-uploads/e4e7aa88-b633-45df-8859-71a60a13e30a.png" 
          alt="Institutrice (2D)" 
          className="w-32 h-32 object-contain animate-pulse" 
        />
      )}

      <SpeechSynthesis text={message} speak={speak} onEnd={onSpeechEnd} />
    </div>
  );
};

export default TeacherBubble;
