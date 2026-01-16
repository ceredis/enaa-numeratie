
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  /**
   * Quand cette clé change (ex: phase du jeu), l'avatar choisit une nouvelle
   * variation d'animation pour éviter de répéter indéfiniment les mêmes gestes.
   */
  animationContextKey?: string;
  onLoad?: () => void;
}

type AnimationCategory = 'idle' | 'instructions' | 'encourage' | 'celebrate';

const FADE = 0.25;

function pickRandom<T>(arr: T[], seed: string): T {
  // Hash simple et déterministe (pour stabiliser un choix par "contextKey")
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % arr.length;
  return arr[idx];
}

const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  position = [0, -0.5, 0],
  scale = 1.0,
  rotation = [0, 0, 0],
  isSpeaking,
  animationType = 'idle',
  animationContextKey,
  onLoad,
}) => {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/teacher-avatar.glb');

  // Animations prêtes à l'emploi (Ready Player Me) depuis /public/models
  const idle1 = useGLTF('/models/Standing_Idle_01.glb');
  const idle2 = useGLTF('/models/Standing_Idle_02.glb');
  const idle3 = useGLTF('/models/Standing_Idle_03.glb');

  const expr1 = useGLTF('/models/M_Standing_Expressions_004.glb');
  const expr2 = useGLTF('/models/M_Standing_Expressions_005.glb');
  const expr3 = useGLTF('/models/M_Standing_Expressions_012.glb');

  const instr1 = useGLTF('/models/Talking_Instructions_01.glb');
  const instr2 = useGLTF('/models/Talking_Instructions_02.glb');
  const instr3 = useGLTF('/models/Talking_Instructions_03.glb');

  const enc1 = useGLTF('/models/Talking_Encourage_01.glb');
  const enc2 = useGLTF('/models/Talking_Encourage_02.glb');
  const enc4 = useGLTF('/models/Talking_Encourage_04.glb');

  const dance1 = useGLTF('/models/Dance_01.glb');
  const dance2 = useGLTF('/models/Dance_02.glb');
  const dance3 = useGLTF('/models/Dance_03.glb');

  // Combine toutes les pistes d'animation pour disposer d'un mixer unique
  const allClips = useMemo(() => {
    const clips: THREE.AnimationClip[] = [];
    const add = (gltf: any) => {
      if (gltf?.animations?.length) clips.push(...gltf.animations);
    };

    add(idle1);
    add(idle2);
    add(idle3);
    add(expr1);
    add(expr2);
    add(expr3);

    add(instr1);
    add(instr2);
    add(instr3);

    add(enc1);
    add(enc2);
    add(enc4);

    add(dance1);
    add(dance2);
    add(dance3);

    return clips;
  }, [idle1, idle2, idle3, expr1, expr2, expr3, instr1, instr2, instr3, enc1, enc2, enc4, dance1, dance2, dance3]);

  const { mixer } = useAnimations(allClips, group);

  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);
  const currentCategoryRef = useRef<AnimationCategory | null>(null);
  const currentContextRef = useRef<string>('');

  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  const category: AnimationCategory = useMemo(() => {
    // La parole (TTS) doit prioriser une animation "consignes" / talk
    if (isSpeaking) return 'instructions';

    switch (animationType) {
      case 'celebrating':
        return 'celebrate';
      case 'encouraging':
        return 'encourage';
      case 'talking':
        return 'instructions';
      case 'idle':
      default:
        return 'idle';
    }
  }, [animationType, isSpeaking]);

  const pool: THREE.AnimationClip[] = useMemo(() => {
    const clipsFor = (gltf: any) => (gltf?.animations?.length ? gltf.animations : []);

    switch (category) {
      case 'instructions':
        return [...clipsFor(instr1), ...clipsFor(instr2), ...clipsFor(instr3)];
      case 'encourage':
        return [...clipsFor(enc1), ...clipsFor(enc2), ...clipsFor(enc4)];
      case 'celebrate':
        return [...clipsFor(dance1), ...clipsFor(dance2), ...clipsFor(dance3)];
      case 'idle':
      default:
        // Idle + expressions faciales
        return [
          ...clipsFor(idle1),
          ...clipsFor(idle2),
          ...clipsFor(idle3),
          ...clipsFor(expr1),
          ...clipsFor(expr2),
          ...clipsFor(expr3),
        ];
    }
  }, [category, idle1, idle2, idle3, expr1, expr2, expr3, instr1, instr2, instr3, enc1, enc2, enc4, dance1, dance2, dance3]);

  useEffect(() => {
    if (!mixer || !group.current) return;
    if (!pool.length) return;

    const contextKey = `${category}::${animationContextKey ?? ''}::${isSpeaking ? 'speaking' : 'silent'}`;

    // On relance si (1) catégorie change, ou (2) contexte change
    const shouldReselect =
      currentCategoryRef.current !== category ||
      currentContextRef.current !== contextKey;

    if (!shouldReselect) return;

    currentCategoryRef.current = category;
    currentContextRef.current = contextKey;

    const clipSeed = `${contextKey}`;
    const selectedClip = pickRandom(pool, clipSeed);

    // Fade-out de l'action précédente
    if (currentAction) {
      currentAction.fadeOut(FADE);
    }

    const next = mixer.clipAction(selectedClip, group.current);

    // Réglages par type
    if (category === 'celebrate') {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true;
      next.timeScale = 1.15;
    } else if (category === 'encourage') {
      next.setLoop(THREE.LoopRepeat, Infinity);
      next.timeScale = 1.05;
    } else if (category === 'instructions') {
      next.setLoop(THREE.LoopRepeat, Infinity);
      next.timeScale = 1.0;
    } else {
      next.setLoop(THREE.LoopRepeat, Infinity);
      next.timeScale = 1.0;
    }

    next.reset().fadeIn(FADE).play();
    setCurrentAction(next);

    // Si c'est une animation "one-shot", revenir à l'idle une fois terminée
    const onFinished = (e: any) => {
      if (e?.action !== next) return;
      if (category !== 'celebrate') return;
      // Après célébration, on bascule sur idle (via un changement de contexte)
      currentContextRef.current = '';
    };

    mixer.addEventListener('finished', onFinished);
    return () => {
      mixer.removeEventListener('finished', onFinished);
    };
  }, [mixer, pool, category, animationContextKey, isSpeaking, currentAction]);

  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);

    // Légère animation flottante (un peu plus marquée pendant la célébration)
    if (group.current) {
      const baseY = position[1];
      const floatAmplitude = category === 'celebrate' ? 0.05 : 0.03;
      const floatSpeed = category === 'celebrate' ? 0.8 : 0.5;
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
useGLTF.preload('/models/Standing_Idle_01.glb');
useGLTF.preload('/models/Standing_Idle_02.glb');
useGLTF.preload('/models/Standing_Idle_03.glb');
useGLTF.preload('/models/M_Standing_Expressions_004.glb');
useGLTF.preload('/models/M_Standing_Expressions_005.glb');
useGLTF.preload('/models/M_Standing_Expressions_012.glb');
useGLTF.preload('/models/Talking_Instructions_01.glb');
useGLTF.preload('/models/Talking_Instructions_02.glb');
useGLTF.preload('/models/Talking_Instructions_03.glb');
useGLTF.preload('/models/Talking_Encourage_01.glb');
useGLTF.preload('/models/Talking_Encourage_02.glb');
useGLTF.preload('/models/Talking_Encourage_04.glb');
useGLTF.preload('/models/Dance_01.glb');
useGLTF.preload('/models/Dance_02.glb');
useGLTF.preload('/models/Dance_03.glb');

export default TeacherAvatar;

