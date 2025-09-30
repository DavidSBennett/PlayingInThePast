import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hand, Users } from "lucide-react";
import HistoricalCard from "./HistoricalCard";

export default function PlayerHand({ 
  handCards, 
  researchNotebookCount, 
  allCards,
  onDrawFromResearch,
  onDropCard, // Added onDropCard prop
  maxHandSize = 10,
  drawAmount = 3
}) {
  const handCardObjects = handCards.map(cardId => 
    allCards.find(c => c.id === cardId)
  ).filter(Boolean);

  const handleCardDragStart = (e, cardId) => {
    e.dataTransfer.setData("text/plain", cardId);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedCardId = e.dataTransfer.getData("project-card"); // Card ID from a project space
    const sourceSpace = e.dataTransfer.getData("source-space"); // ID of the project space/conclusion source
    const clearConclusion = e.dataTransfer.getData("clear-conclusion"); // Flag if dropping a conclusion

    // Only process if we have a valid card ID and the onDropCard handler is provided
    if (draggedCardId && onDropCard) {
      // Call the parent's handler to move the card back to the hand
      onDropCard({ 
        cardId: draggedCardId, 
        sourceSpace: sourceSpace || null, // Pass source space to allow parent to remove from correct location
        clearConclusion: clearConclusion === 'true' // Convert string to boolean
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Essential to allow a drop
  };

  return (
    <Card className="colonial-paper border-2 border-stone-600">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-stone-900">
          <span className="flex items-center gap-2">
            <Hand className="w-5 h-5 text-amber-700" />
            Research Hand
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-600 text-amber-700">
              {handCardObjects.length}/{maxHandSize}
            </Badge>
            <Button
              size="sm"
              onClick={onDrawFromResearch}
              disabled={handCardObjects.length + drawAmount > maxHandSize || researchNotebookCount < drawAmount}
              className="revolution-accent hover:bg-red-800 text-yellow-100"
            >
              <Users className="w-3 h-3 mr-1" />
              Draw {drawAmount}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div 
          className="min-h-[200px] border-2 border-dashed border-stone-400 rounded-lg p-3 hover:border-amber-600 hover:bg-amber-50 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <AnimatePresence>
            {handCardObjects.length === 0 ? (
              <div className="flex items-center justify-center h-full text-stone-500">
                <div className="text-center">
                  <Hand className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Draw cards from your research notebook</p>
                  <p className="text-xs text-stone-400 mt-1">Cards from projects can be dragged back here</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {handCardObjects.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    draggable
                    onDragStart={(e) => handleCardDragStart(e, card.id)}
                    className="cursor-move"
                  >
                    <HistoricalCard 
                      card={card}
                      onClick={() => {}}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-stone-600">
            Research Notebook: {researchNotebookCount} cards remaining
          </p>
          <p className="text-xs text-stone-500 mt-1">
            Drag cards between your hand and project spaces. Double-click conclusions to remove them.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
