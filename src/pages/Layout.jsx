

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Scroll, Trophy, Users, Upload, ScrollText } from "lucide-react"; // Import ScrollText
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Game Board",
    url: createPageUrl("GameBoard"),
    icon: BookOpen,
    description: "Play the game"
  },
  {
    title: "Historical Archive",
    url: createPageUrl("Archive"),
    icon: Scroll,
    description: "Browse documents"
  },
  /*{
    title: "Card Manager",
    url: createPageUrl("CardManager"),
    icon: Upload,
    description: "Import cards"
  },
  {
    title: "Conclusion Manager",
    url: createPageUrl("ConclusionManager"),
    icon: ScrollText, // Use the imported ScrollText icon
    description: "Import conclusions"
  },*/
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --background: 20 14 8;
          --foreground: 250 240 220;
          --card: 28 25 23;
          --card-foreground: 250 240 220;
          --popover: 28 25 23;
          --popover-foreground: 250 240 220;
          --primary: 153 27 27;
          --primary-foreground: 250 240 220;
          --secondary: 184 134 11;
          --secondary-foreground: 20 14 8;
          --muted: 41 37 36;
          --muted-foreground: 168 162 158;
          --accent: 153 27 27;
          --accent-foreground: 250 240 220;
          --destructive: 239 68 68;
          --destructive-foreground: 250 240 220;
          --border: 68 64 60;
          --input: 68 64 60;
          --ring: 153 27 27;
        }
        
        body {
          background: linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%);
          min-height: 100vh;
          color: #faf5dc;
        }
        
        .colonial-paper {
          background: linear-gradient(45deg, #faf5dc 0%, #f5f1e8 100%);
          color: #1c1917;
          border: 2px solid #d4a574;
        }
        
        .parchment-glow {
          box-shadow: 0 0 20px rgba(212, 165, 116, 0.3);
        }
        
        .revolution-accent {
          background: linear-gradient(45deg, #991b1b, #dc2626);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-stone-700 bg-gradient-to-b from-stone-900 to-stone-800">
          <SidebarHeader className="border-b border-stone-700 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 revolution-accent rounded-lg flex items-center justify-center parchment-glow">
                <Scroll className="w-6 h-6 text-yellow-100" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-yellow-100">Playing With the Past</h2>
                <p className="text-xs text-stone-400">The American Revolution</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-stone-400 uppercase tracking-wider px-3 py-2">
                Game Areas
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-red-900/30 hover:text-yellow-200 transition-all duration-200 rounded-lg mb-2 ${
                          location.pathname === item.url ? 'bg-red-900/50 text-yellow-200 parchment-glow' : 'text-stone-300'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <div>
                            <span className="font-medium">{item.title}</span>
                            <p className="text-xs opacity-70">{item.description}</p>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-stone-400 uppercase tracking-wider px-3 py-2">
                Learning Goals
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-2 text-sm text-stone-300">
                  <p>• Build arguments with evidence</p>
                  <p>• Understand chronology</p>
                  <p>• Analyze primary sources</p>
                  <p>• Connect historical themes</p>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-stone-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-yellow-100 text-sm truncate">Colonial Scholar</p>
                <p className="text-xs text-stone-400 truncate">Building evidence</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-gradient-to-br from-stone-950 to-stone-900">
          <header className="bg-gradient-to-r from-stone-900/80 to-stone-800/80 backdrop-blur border-b border-stone-700 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-stone-700 p-2 rounded-lg transition-colors duration-200 text-yellow-100" />
              <h1 className="text-xl font-bold text-yellow-100">Revolution Evidence</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

