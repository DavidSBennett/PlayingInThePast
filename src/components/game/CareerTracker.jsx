import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpen, Clock, Trophy } from "lucide-react";

const careerStages = {
  graduate_student: { name: "Graduate Student", color: "bg-blue-500", icon: GraduationCap },
  postdoc: { name: "Postdoc", color: "bg-indigo-500", icon: BookOpen },
  assistant_professor: { name: "Assistant Professor", color: "bg-purple-500", icon: BookOpen },
  associate_professor: { name: "Associate Professor", color: "bg-amber-600", icon: Trophy },
  full_professor: { name: "Full Professor", color: "bg-green-600", icon: Trophy },
  emeritus: { name: "Professor Emeritus", color: "bg-gray-600", icon: Trophy }
};

export default function CareerTracker({ gameSession }) {
  const currentStage = careerStages[gameSession?.career_stage || 'graduate_student'];
  const StageIcon = currentStage.icon;
  
  const getCareerProgress = () => {
    const turn = gameSession?.current_turn || 1;
    return Math.min((turn / 25) * 100, 100);
  };

  const getTurnMessage = () => {
    const turn = gameSession?.current_turn || 1;
    const publications = gameSession?.publications_count || 0;
    const bookLength = gameSession?.book_length_publications || 0;
    
    if (turn <= 5) return "Focus on your dissertation research";
    if (turn <= 10) return publications > 0 ? "Building your publication record" : "Need to publish soon!";
    if (turn <= 15) return bookLength > 0 ? "On track for tenure" : "Book publication required!";
    if (turn <= 20) return "Approaching tenure decision";
    if (turn <= 25) return "Final years before retirement";
    return "Extended career - keep researching!";
  };

  return (
    <Card className="colonial-paper border-2 border-amber-600">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-stone-900">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${currentStage.color} rounded-full flex items-center justify-center`}>
              <StageIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg">Academic Career</span>
          </div>
          <Badge className="bg-stone-600 text-white">
            Turn {gameSession?.current_turn || 1}/25
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-stone-700">Career Progress</span>
            <span className="text-xs text-stone-600">{Math.round(getCareerProgress())}%</span>
          </div>
          <Progress value={getCareerProgress()} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={`${currentStage.color} text-white text-xs`}>
              {currentStage.name}
            </Badge>
          </div>
          
          <p className="text-xs text-stone-600 italic">
            {getTurnMessage()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="text-center">
            <div className="font-bold text-stone-800">{gameSession?.publications_count || 0}</div>
            <div className="text-stone-600">Publications</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-stone-800">{gameSession?.book_length_publications || 0}</div>
            <div className="text-stone-600">Book-Length</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}