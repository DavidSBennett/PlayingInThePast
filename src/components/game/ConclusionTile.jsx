import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Tags } from "lucide-react";

export default function ConclusionTile({ conclusion, onClick, isSelected = false, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      <Card className={`bg-purple-100 border-purple-600 text-purple-800 border-2 transition-all duration-300 shadow-md hover:shadow-lg ${
        isSelected ? 'ring-2 ring-amber-500 ring-offset-2' : ''
      }`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4" />
              <Badge variant="outline" className="text-xs">
                Conclusion
              </Badge>
            </div>
          </div>
          <CardTitle className="text-sm font-bold leading-tight">
            {conclusion.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-xs opacity-80 line-clamp-3 mb-2">
            {conclusion.description}
          </p>
          
          {(conclusion.argument || conclusion.sub_argument) && (
            <div className="flex items-center gap-1 text-xs font-medium">
              <Tags className="w-3 h-3"/>
              {conclusion.argument && <span className="font-bold">{conclusion.argument}</span>}
              {conclusion.argument && conclusion.sub_argument && <span>/</span>}
              {conclusion.sub_argument && <span className="font-semibold">{conclusion.sub_argument}</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}