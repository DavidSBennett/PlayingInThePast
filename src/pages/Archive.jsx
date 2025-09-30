
import React, { useState, useEffect } from "react";
import { HistoricalCard as HistoricalCardEntity } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Archive as ArchiveIcon, Search, Filter } from "lucide-react"; // Renamed Archive to ArchiveIcon
import { motion, AnimatePresence } from "framer-motion";

import HistoricalCard from "../components/game/HistoricalCard";

export default function Archive() {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    source_type: "",
    sequence_range: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [cards, filters]);

  const loadCards = async () => {
    const data = await HistoricalCardEntity.list("sequence_number");
    setCards(data);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...cards];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(card =>
        card.title.toLowerCase().includes(search) ||
        card.content.toLowerCase().includes(search) ||
        card.author?.toLowerCase().includes(search)
      );
    }

    if (filters.source_type) {
      filtered = filtered.filter(card => card.source_type === filters.source_type);
    }

    if (filters.sequence_range) {
      filtered = filtered.filter(card => {
        const seq = card.sequence_number;
        switch (filters.sequence_range) {
          case "early": return seq <= 7;
          case "middle": return seq >= 8 && seq <= 14;
          case "late": return seq >= 15;
          default: return true;
        }
      });
    }

    setFilteredCards(filtered);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      source_type: "",
      sequence_range: ""
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 revolution-accent rounded-lg flex items-center justify-center parchment-glow">
            <ArchiveIcon className="w-6 h-6 text-yellow-100" /> {/* Changed to ArchiveIcon */}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-yellow-100">Historical Archive</h1>
            <p className="text-stone-400 mt-1">Primary sources from the American Revolution</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="bg-amber-600 text-white">
              {cards.length} documents
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="colonial-paper rounded-xl p-6 border-2 border-amber-600 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-amber-700" />
              <h3 className="font-semibold text-stone-900">Research Filters</h3>
            </div>
            {Object.values(filters).some(v => v) && (
              <button
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
              <Input
                placeholder="Search documents..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 bg-white border-stone-400"
              />
            </div>

            <Select
              value={filters.source_type}
              onValueChange={(value) => setFilters(prev => ({ ...prev, source_type: value }))}
            >
              <SelectTrigger className="bg-white border-stone-400">
                <SelectValue placeholder="Source Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Sources</SelectItem>
                <SelectItem value="letter">Letters</SelectItem>
                <SelectItem value="newspaper">Newspapers</SelectItem>
                <SelectItem value="book">Books</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sequence_range}
              onValueChange={(value) => setFilters(prev => ({ ...prev, sequence_range: value }))}
            >
              <SelectTrigger className="bg-white border-stone-400">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Periods</SelectItem>
                <SelectItem value="early">Early (1-7)</SelectItem>
                <SelectItem value="middle">Middle (8-14)</SelectItem>
                <SelectItem value="late">Late (15-20)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-400">
            Showing <span className="text-yellow-100 font-semibold">{filteredCards.length}</span> of <span className="text-yellow-100 font-semibold">{cards.length}</span> documents
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-stone-400">Loading historical documents...</p>
          </div>
        )}

        {/* Cards Grid */}
        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            layout
          >
            {filteredCards.map((card) => (
              <HistoricalCard
                key={card.id}
                card={card}
                onClick={() => setSelectedCard(card)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {!isLoading && filteredCards.length === 0 && (
          <div className="text-center py-12">
            <ArchiveIcon className="w-16 h-16 text-stone-600 mx-auto mb-4" /> {/* Changed to ArchiveIcon */}
            <h3 className="text-xl font-semibold text-stone-300 mb-2">No documents found</h3>
            <p className="text-stone-500">Try adjusting your search filters</p>
          </div>
        )}

        {/* Card Detail Modal */}
        {selectedCard && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-2xl w-full colonial-paper rounded-xl p-6 border-2 border-amber-600 max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-bold text-stone-900">{selectedCard.title}</h2>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="text-stone-600 hover:text-stone-800 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-stone-700">Date:</span>
                    <p className="text-stone-600">{selectedCard.date}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-700">Sequence:</span>
                    <p className="text-stone-600">#{selectedCard.sequence_number}</p>
                  </div>
                  {selectedCard.author && (
                    <div>
                      <span className="font-semibold text-stone-700">Author:</span>
                      <p className="text-stone-600">{selectedCard.author}</p>
                    </div>
                  )}
                  {selectedCard.location && (
                    <div>
                      <span className="font-semibold text-stone-700">Location:</span>
                      <p className="text-stone-600">{selectedCard.location}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-stone-700 mb-2">Document Content:</h3>
                  <p className="text-stone-600 italic bg-stone-100 p-4 rounded-lg">
                    "{selectedCard.content}"
                  </p>
                </div>
                
                {selectedCard.significance && (
                  <div>
                    <h3 className="font-semibold text-stone-700 mb-2">Historical Significance:</h3>
                    <p className="text-stone-600">{selectedCard.significance}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
