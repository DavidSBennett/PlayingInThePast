
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, CheckCircle, AlertCircle, Target, Tags, Sparkles } from "lucide-react";
import HistoricalCard from "./HistoricalCard";
import ConclusionTile from "./ConclusionTile";

const argumentPointValues = { 'C': 6, 'A': 3, 'B': 1 };
const subArgumentPointValues = { 'E': 6, 'P': 3, 'S': 1 };

export default function ProjectSpace({
  spaceNumber,
  cards,
  allCards,
  allConclusions,
  assignedConclusion,
  onCalculatePrestige,
  onDropCard,
  onMoveCardToHand,
  onAssignConclusion,
  onClearConclusion,
  onRemoveCardFromProject, // New prop
  prestigeEarned = 0
}) {
  const cardObjects = cards.map(cardId => allCards.find(c => c.id === cardId)).filter(Boolean);
  const conclusionObj = assignedConclusion ? allConclusions.find(c => c.id === assignedConclusion) : null;

  const calculateProjectStats = () => {
    // If no cards or no conclusion, return 0 for all stats but mark as valid (no longer invalidates the space)
    if (cardObjects.length === 0 || !conclusionObj) return { base: 0, bonus: 0, argument: 0, total: 0, validEvidence: true };

    const basePerCard = cardObjects.length >= 5 ? 2 : 1;
    const base = cardObjects.length * basePerCard;

    const hasThreePlusMatches = (arr) => {
      if (arr.length < 3) return false;
      const counts = {};
      for (const item of arr) {
          if (item) { // Only count non-null/non-undefined items
            counts[item] = (counts[item] || 0) + 1;
            if (counts[item] >= 3) return true;
          }
      }
      return false;
    };
    const sourceTypes = cardObjects.map(c => c.source_type);
    const authors = cardObjects.map(c => c.author).filter(Boolean);
    const locations = cardObjects.map(c => c.location).filter(Boolean);
    let bonus = 0;
    if (hasThreePlusMatches(sourceTypes)) bonus += 5;
    if (hasThreePlusMatches(authors)) bonus += 5;
    if (hasThreePlusMatches(locations)) bonus += 5;
    
    let argument = 0;
    cardObjects.forEach(card => {
      if (conclusionObj.argument && card.argument === conclusionObj.argument) {
        argument += argumentPointValues[card.argument] || 0;
      }
      if (conclusionObj.sub_argument && card.sub_argument === conclusionObj.sub_argument) {
        argument += subArgumentPointValues[card.sub_argument] || 0;
      }
    });

    const total = base + bonus + argument;
    // validEvidence is now always true, as the concept of "invalid evidence" for publishing is removed
    return { base, bonus, argument, total, validEvidence: true }; 
  };

  const stats = calculateProjectStats();

  const handleDrop = (e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    const conclusionId = e.dataTransfer.getData("conclusion");

    if (cardId) {
      onDropCard(cardId, spaceNumber);
    } else if (conclusionId) {
      onAssignConclusion(conclusionId, spaceNumber);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleConclusionDoubleClick = () => {
    if (assignedConclusion) {
      onClearConclusion(spaceNumber);
    }
  };

  const handleConclusionDragStart = (e) => {
    if (assignedConclusion) {
      e.dataTransfer.setData("clear-conclusion", spaceNumber.toString());
      e.dataTransfer.setData("conclusion", assignedConclusion); // Also pass the conclusion ID itself
    }
  };

  return (
    <Card 
      className="colonial-paper border-2 border-stone-600 min-h-[400px] flex flex-col"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-stone-900">
          <span className="flex items-center gap-2">
            <div className="w-6 h-6 revolution-accent rounded-full flex items-center justify-center text-xs text-yellow-100 font-bold">
              {spaceNumber}
            </div>
            Project Space {spaceNumber}
          </span>
          <Badge variant="outline" className="border-amber-600 text-amber-700">
            {cardObjects.length} evidence
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Conclusion Tile Drop Zone */}
        <div
          className="border-2 border-dashed border-purple-400 rounded-lg p-3 mb-4 min-h-[100px] transition-colors hover:border-purple-600 hover:bg-purple-50"
        >
          {conclusionObj ? (
            <div
              draggable
              onDragStart={handleConclusionDragStart}
              onDoubleClick={handleConclusionDoubleClick}
              className="cursor-pointer"
            >
              <ConclusionTile
                conclusion={conclusionObj}
                isSelected={true}
                onClick={() => {}}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-purple-600">
              <div className="text-center">
                <Target className="w-6 h-6 mx-auto mb-1" />
                <p className="text-xs">Drop conclusion tile here</p>
              </div>
            </div>
          )}
        </div>

        {/* Evidence Cards Drop Zone */}
        <div
          className="flex-1 min-h-[180px] border-2 border-dashed border-stone-400 rounded-lg p-3 mb-4 transition-colors hover:border-amber-600 hover:bg-amber-50"
        >
          <AnimatePresence>
            {cardObjects.length === 0 ? (
              <div className="flex items-center justify-center h-full text-stone-500">
                <div className="text-center">
                  <Plus className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Drop evidence cards here</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {cardObjects.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    draggable
                    onDragStart={(e) => onRemoveCardFromProject(card.id, spaceNumber, e)}
                    className="cursor-move"
                  >
                    <HistoricalCard
                      card={card}
                      showDetails={false}
                      className="transform scale-90"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Argument Analysis */}
        {cardObjects.length > 0 && conclusionObj && (
          <div className="mb-4 p-3 bg-stone-100 rounded-lg border border-stone-300">
            <h4 className="font-semibold text-stone-800 mb-2 text-sm">Argument Analysis</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Base evidence ({cardObjects.length >= 5 ? '2x' : '1x'}):</span>
                <span className="font-bold text-stone-800">{stats.base} points</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Context bonus:</span>
                <div className="flex items-center gap-1">
                  {stats.bonus > 0 ? <Sparkles className="w-3 h-3 text-amber-500" /> : <AlertCircle className="w-3 h-3 text-gray-400" />}
                  <span className="font-bold text-stone-800">+{stats.bonus}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Argument bonus:</span>
                 <div className="flex items-center gap-1">
                  {stats.argument > 0 ? <Tags className="w-3 h-3 text-blue-500" /> : <AlertCircle className="w-3 h-3 text-gray-400" />}
                  <span className="font-bold text-stone-800">+{stats.argument}</span>
                </div>
              </div>
              <hr className="my-1" />
              <div className="flex items-center justify-between font-bold">
                <span className="text-stone-700">Potential prestige:</span>
                <span className="text-red-700">{stats.total} points</span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={() => onCalculatePrestige(spaceNumber)}
          disabled={cardObjects.length === 0 || !conclusionObj} // Only disable if no cards or no conclusion
          className="w-full revolution-accent hover:bg-red-800 text-yellow-100 disabled:opacity-50"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Publish Argument ({stats.total} prestige)
        </Button>

        {prestigeEarned > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-2 text-center"
          >
            <Badge className="bg-green-600 text-white">
              +{prestigeEarned} prestige earned!
            </Badge>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
