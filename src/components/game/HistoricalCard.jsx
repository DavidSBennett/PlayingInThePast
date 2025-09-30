import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Newspaper, BookOpen, Calendar, MapPin, User } from "lucide-react";

const sourceIcons = {
  letter: FileText,
  newspaper: Newspaper,
  book: BookOpen
};

const sourceColors = {
  letter: "bg-blue-600 text-white",
  newspaper: "bg-gray-700 text-white",
  book: "bg-green-700 text-white"
};

const argumentPointValues = { 'C': 6, 'A': 3, 'B': 1 };
const subArgumentPointValues = { 'E': 6, 'P': 3, 'S': 1 };

export default function HistoricalCard({ card, onClick, showDetails = true, className = "" }) {
  const SourceIcon = sourceIcons[card.source_type];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer relative ${className}`}
      onClick={onClick}
    >
      <Card className="colonial-paper border-2 border-amber-600 hover:border-red-600 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 revolution-accent rounded-full flex items-center justify-center">
                <span className="text-yellow-100 font-bold text-sm">#{card.sequence_number}</span>
              </div>
              <Badge className={`${sourceColors[card.source_type]} text-xs`}>
                <SourceIcon className="w-3 h-3 mr-1" />
                {card.source_type}
              </Badge>
            </div>
          </div>
          <h3 className="font-bold text-stone-900 text-sm leading-tight">{card.title}</h3>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Document Image */}
          {card.image_url && (
            <div className="mb-3">
              <img 
                src={card.image_url} 
                alt={card.title}
                className="w-full h-24 object-cover rounded border border-stone-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <Calendar className="w-3 h-3" />
              <span>{card.date}</span>
            </div>
            
            {card.author && (
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <User className="w-3 h-3" />
                <span>{card.author}</span>
              </div>
            )}
            
            {card.location && (
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <MapPin className="w-3 h-3" />
                <span>{card.location}</span>
              </div>
            )}
            
            {showDetails && card.content && (
              <p className="text-xs text-stone-700 mt-2 line-clamp-3 italic">
                "{card.content}"
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Argument and Sub-Argument Point Display */}
      <div className="absolute bottom-2 left-2 flex items-end gap-1">
        {card.argument && (
          <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full border-2 border-black shadow-md" title={`Argument: ${card.argument} (+${argumentPointValues[card.argument]} on match)`}>
            <span className="text-black font-bold text-lg">{card.argument}</span>
          </div>
        )}
        {card.sub_argument && (
          <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full border border-black shadow-sm" title={`Sub-Argument: ${card.sub_argument} (+${subArgumentPointValues[card.sub_argument]} on match)`}>
            <span className="text-black font-semibold text-sm">{card.sub_argument}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}