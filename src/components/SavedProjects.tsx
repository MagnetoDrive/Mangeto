import React from "react";
import { Clock, Trash2, ArrowRight, Video, Copy, HelpCircle, Briefcase, CreditCard } from "lucide-react";
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
}: SavedProjectsProps) {
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
