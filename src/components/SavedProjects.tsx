import React, { useState } from "react";
import { Clock, Trash2, ArrowRight, Video, Copy, HelpCircle, Briefcase, CreditCard, User as UserIcon, LogIn, LogOut, ChevronDown, ShieldCheck } from "lucide-react";
import { Project } from "../types";

interface SavedProjectsProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  onCloneProject: (id: string, e: React.MouseEvent) => void;
  activeProjectId?: string;
  onNewProject: () => void;
  onLaunchTutorial: () => void;
  onHireDeveloper: () => void;
  onOpenPricing?: () => void;
  currentUser?: {
    uid: string;
    email: string | null;
    displayName: string | null;
    isAnonymous: boolean;
  } | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export default function SavedProjects({
  projects,
  onSelectProject,
  onDeleteProject,
  onCloneProject,
  activeProjectId,
  onNewProject,
  onLaunchTutorial,
  onHireDeveloper,
  onOpenPricing,
  currentUser,
  onOpenAuth,
  onSignOut,
}: SavedProjectsProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAuthenticated = currentUser && !currentUser.isAnonymous;
  const userInitials = (currentUser?.displayName || currentUser?.email || "U").substring(0, 2).toUpperCase();

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto py-1">
        <div className="flex items-center gap-3 shrink-0">
          <img src="/logo.svg" alt="Magneto" className="h-8 w-auto shrink-0" id="magneto_navbar_logo" />
          <div>
            <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              Magneto
            </h2>
            <p className="text-xs text-slate-400">Pull attention. Keep it.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* User Auth Profile / Login Button */}
          {isAuthenticated ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
                id="btn_user_profile_dropdown"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {userInitials}
                </div>
                <span className="max-w-[110px] truncate">{currentUser.displayName || currentUser.email}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in space-y-1">
                  <div className="p-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-slate-200 truncate">{currentUser.displayName || "User Account"}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-[10px] font-mono">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Firebase Verified</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onSignOut) onSignOut();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-lg transition flex items-center gap-2 cursor-pointer"
                    id="btn_auth_signout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
              id="btn_open_auth_modal"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}

          {onOpenPricing && (
            <button
              onClick={onOpenPricing}
              className="px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-300 hover:text-indigo-200 rounded-md text-xs font-semibold border border-indigo-800/60 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              id="btn_header_pricing_mor"
              title="View Plans, Lemon Squeezy & Paddle MOR Pitches"
            >
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pricing & MOR</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                2 Free
              </span>
            </button>
          )}

          <button
            onClick={onLaunchTutorial}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 rounded-md text-xs font-semibold border border-slate-700 transition flex items-center gap-1 shrink-0 cursor-pointer"
            id="btn_help_open_tutorial"
            title="Launch Interactive Tutorial"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            Tour & Help
          </button>

          <button
            onClick={onHireDeveloper}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 hover:from-purple-900/70 hover:to-indigo-900/70 text-purple-200 hover:text-white rounded-md text-xs font-semibold border border-purple-700/50 transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
            id="btn_header_hire_developer"
            title="Hire Developer Tsepo Motsatse ($450 Flat Rate)"
          >
            <Briefcase className="w-3.5 h-3.5 text-purple-300" />
            <span>Hire Developer</span>
          </button>

          <button
            onClick={onNewProject}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-md text-[11px] font-semibold transition flex items-center gap-1 shrink-0 cursor-pointer"
            id="btn_create_new_pitch"
          >
            <Clock className="w-3.5 h-3.5" />
            New Pitch
          </button>

          {projects.length > 0 && (
            <div className="h-6 w-px bg-slate-800 shrink-0" />
          )}

          {projects.map((project) => (
            <div
              key={project.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs transition duration-150 shrink-0 ${
                activeProjectId === project.id
                  ? "bg-slate-800 text-slate-100 border-indigo-500"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <button
                onClick={() => onSelectProject(project.id)}
                className="flex items-center gap-2 text-left font-medium max-w-[150px] truncate cursor-pointer py-1"
              >
                <span>{project.name || "Untitled Pitch"}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800/60">
                <button
                  onClick={(e) => onCloneProject(project.id, e)}
                  className="p-1 hover:text-indigo-400 text-slate-500 hover:bg-slate-800/50 rounded transition cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                  title="Clone campaign context"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => onDeleteProject(project.id, e)}
                  className="p-1 hover:text-rose-400 text-slate-500 hover:bg-slate-800/50 rounded transition cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
                  title="Delete project"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
