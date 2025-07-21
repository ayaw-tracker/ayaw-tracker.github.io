import { useState } from "react";
import { useLocation } from "wouter";
import { Icon } from "@/components/ui/icon";

interface SidebarProps {
  onNavigate: {
    add: () => void;
    summary: () => void;
    history: () => void;
  };
  openFeedbackModal: () => void;
  openOptInModal: () => void;
}

const SidebarItem = ({ icon, label, href, onClick }: { icon: string; label: string; href?: string; onClick?: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [location] = useLocation();
  const isActive = href && location === href;

  if (href) {
    return (
      <div className="relative">
        <a
          href={href}
          className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 justify-center ${
            isActive ? 'bg-[#34495E] text-white' : 'text-gray-300 hover:bg-[#34495E] hover:text-white'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Icon name={icon} size={20} />
        </a>
        {isHovered && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1 bg-gray-700 text-white text-sm rounded-md shadow-lg whitespace-nowrap opacity-0 animate-fadeIn transition-opacity duration-200 z-50">
            {label}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        className="flex items-center w-full p-3 my-1 rounded-lg text-gray-300 hover:bg-[#34495E] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 justify-center"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon name={icon} size={20} />
      </button>
      {isHovered && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1 bg-gray-700 text-white text-sm rounded-md shadow-lg whitespace-nowrap opacity-0 animate-fadeIn transition-opacity duration-200 z-50">
          {label}
        </div>
      )}
    </div>
  );
};

export function Sidebar({ onNavigate, openFeedbackModal, openOptInModal }: SidebarProps) {
  const [isDarkModeHovered, setIsDarkModeHovered] = useState(false);

  return (
    <div className="w-16 bg-[#2C3E50] text-white flex flex-col justify-between py-4 font-inter fixed inset-y-0 left-0 shadow-lg z-30">
      {/* Dark Mode Toggle at the very top */}
      <div className="flex justify-center p-2 relative">
        <button
          className="p-2 rounded-full hover:bg-[#34495E] focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-300"
          onMouseEnter={() => setIsDarkModeHovered(true)}
          onMouseLeave={() => setIsDarkModeHovered(false)}
          onClick={() => alert('Dark Mode functionality coming soon!')}
        >
          <Icon name="moon" />
        </button>
        {isDarkModeHovered && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1 bg-gray-700 text-white text-sm rounded-md shadow-lg whitespace-nowrap opacity-0 animate-fadeIn transition-opacity duration-200 z-50">
            Dark Mode
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 pt-4">
        <SidebarItem icon="add" label="Add New Bet" onClick={onNavigate.add} />
        <SidebarItem icon="dashboard" label="Summary Statistics" onClick={onNavigate.summary} />
        <SidebarItem icon="history" label="Bet History" onClick={onNavigate.history} />
      </div>

      <div className="flex flex-col gap-2 pb-4">
        <SidebarItem icon="feedback" label="Feedback" onClick={openFeedbackModal} />
        <SidebarItem icon="opt-in" label="Opt-In" onClick={openOptInModal} />
      </div>
    </div>
  );
}
