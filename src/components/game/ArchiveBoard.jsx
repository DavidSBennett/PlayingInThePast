
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Archive, ArrowRight, BookOpen } from "lucide-react";

export default function ArchiveBoard({ 
  archiveDeckCount, 
  researchNotebookCount,
  onTransferToResearch, 
  isTransferring = false,
  transferAmount = 5
}) {
  return (
    <Card className="colonial-paper border-2 border-amber-600 parchment-glow">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-stone-900">
          <Archive className="w-6 h-6 text-amber-700" />
          Colonial Archive
        </CardTitle>
        <p className="text-sm text-stone-600">
          Primary sources from the American Revolution
        </p>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <motion.div
          className="relative w-32 h-40 mx-auto"
          whileHover={{ scale: 1.05 }}
        >
          {/* Stack of cards visual effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg border-2 border-amber-600 transform rotate-2 shadow-md"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg border-2 border-amber-600 transform -rotate-1 shadow-md"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-600 shadow-lg flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-amber-700 mx-auto mb-2" />
              <Badge className="bg-amber-700 text-white text-xs">
                {archiveDeckCount} left
              </Badge>
            </div>
          </div>
        </motion.div>
        
        <div className="space-y-2">
          <p className="text-xs text-stone-600">
            Archive: {archiveDeckCount} cards
          </p>
          <p className="text-xs text-stone-600">
            Research Notebook: {researchNotebookCount} cards
          </p>
        </div>
        
        <Button
          onClick={onTransferToResearch}
          disabled={archiveDeckCount < transferAmount || isTransferring}
          className="w-full revolution-accent hover:bg-red-800 text-yellow-100"
        >
          {isTransferring ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-100 mr-2"></div>
              Transferring...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              Add {transferAmount} to Research
            </>
          )}
        </Button>
        
        <p className="text-xs text-stone-500">
          Moves {transferAmount} cards from archive to research notebook
        </p>
      </CardContent>
    </Card>
  );
}
