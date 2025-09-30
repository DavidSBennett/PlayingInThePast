
import { useState, useEffect, useCallback } from "react";
import { HistoricalCard } from "@/api/entities";
import { GameSession } from "@/api/entities";
import { Conclusion } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, RefreshCw, Crown, ArrowUp, Zap, Library, PlusSquare, Clock, Archive, Target, BookOpen, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ArchiveBoard from "../components/game/ArchiveBoard"; // Retained, but not used directly in new layout structure
import ProjectSpace from "../components/game/ProjectSpace";
import PlayerHand from "../components/game/PlayerHand";
import ConclusionBoard from "../components/game/ConclusionBoard"; // Retained, but not used directly in new layout structure
import ConclusionTile from "../components/game/ConclusionTile"; // Assuming this component exists or needs to be created

// Define career stage details outside the component for reusability and to avoid re-creation on renders
const careerStages = {
  graduate_student: { name: "Graduate Student", color: "bg-blue-500" },
  postdoc: { name: "Postdoctoral Researcher", color: "bg-purple-500" },
  assistant_professor: { name: "Assistant Professor", color: "bg-green-500" },
  associate_professor: { name: "Associate Professor", color: "bg-indigo-500" },
  full_professor: { name: "Full Professor", color: "bg-red-500" },
  emeritus: { name: "Professor Emeritus", color: "bg-yellow-500" },
};

const argumentPointValues = { 'C': 6, 'A': 3, 'B': 1 };
const subArgumentPointValues = { 'E': 6, 'P': 3, 'S': 1 };

export default function GameBoard() {
  const [allCards, setAllCards] = useState([]);
  const [allConclusions, setAllConclusions] = useState([]);
  const [gameSession, setGameSession] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [prestigeAnimation, setPrestigeAnimation] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCareerWarning, setShowCareerWarning] = useState(false);
  const [careerWarningMessage, setCareerWarningMessage] = useState("");
  const [showEndGameModal, setShowEndGameModal] = useState(false);

  // Helper to determine career stage based on turn number
  const getCareerStage = (turn) => {
    if (turn <= 5) return "graduate_student";
    if (turn <= 10) return "postdoc";
    if (turn <= 15) return "assistant_professor";
    if (turn <= 20) return "associate_professor";
    if (turn <= 25) return "full_professor";
    return "emeritus"; // Beyond turn 25
  };

  const checkCareerWarnings = useCallback(async (session) => {
    const turn = session.current_turn || 1;
    const publications = session.publications_count || 0;
    const bookLength = session.book_length_publications || 0;
    const warnings = session.warnings_shown || [];

    let updatedWarnings = [...warnings];
    let newWarningMessage = "";
    let shouldShowWarning = false;

    if (turn === 5 && publications === 0 && !warnings.includes('graduation')) {
      newWarningMessage = "⚠️ Graduation Approaching!\n\nYou're about to graduate with no publications! You need to publish at least one argument to prove your commitment to the academic field, or you'll be forced out of the profession.";
      shouldShowWarning = true;
      updatedWarnings.push('graduation');
    }
    
    if (turn === 10 && bookLength === 0 && !warnings.includes('tenure_track')) {
      newWarningMessage = "📚 Tenure Track Warning!\n\nTo secure tenure, you need to publish a book-length work (5+ evidence cards). You have until turn 15 to publish substantial research or your academic career may be in jeopardy.";
      shouldShowWarning = true;
      updatedWarnings.push('tenure_track');
    }
    
    if (turn === 15 && bookLength === 0 && !warnings.includes('tenure_crisis')) {
      newWarningMessage = "🚨 Tenure Crisis!\n\nYou've failed to publish a book-length work by the deadline. Your tenure application is in serious jeopardy. Publish substantial research immediately or face career consequences.";
      shouldShowWarning = true;
      updatedWarnings.push('tenure_crisis');
    }

    if (shouldShowWarning) {
      setCareerWarningMessage(newWarningMessage);
      setShowCareerWarning(true);
      await GameSession.update(session.id, { warnings_shown: updatedWarnings });
      // Re-fetch or update the local session state to reflect the warnings_shown change
      setGameSession(prevSession => ({ ...prevSession, warnings_shown: updatedWarnings }));
    }
  }, []);

  const advanceTurn = useCallback(async () => {
    if (!gameSession) return;
    
    const newTurn = (gameSession.current_turn || 1) + 1;
    const newCareerStage = getCareerStage(newTurn);
    
    const updatedSession = await GameSession.update(gameSession.id, {
      current_turn: newTurn,
      career_stage: newCareerStage
    });
    
    setGameSession(updatedSession);
    
    // Check for career warnings *after* updating the session
    checkCareerWarnings(updatedSession);
    
    // Check if game should end (after turn 25)
    if (newTurn >= 25 && !showEndGameModal) {
      setShowEndGameModal(true);
    }
  }, [gameSession, checkCareerWarnings, showEndGameModal]); // Depend on gameSession, checkCareerWarnings, showEndGameModal

  useEffect(() => {
    const initializeGameData = async () => {
      try {
        // Fetch all data in parallel
        const [cardsData, conclusionsData, sessionsData] = await Promise.all([
          HistoricalCard.list(),
          Conclusion.list(),
          GameSession.list()
        ]);

        setAllCards(cardsData);
        setAllConclusions(conclusionsData);

        // Check for an existing session
        if (sessionsData.length > 0) {
          const session = sessionsData[0];
          // Ensure new fields have defaults if loading an old session
          const sessionWithDefaults = {
            ...session,
            current_turn: session.current_turn || 1,
            career_stage: session.career_stage || getCareerStage(session.current_turn || 1),
            publications_count: session.publications_count || 0,
            book_length_publications: session.book_length_publications || 0,
            warnings_shown: session.warnings_shown || [],
          };
          setGameSession(sessionWithDefaults);
          setPlayerName(sessionWithDefaults.player_name);
          setIsGameStarted(true);

          // Check warnings for loaded session
          checkCareerWarnings(sessionWithDefaults);

          // If turn is already 25 or more, show end game modal
          if (sessionWithDefaults.current_turn >= 25) {
            setShowEndGameModal(true);
          }
        }
      } catch (error) {
        console.error("Error loading initial game data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGameData();
  }, [checkCareerWarnings]); // Add checkCareerWarnings to dependency array

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startNewGame = async () => {
    if (!playerName.trim()) return;

    const archiveCards = allCards.filter(card => card.is_archive);

    // Create multiple copies of cards to reach 100 cards for archive
    let expandedCards = [];
    while (expandedCards.length < 100) {
      expandedCards = [...expandedCards, ...archiveCards];
    }
    expandedCards = expandedCards.slice(0, 100);

    // Shuffle and separate into archive (100) and research notebook (10)
    const shuffledCards = shuffleArray(expandedCards.map(card => card.id));
    const archiveDeck = shuffledCards.slice(0, 100);
    // Ensure researchNotebook has at least some cards if archive is small
    const researchNotebook = shuffledCards.slice(100, 110);


    const newSession = await GameSession.create({
      player_name: playerName,
      prestige_score: 0,
      hand_cards: [],
      archive_deck: archiveDeck,
      research_notebook: researchNotebook,
      project_space_1: [],
      project_space_2: [],
      project_space_3: [],
      project_space_1_conclusion: null,
      project_space_2_conclusion: null,
      project_space_3_conclusion: null,
      research_transfer_amount: 5,
      notebook_draw_amount: 3,
      project_space_count: 2,
      prestige_bonus: 0,
      current_turn: 1, // New field
      career_stage: getCareerStage(1), // New field
      publications_count: 0, // New field
      book_length_publications: 0, // New field
      warnings_shown: [], // New field
    });

    setGameSession(newSession);
    setIsGameStarted(true);
  };

  const transferToResearch = async () => {
    if (!gameSession) return;
    const amount = gameSession.research_transfer_amount || 5;
    if (gameSession.archive_deck.length < amount) return;

    // Take top cards from archive
    const cardsToTransfer = gameSession.archive_deck.slice(0, amount);
    const remainingArchive = gameSession.archive_deck.slice(amount);
    
    // Add to research notebook and shuffle
    const newResearchNotebook = shuffleArray([...gameSession.research_notebook, ...cardsToTransfer]);

    const updatedSession = await GameSession.update(gameSession.id, {
      archive_deck: remainingArchive,
      research_notebook: newResearchNotebook
    });

    setGameSession(updatedSession);
    await advanceTurn(); // Advance turn after action
  };

  const drawFromResearch = async () => {
    if (!gameSession) return;
    const amount = gameSession.notebook_draw_amount || 3;

    if (gameSession.research_notebook.length < amount) return;

    // Take top cards from research notebook
    const cardsToDraw = gameSession.research_notebook.slice(0, amount);
    const remainingResearch = gameSession.research_notebook.slice(amount);
    
    const updatedSession = await GameSession.update(gameSession.id, {
      hand_cards: [...gameSession.hand_cards, ...cardsToDraw],
      research_notebook: remainingResearch
    });

    setGameSession(updatedSession);

    await advanceTurn(); // Advance turn after action
  };

  const moveCardToProject = async (cardId, spaceNumber) => {
    if (!gameSession) return;

    const spaceKey = `project_space_${spaceNumber}`;
    const currentSpace = gameSession[spaceKey] || [];
    
    // Remove card from hand and add to project space
    const updatedSession = await GameSession.update(gameSession.id, {
      hand_cards: gameSession.hand_cards.filter(id => id !== cardId),
      [spaceKey]: [...currentSpace, cardId]
    });

    setGameSession(updatedSession);
    // Removed: await advanceTurn(); - Adding cards to projects doesn't advance time
  };

  const calculatePrestige = async (spaceNumber) => {
    if (!gameSession) return;

    const spaceKey = `project_space_${spaceNumber}`;
    const conclusionKey = `project_space_${spaceNumber}_conclusion`;
    const spaceCards = gameSession[spaceKey] || [];
    const assignedConclusion = gameSession[conclusionKey];
    
    if (spaceCards.length === 0 || !assignedConclusion) {
      console.warn(`Cannot calculate prestige for space ${spaceNumber}: No cards or no conclusion assigned.`);
      return;
    }

    const cardObjects = spaceCards.map(cardId => 
      allCards.find(c => c.id === cardId)
    ).filter(Boolean);

    const conclusionObj = allConclusions.find(c => c.id === assignedConclusion);
    if (!conclusionObj) {
      console.error(`Conclusion with ID ${assignedConclusion} not found.`);
      return;
    }

    // No argument type validation needed anymore, any card can be used as evidence for any conclusion
    // const validEvidence = cardObjects.every(card => card.argument_type === conclusionObj.argument_type);
    // if (!validEvidence) {
    //   console.warn("Evidence does not match conclusion argument type. No prestige awarded.");
    //   const updatedSession = await GameSession.update(gameSession.id, {
    //     [spaceKey]: [],
    //     [conclusionKey]: null
    //   });
    //   setGameSession(updatedSession);
    //   await advanceTurn(); // Advance turn even if no prestige was awarded due to invalid evidence
    //   return;
    // }

    // Base prestige
    const basePerCard = cardObjects.length >= 5 ? 2 : 1;
    let prestige = cardObjects.length * basePerCard;

    // Bonus for matching source/author/location
    const hasThreePlusMatches = (arr) => {
      if (arr.length < 3) return false;
      const counts = {};
      for (const item of arr) {
          counts[item] = (counts[item] || 0) + 1;
          if (counts[item] >= 3) return true;
      }
      return false;
    };

    const sourceTypes = cardObjects.map(c => c.source_type).filter(Boolean);
    const authors = cardObjects.map(c => c.author).filter(Boolean);
    const locations = cardObjects.map(c => c.location).filter(Boolean);
    
    if (hasThreePlusMatches(sourceTypes)) prestige += 5;
    if (hasThreePlusMatches(authors)) prestige += 5;  
    if (hasThreePlusMatches(locations)) prestige += 5;

    // Argument/Sub-argument matching prestige
    let argumentPrestige = 0;
    cardObjects.forEach(card => {
      if (conclusionObj.argument && card.argument === conclusionObj.argument) {
        argumentPrestige += argumentPointValues[card.argument] || 0;
      }
      if (conclusionObj.sub_argument && card.sub_argument === conclusionObj.sub_argument) {
        argumentPrestige += subArgumentPointValues[card.sub_argument] || 0;
      }
    });
    prestige += argumentPrestige;

    // Add prestige bonus from upgrades
    prestige += gameSession.prestige_bonus || 0;

    // Track publication statistics
    const isBookLength = cardObjects.length >= 5;
    const updatedSession = await GameSession.update(gameSession.id, {
      prestige_score: gameSession.prestige_score + prestige,
      publications_count: (gameSession.publications_count || 0) + 1, // Increment publication count
      book_length_publications: (gameSession.book_length_publications || 0) + (isBookLength ? 1 : 0), // Increment book-length if applicable
      [spaceKey]: [], // Clear the project space after calculating prestige
      [conclusionKey]: null // Clear the conclusion after calculation
    });

    setGameSession(updatedSession);
    
    // Show prestige animation and then upgrade modal
    setPrestigeAnimation({ amount: prestige, space: spaceNumber });
    setTimeout(() => {
      setPrestigeAnimation(null);
      setShowUpgradeModal(true);
    }, 2500);
    
    await advanceTurn(); // Advance turn after action
  };

  const assignConclusion = async (conclusionId, spaceNumber) => {
    if (!gameSession) return;
    
    const conclusionKey = `project_space_${spaceNumber}_conclusion`;
    const updatedSession = await GameSession.update(gameSession.id, {
      [conclusionKey]: conclusionId
    });
    
    setGameSession(updatedSession);
    // Removed: await advanceTurn(); - Assigning conclusions doesn't advance time
  };

  const handleUpgrade = async (upgradeType) => {
    if (!gameSession) return;
    
    let updateData = {};
    switch (upgradeType) {
      case 'research_draw':
        updateData = { research_transfer_amount: 10 };
        break;
      case 'notebook_draw':
        updateData = { notebook_draw_amount: 5 };
        break;
      case 'project_space':
        updateData = { project_space_count: 3 };
        break;
      case 'prestige':
        updateData = { prestige_bonus: (gameSession.prestige_bonus || 0) + 2 };
        break;
      default:
        break;
    }
    
    const updatedSession = await GameSession.update(gameSession.id, updateData);
    setGameSession(updatedSession);
    setShowUpgradeModal(false);
  };

  const resetGame = async () => {
    if (gameSession) {
      await GameSession.delete(gameSession.id);
      setGameSession(null);
      setIsGameStarted(false);
      setPlayerName("");
      setShowCareerWarning(false); // Reset warning state
      setCareerWarningMessage("");
      setShowEndGameModal(false); // Reset end game state
    }
  };

  const continueGame = () => {
    setShowEndGameModal(false);
    // Game continues beyond turn 25, player chooses to play into emeritus
  };

  const endGame = () => {
    setShowEndGameModal(false);
    // Could redirect to a final score screen or simply reset
    resetGame();
  };

  // --- New functions for drag-back functionality ---

  const clearConclusionFromSpace = useCallback(async (spaceNumber) => {
    if (!gameSession || !spaceNumber) return;
    const conclusionKey = `project_space_${spaceNumber}_conclusion`;
    const updatedSession = await GameSession.update(gameSession.id, {
        [conclusionKey]: null
    });
    setGameSession(updatedSession);
  }, [gameSession]);

  const removeCardFromProject = useCallback(async (cardId, fromSpaceNumber) => {
    if (!gameSession || !cardId || !fromSpaceNumber) return;

    const spaceKey = `project_space_${fromSpaceNumber}`;
    const currentSpaceCards = gameSession[spaceKey] || [];

    // Remove card from project space and add to hand
    const updatedSession = await GameSession.update(gameSession.id, {
        [spaceKey]: currentSpaceCards.filter(id => id !== cardId),
        hand_cards: [...gameSession.hand_cards, cardId]
    });
    setGameSession(updatedSession);
  }, [gameSession]);

  // --- End new functions ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-stone-300">Loading historical documents and conclusions...</p>
        </div>
      </div>
    );
  }

  if (!isGameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="colonial-paper max-w-md w-full parchment-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-stone-900 text-2xl">
              Welcome to Playing With the Past
            </CardTitle>
            <p className="text-stone-600 mt-2">
              Build historical arguments using primary sources from the American Revolution
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Enter your name:
              </label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Colonial Scholar"
                className="bg-white border-stone-400"
              />
            </div>
            <Button
              onClick={startNewGame}
              disabled={!playerName.trim()}
              className="w-full revolution-accent hover:bg-red-800 text-yellow-100"
            >
              Begin Historical Research
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const projectSpaces = Array.from({ length: gameSession?.project_space_count || 2 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-yellow-100">Playing With the Past</h1>
              <p className="text-lg text-amber-200 italic">The American Revolution</p>
            </div>
            <Badge className="bg-amber-600 text-white">
              Scholar: {gameSession?.player_name}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg px-4 py-2">
              <Trophy className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-lg">
                {gameSession?.prestige_score || 0}
              </span>
              <span className="text-yellow-100 text-sm">prestige</span>
            </div>
            
            <Button
              variant="outline"
              onClick={resetGame}
              className="border-stone-600 text-stone-300 hover:bg-stone-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>
        </div>

        {/* Turn Counter Bar */}
        {gameSession && (
          <div className="mb-6 colonial-paper border-2 border-amber-600 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${careerStages[gameSession.career_stage || 'graduate_student']?.color || 'bg-blue-500'} rounded-full flex items-center justify-center`}>
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900">{careerStages[gameSession.career_stage || 'graduate_student']?.name || 'Graduate Student'}</h3>
                    <p className="text-xs text-stone-600">Academic Year {gameSession.current_turn || 1} of 25</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-stone-800">{gameSession.publications_count || 0}</div>
                    <div className="text-xs text-stone-600">Publications</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-stone-800">{gameSession.book_length_publications || 0}</div>
                    <div className="text-xs text-stone-600">Book-Length</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-stone-600 text-white mb-1">
                  Turn {gameSession.current_turn || 1}/25
                </Badge>
                <div className="text-xs text-stone-600 italic">
                  {(() => {
                    const turn = gameSession.current_turn || 1;
                    const publications = gameSession.publications_count || 0;
                    const bookLength = gameSession.book_length_publications || 0;
                    
                    if (turn <= 5) return "Focus on dissertation research";
                    if (turn <= 10) return publications > 0 ? "Building publication record" : "Need to publish soon!";
                    if (turn <= 15) return bookLength > 0 ? "On track for tenure" : "Book publication required!";
                    if (turn <= 20) return "Approaching tenure decision";
                    if (turn <= 25) return "Final years before retirement";
                    return "Extended career - keep researching!";
                  })()}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-stone-700">Career Progress</span>
                <span className="text-xs text-stone-600">
                  {Math.round(Math.min(((gameSession.current_turn || 1) / 25) * 100, 100))}%
                </span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((gameSession.current_turn || 1) / 25) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Prestige Animation */}
        <AnimatePresence>
          {prestigeAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.5 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl p-6 text-center shadow-2xl">
                <Trophy className="w-12 h-12 text-white mx-auto mb-2" />
                <h3 className="text-white font-bold text-xl">Argument Published!</h3>
                <p className="text-yellow-100 text-2xl font-bold">+{prestigeAnimation.amount} Prestige</p>
                <p className="text-yellow-200 text-sm">Project Space {prestigeAnimation.space}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Career Warning Modal */}
        <AnimatePresence>
          {showCareerWarning && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-full max-w-md colonial-paper rounded-xl p-6 border-2 border-red-600"
              >
                <div className="text-center">
                  <h2 className="text-xl font-bold text-red-700 mb-4">Academic Career Alert</h2>
                  <p className="text-stone-700 whitespace-pre-line mb-6">{careerWarningMessage}</p>
                  <Button 
                    onClick={() => setShowCareerWarning(false)}
                    className="revolution-accent hover:bg-red-800 text-yellow-100"
                  >
                    I Understand
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* End Game Modal */}
        <AnimatePresence>
          {showEndGameModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-full max-w-lg colonial-paper rounded-xl p-6 border-2 border-amber-600"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-stone-900 mb-4">Academic Career Complete</h2>
                  <p className="text-stone-700 mb-2">
                    Congratulations! You've reached retirement after 25 years in academia.
                  </p>
                  <div className="bg-stone-100 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-bold text-stone-800">{gameSession?.prestige_score || 0}</span>
                        <div className="text-stone-600">Final Prestige</div>
                      </div>
                      <div>
                        <span className="font-bold text-stone-800">{gameSession?.publications_count || 0}</span>
                        <div className="text-stone-600">Total Publications</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-stone-600 mb-6 text-sm">
                    Would you like to continue your research into emeritus years, or conclude your career?
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={continueGame}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Continue Research
                    </Button>
                    <Button 
                      onClick={endGame}
                      variant="outline"
                      className="flex-1 border-stone-600 text-stone-700"
                    >
                      Retire
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Upgrade Modal */}
        <AnimatePresence>
          {showUpgradeModal && gameSession && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-full max-w-2xl colonial-paper rounded-xl p-6 border-2 border-amber-600 parchment-glow"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-stone-900 mb-2">Research Breakthrough!</h2>
                  <p className="text-stone-600 mb-6">Your work has unlocked new possibilities. Choose an upgrade to enhance your research capabilities.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleUpgrade('research_draw')}
                    disabled={gameSession.research_transfer_amount === 10}
                    className="p-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-left disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Library className="w-6 h-6 text-blue-600" />
                      <h3 className="font-bold text-stone-800">Advanced Archival Methods</h3>
                    </div>
                    <p className="text-sm text-stone-600">Upgrade "Add to Research" to transfer <span className="font-bold">10 cards</span> from the Archive.</p>
                    {gameSession.research_transfer_amount === 10 && <Badge className="mt-2">Acquired</Badge>}
                  </button>
                  
                  <button
                    onClick={() => handleUpgrade('notebook_draw')}
                    disabled={gameSession.notebook_draw_amount === 5}
                    className="p-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-left disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-6 h-6 text-green-600" />
                      <h3 className="font-bold text-stone-800">Efficient Study Habits</h3>
                    </div>
                    <p className="text-sm text-stone-600">Upgrade "Draw" to pull <span className="font-bold">5 cards</span> from your Research Notebook.</p>
                    {gameSession.notebook_draw_amount === 5 && <Badge className="mt-2">Acquired</Badge>}
                  </button>
                  
                  <button
                    onClick={() => handleUpgrade('project_space')}
                    disabled={gameSession.project_space_count === 3}
                    className="p-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-left disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <PlusSquare className="w-6 h-6 text-purple-600" />
                      <h3 className="font-bold text-stone-800">Expand Workspace</h3>
                    </div>
                    <p className="text-sm text-stone-600">Add a <span className="font-bold">third Project Space</span> to the board.</p>
                    {gameSession.project_space_count === 3 && <Badge className="mt-2">Acquired</Badge>}
                  </button>

                  <button
                    onClick={() => handleUpgrade('prestige')}
                    className="p-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-left transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <ArrowUp className="w-6 h-6 text-amber-600" />
                      <h3 className="font-bold text-stone-800">Increase Influence</h3>
                    </div>
                    <p className="text-sm text-stone-600">Gain a permanent <span className="font-bold">+2 Prestige bonus</span> for all future published arguments.</p>
                    {gameSession.prestige_bonus > 0 && <Badge className="mt-2">Level {gameSession.prestige_bonus / 2}</Badge>}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-4 gap-6"> {/* Changed from lg:grid-cols-5 to lg:grid-cols-4 */}
          {/* Combined Archive and Conclusions Board */}
          <div className="lg:col-span-1">
            <Card className="colonial-paper border-2 border-amber-600 parchment-glow">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-stone-900">
                  <Archive className="w-6 h-6 text-amber-700" />
                  Research Materials
                </CardTitle>
                <p className="text-sm text-stone-600">
                  Primary sources and historical arguments
                </p>
              </CardHeader>
              
              <CardContent 
                className="space-y-6"
                onDrop={(e) => {
                  e.preventDefault();
                  // For conclusions dragged back from a project space
                  const spaceNumForConclusion = e.dataTransfer.getData("clear-conclusion");
                  if (spaceNumForConclusion) {
                    clearConclusionFromSpace(parseInt(spaceNumForConclusion));
                  }
                  // Optionally handle cards dragged here to return to hand, or another archive, etc.
                  // For now, cards dropped here will just disappear from play if not handled by PlayerHand.
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Archive Section */}
                <div className="text-center space-y-4">
                  <div>
                    <h4 className="font-semibold text-stone-800 mb-2">Colonial Archive</h4>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <motion.div
                        className="relative w-20 h-24"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 rounded border border-amber-600 transform rotate-2 shadow-md"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 rounded border border-amber-600 shadow-lg flex items-center justify-center">
                          <div className="text-center">
                            <BookOpen className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                            <Badge className="bg-amber-700 text-white text-xs">
                              {gameSession?.archive_deck?.length || 0}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                      <Button
                        onClick={transferToResearch}
                        disabled={(gameSession?.archive_deck?.length || 0) < (gameSession?.research_transfer_amount || 5)}
                        className="revolution-accent hover:bg-red-800 text-yellow-100 text-xs px-3 py-2"
                      >
                        <ArrowRight className="w-3 h-3 mr-1" />
                        Add {gameSession?.research_transfer_amount || 5}
                      </Button>
                    </div>
                    <div className="space-y-1 text-xs text-stone-600">
                      <p>Archive: {gameSession?.archive_deck?.length || 0} cards</p>
                      <p>Research: {gameSession?.research_notebook?.length || 0} cards</p>
                    </div>
                  </div>
                </div>

                {/* Conclusions Section */}
                <div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-purple-700" />
                    <h4 className="font-semibold text-stone-800">Historical Arguments</h4>
                  </div>
                  <p className="text-xs text-stone-600 text-center mb-4">
                    Drag conclusions to project spaces
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {allConclusions.map((conclusion, index) => (
                        <motion.div
                          key={conclusion.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("conclusion", conclusion.id)}
                          className="cursor-move"
                        >
                          <ConclusionTile 
                            conclusion={conclusion}
                            onClick={() => {}}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Spaces and Hand */}
          <div className="lg:col-span-3">
            {/* Project Spaces */}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${projectSpaces.length === 3 ? "lg:grid-cols-3" : ""} gap-4 mb-6`}>
              {projectSpaces.map(spaceNumber => (
                <ProjectSpace
                  key={spaceNumber}
                  spaceNumber={spaceNumber}
                  cards={gameSession?.[`project_space_${spaceNumber}`] || []}
                  allCards={allCards}
                  allConclusions={allConclusions}
                  assignedConclusion={gameSession?.[`project_space_${spaceNumber}_conclusion`]}
                  onCalculatePrestige={calculatePrestige}
                  onDropCard={moveCardToProject}
                  onAssignConclusion={assignConclusion}
                  // Props for drag-back / removal
                  onRemoveCardFromProject={removeCardFromProject}
                  onRemoveConclusionFromProject={clearConclusionFromSpace}
                />
              ))}
            </div>

            {/* Player Hand */}
            <PlayerHand
              handCards={gameSession?.hand_cards || []}
              researchNotebookCount={gameSession?.research_notebook?.length || 0}
              allCards={allCards}
              onDrawFromResearch={drawFromResearch}
              drawAmount={gameSession?.notebook_draw_amount || 3}
              // Prop for handling cards dropped back into hand from project spaces
              onDropCardFromProject={removeCardFromProject}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
