import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, ScrollText } from "lucide-react";
import ConclusionTile from "./ConclusionTile";

export default function ConclusionBoard({ conclusions }) {
  const handleConclusionDragStart = (e, conclusionId) => {
    e.dataTransfer.setData("conclusion", conclusionId);
  };

  return (
    <Card className="colonial-paper border-2 border-purple-600 parchment-glow">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-stone-900">
          <Target className="w-6 h-6 text-purple-700" />
          Historical Arguments
        </CardTitle>
        <p className="text-sm text-stone-600">
          Drag conclusions to project spaces to build arguments
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {conclusions.map((conclusion, index) => (
              <motion.div
                key={conclusion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                draggable
                onDragStart={(e) => handleConclusionDragStart(e, conclusion.id)}
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
        
        <div className="mt-4 text-center">
          <p className="text-xs text-stone-500">
            Match conclusions with appropriate evidence cards for maximum prestige
          </p>
        </div>
      </CardContent>
    </Card>
  );
}