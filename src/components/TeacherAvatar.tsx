
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Types d'animation disponibles
export type AnimationType = 'idle' | 'talking' | 'celebrating' | 'encouraging';

interface TeacherAvatarProps {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  isSpeaking: boolean;
  animationType?: AnimationType;
  onLoad?: () => void;
}

const TeacherAvatar: React.FC<TeacherAvatarProps> = ({ 
  position = [0, -0.5, 0], 
  scale = 1.0,
  rotation = [0, 0, 0],
  isSpeaking,
  animationType = 'idle',
  onLoad
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/teacher-avatar.glb');
  
  // Chargement des fichiers d'animation
  const idleAnimations = useGLTF('/F_Standing_Idle_001.glb');
  const talkingAnimations = useGLTF('/M_Talking_Variations_008.glb');
  
  // Combiner les animations de toutes les sources
  const animations = [
    ...(idleAnimations.animations || []),
    ...(talkingAnimations.animations || [])
  ];
  
  // Utiliser les animations avec la scène
  const { actions, mixer } = useAnimations(animations, group);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);
  const prevAnimationRef = useRef<string>('');

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // Déterminer quelle animation utiliser en fonction du contexte
  const getAnimationToUse = () => {
    // Si le personnage parle, utiliser l'animation de parole
    if (isSpeaking) {
      return { animations: talkingAnimations.animations, name: 'talking' };
    }
    
    // Sinon, utiliser l'animation basée sur le type
    switch (animationType) {
      case 'celebrating':
        // Pour célébrer, on peut utiliser l'animation de parole avec plus d'énergie
        return { animations: talkingAnimations.animations, name: 'celebrating' };
      case 'encouraging':
        // Pour encourager, utiliser l'animation de parole
        return { animations: talkingAnimations.animations, name: 'encouraging' };
      case 'talking':
        return { animations: talkingAnimations.animations, name: 'talking' };
      case 'idle':
      default:
        return { animations: idleAnimations.animations, name: 'idle' };
    }
  };

  // Effet pour gérer les animations en fonction de l'état
  useEffect(() => {
    if (!mixer || !group.current) return;
    
    const { animations: animationToUse, name: animName } = getAnimationToUse();
    const animationKey = `${animName}-${isSpeaking}`;
    
    // Ne pas relancer si c'est la même animation
    if (prevAnimationRef.current === animationKey) return;
    prevAnimationRef.current = animationKey;
    
    console.log("TeacherAvatar animation:", animName, "isSpeaking:", isSpeaking);
    
    // Arrêter l'animation en cours si elle existe
    if (currentAction) {
      currentAction.fadeOut(0.3);
    }
    
    if (animationToUse && animationToUse.length > 0) {
      const action = mixer.clipAction(animationToUse[0], group.current);
      
      // Ajuster la vitesse selon le type d'animation
      if (animationType === 'celebrating') {
        action.timeScale = 1.3; // Plus rapide pour célébrer
      } else if (animationType === 'encouraging') {
        action.timeScale = 1.1;
      } else {
        action.timeScale = 1.0;
      }
      
      action.reset().fadeIn(0.3).play();
      setCurrentAction(action);
      console.log(`Playing ${animName} animation`);
    } else {
      console.warn(`No ${animName} animations found`);
    }

    return () => {
      if (currentAction) {
        currentAction.fadeOut(0.3);
      }
    };
  }, [mixer, isSpeaking, animationType]);

  // Boucle d'animation pour mettre à jour le mixer
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
    
    // Appliquer une légère animation flottante (plus prononcée quand on célèbre)
    if (group.current) {
      const baseY = position[1];
      const floatAmplitude = animationType === 'celebrating' ? 0.05 : 0.03;
      const floatSpeed = animationType === 'celebrating' ? 0.8 : 0.5;
      group.current.position.y = baseY + Math.sin(state.clock.elapsedTime * floatSpeed) * floatAmplitude;
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
    </group>
  );
};

// Précharger les modèles
useGLTF.preload('/teacher-avatar.glb');
useGLTF.preload('/F_Standing_Idle_001.glb');
useGLTF.preload('/M_Talking_Variations_008.glb');

export default TeacherAvatar;
