
import React, { useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import LevelSelector from '@/components/LevelSelector';
import GameArea from '@/components/GameArea';
import TeacherSection from '@/components/TeacherSection';
import { useGameState } from '@/hooks/useGameState';
import MainNavigation from '@/components/MainNavigation';
import { AnimationType } from '@/components/TeacherAvatar';

const CalculEcrit: React.FC = () => {
  const gameState = useGameState();
  const { gameModule, moduleLevel, message, speak, phase, handleChangeModule, handleChangeLevel, setSpeak } = gameState;
  
  // Whether to use 3D avatar or 2D image
  const use3DAvatar = true;
  
  // Déterminer le type d'animation basé sur la phase du jeu
  const animationType: AnimationType = useMemo(() => {
    switch (phase) {
      case 'intro':
        return 'idle';
      case 'redCount':
      case 'blueCount':
      case 'totalCount':
      case 'totalFirst':
      case 'secondColor':
      case 'vennDiagram':
      case 'equation':
        return 'encouraging'; // Encourage pendant les phases de comptage
      case 'verify':
        return 'celebrating'; // Célébration après vérification
      case 'result':
        return 'celebrating'; // Célébration pour les résultats
      default:
        return 'idle';
    }
  }, [phase]);
  
  return (
    <AppLayout>
      {/* Bande de titre avec image de fond (largeur complète) */}
      <div className="relative mb-6 overflow-hidden w-full">
        {/* Image d'arrière-plan avec overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: `url('/lovable-uploads/dfdc4865-47ae-4df5-9d7d-fe27f9498de1.png')` }}
        >
          {/* Overlay coloré semi-transparent */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-purple-500/50"></div>
        </div>
        
        {/* Titre avec padding augmenté pour voir plus de l'image */}
        <div className="relative z-10 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-center text-white">
              Résoudre des situations-problèmes de type additif
            </h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <LevelSelector 
            gameModule={gameModule} 
            moduleLevel={moduleLevel} 
            onChangeModule={handleChangeModule} 
            onChangeLevel={handleChangeLevel} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GameArea gameState={gameState} />
          <TeacherSection 
            message={message} 
            speak={speak} 
            onSpeechEnd={() => setSpeak(false)} 
            use3DAvatar={use3DAvatar}
            animationType={animationType}
            className="leading-relaxed space-y-6 mb-12"
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default CalculEcrit;
