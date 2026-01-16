
import { useEffect, useRef } from 'react';
import { getPhaseMessage } from '@/utils/gameLogic';
import { GameStateInitialization } from './useGameInitialization';

export function useGameHandlers(gameState: GameStateInitialization) {
  const {
    gameModule,
    moduleLevel,
    phase,
    redBalls,
    blueBalls,
    userRedCount,
    userBlueCount,
    userTotalCount,
    totalAttempts,
    score,
    questionNumber,
    isSoustractionMode,
    firstColorIsRed,
    setPhase,
    setUserRedCount,
    setUserBlueCount,
    setUserTotalCount,
    setTotalAttempts,
    setScore,
    setShowBalls,
    setQuestionNumber,
    setMessage,
    setSpeak,
    setVennDiagramCompleted,
    initNewRound
  } = gameState;
  
  // Track previous phase to detect phase changes
  const prevPhaseRef = useRef<string>(phase);
  
  // Set message and trigger speech when phase changes
  useEffect(() => {
    const newMessage = getPhaseMessage(
      phase,
      gameModule,
      moduleLevel,
      userRedCount,
      userBlueCount,
      userTotalCount === redBalls + blueBalls,
      totalAttempts,
      redBalls + blueBalls,
      score,
      5, // TOTAL_QUESTIONS
      isSoustractionMode,
      firstColorIsRed
    );
    
    setMessage(newMessage);
    
    // Trigger speech on phase change
    if (prevPhaseRef.current !== phase) {
      setSpeak(true);
      prevPhaseRef.current = phase;
    }
  }, [
    phase,
    gameModule,
    moduleLevel,
    userRedCount,
    userBlueCount,
    userTotalCount,
    redBalls,
    blueBalls,
    totalAttempts,
    score,
    isSoustractionMode,
    firstColorIsRed,
    setMessage,
    setSpeak
  ]);

  const handleSubmitRed = (count: number | string) => {
    // Convert to number if it's a string
    const parsedCount = typeof count === 'string' ? parseInt(count) : count;
    
    console.log(`Red ball validation: input=${parsedCount}, actual=${redBalls}`);
    
    // Compare with actual number of red balls
    if (!isNaN(parsedCount) && parsedCount === redBalls) {
      setUserRedCount(parsedCount);
      
      // Check if we are in subtraction mode and this is the second color to count
      if (isSoustractionMode && !firstColorIsRed) {
        // In subtraction mode, if red is the second color, move to secondColor phase
        setPhase('secondColor');
        setShowBalls(false);
      } else {
        // Normal flow - go to blue count phase
        setPhase('blueCount');
      }
    } else {
      setMessage("Tu n'as pas bien compté, recommence.");
      setSpeak(true);
    }
  };
  
  const handleSubmitBlue = (count: number | string) => {
    // Convert to number if it's a string
    const parsedCount = typeof count === 'string' ? parseInt(count) : count;
    
    console.log(`Blue ball validation: input=${parsedCount}, actual=${blueBalls}`);
    
    // Compare with actual number of blue balls
    if (!isNaN(parsedCount) && parsedCount === blueBalls) {
      setUserBlueCount(parsedCount);
      
      // Check if we are in subtraction mode and this is the second color to count
      if (isSoustractionMode && firstColorIsRed) {
        // In subtraction mode, if blue is the second color, move to secondColor phase
        setPhase('secondColor');
        setShowBalls(false);
      } else if (gameModule === 1) {
        // Module 1: levels 1 and 2, only manipulation (no Venn diagram)
        setPhase('totalCount');
        // Hide balls during total count phase to encourage calculation
        setShowBalls(false);
      } else if (moduleLevel >= 3) {
        // Module 2: levels 3, 4, 5 with Venn diagram
        setPhase('vennDiagram');
        setShowBalls(false);
      }
    } else {
      setMessage("Tu n'as pas bien compté, recommence.");
      setSpeak(true);
    }
  };
  
  const handleSubmitTotal = (count: number | string) => {
    // Convert to number if it's a string
    const parsedCount = typeof count === 'string' ? parseInt(count) : count;
    
    console.log(`Total validation: input=${parsedCount}, expected=${redBalls + blueBalls}`);
    
    if (!isNaN(parsedCount)) {
      setUserTotalCount(parsedCount);
      setTotalAttempts(prev => prev + 1);
      
      // For subtraction mode in Module 1 Level 2
      if (isSoustractionMode && gameModule === 1 && moduleLevel === 2) {
        if (parsedCount === redBalls + blueBalls) {
          // If total is correct, move to the phase of counting the selected color
          setPhase(firstColorIsRed ? 'redCount' : 'blueCount');
        } else {
          setMessage("Ce n'est pas le bon nombre total de billes. Compte à nouveau.");
          setSpeak(true);
          return;
        }
      } else {
        // Standard mode (addition)
        if (parsedCount === redBalls + blueBalls) {
          // Correct answer
          setScore(prev => prev + 1);
        } 
        
        // Show balls for verification
        setShowBalls(true);
        setPhase('verify');
      }
    } else {
      setMessage("Tu dois entrer un nombre valide.");
      setSpeak(true);
    }
  };
  
  const handleSubmitSecondColor = (count: number | string) => {
    // This function is only used for Module 1 Level 2 in subtraction mode
    const parsedCount = typeof count === 'string' ? parseInt(count) : count;
    
    // Second color is blue if first was red, and vice versa
    const expectedCount = firstColorIsRed ? blueBalls : redBalls;
    
    console.log(`Second color validation: input=${parsedCount}, expected=${expectedCount}`);
    
    if (!isNaN(parsedCount)) {
      setUserTotalCount(parsedCount);
      setTotalAttempts(prev => prev + 1);
      
      // Check if answer is correct
      const isCorrect = parsedCount === expectedCount;
      
      if (isCorrect) {
        setScore(prev => prev + 1);
      }
      
      // Show balls for verification and move to verification phase
      setShowBalls(true);
      setPhase('verify');
    } else {
      setMessage("Tu dois entrer un nombre valide.");
      setSpeak(true);
    }
  };
  
  const handleSubmitVennDiagram = (redValue: number | string, blueValue: number | string) => {
    // Convert to numbers if they're strings
    const parsedRedValue = typeof redValue === 'string' ? parseInt(redValue) : redValue;
    const parsedBlueValue = typeof blueValue === 'string' ? parseInt(blueValue) : blueValue;
    
    if (!isNaN(parsedRedValue) && !isNaN(parsedBlueValue) && 
        parsedRedValue === redBalls && parsedBlueValue === blueBalls) {
      setVennDiagramCompleted(true);
      setPhase('equation');
    } else {
      setMessage("Tu n'as pas bien complété les étiquettes. Réessaie.");
      setSpeak(true);
    }
  };
  
  const handleSubmitEquation = (operation: string, answer: number | string) => {
    // Convert to number if it's a string
    const parsedAnswer = typeof answer === 'string' ? parseInt(answer) : answer;
    
    if (isNaN(parsedAnswer)) {
      setMessage("Tu dois entrer un nombre valide pour le résultat.");
      setSpeak(true);
      return;
    }
    
    setUserTotalCount(parsedAnswer);
    setTotalAttempts(prev => prev + 1);
    
    // Validate operation (must contain the number of red and blue balls)
    const operationStr = operation.replace(/\s/g, ''); // Remove spaces
    const expectedOperation = `${redBalls}+${blueBalls}`;
    const alternativeOperation = `${blueBalls}+${redBalls}`;
    
    const isOperationCorrect = operationStr === expectedOperation || operationStr === alternativeOperation;
    const isAnswerCorrect = parsedAnswer === redBalls + blueBalls;
    
    if (isOperationCorrect && isAnswerCorrect) {
      // Correct answer
      setScore(prev => prev + 1);
      setShowBalls(true);
      setVennDiagramCompleted(true);
      setPhase('verify');
    } else {
      // Message to indicate what is incorrect
      if (!isOperationCorrect) {
        setMessage(`L'opération n'est pas correcte. Réessaie de l'écrire correctement.`);
      } else {
        setMessage(`Le résultat n'est pas correct. Réessaie de calculer.`);
      }
      setSpeak(true);
      return; // Don't continue to verification
    }
  };
  
  const handleContinue = () => {
    if (questionNumber < 5) { // TOTAL_QUESTIONS
      // Move to next question
      setQuestionNumber(prev => prev + 1);
      // Initialize new round for the next question
      initNewRound();
    } else {
      // End of game
      setPhase('result');
    }
  };

  return {
    handleSubmitRed,
    handleSubmitBlue,
    handleSubmitTotal,
    handleSubmitSecondColor,
    handleSubmitVennDiagram,
    handleSubmitEquation,
    handleContinue
  };
}
