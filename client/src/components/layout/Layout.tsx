import { useState, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Modal } from "@/components/ui/modal";
import { Icon } from "@/components/ui/icon";
import AddBet from "@/pages/AddBet";
import Dashboard from "@/pages/Dashboard";
import Summary from "@/pages/Summary";
import History from "@/pages/History";
import { ViewMode } from '@shared/types';

interface LayoutProps {
  children?: React.ReactNode;
}

const FeedbackForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="p-6 max-w-2xl mx-auto font-inter bg-white rounded-xl shadow-md border border-gray-100 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-500"
        title="Close"
      >
        <Icon name="close" />
      </button>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Provide Feedback</h2>
      <div className="text-center text-gray-600">
        <p>Help us improve AYAW by sharing your thoughts and suggestions.</p>
        <textarea
          className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Share your feedback here..."
        />
        <button
          type="button"
          className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 shadow-md"
          onClick={() => { alert('Thank you for your feedback!'); onClose(); }}
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

const OptInForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="p-6 max-w-2xl mx-auto font-inter bg-white rounded-xl shadow-md border border-gray-100 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-500"
        title="Close"
      >
        <Icon name="close" />
      </button>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Opt-In to Notifications</h2>
      <div className="text-center text-gray-600">
        <p>Stay updated with your betting performance and new features.</p>
        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-center">
            <input type="checkbox" className="mr-2" />
            Weekly performance summaries
          </label>
          <label className="flex items-center justify-center">
            <input type="checkbox" className="mr-2" />
            New feature announcements
          </label>
          <label className="flex items-center justify-center">
            <input type="checkbox" className="mr-2" />
            Tips and betting insights
          </label>
        </div>
        <button
          type="button"
          className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 shadow-md"
          onClick={() => { alert('You have been opted in to notifications!'); onClose(); }}
        >
          Confirm Opt-In
        </button>
      </div>
    </div>
  );
};

// Section Components
const AddBetSection = () => {
  return <AddBet />;
};

export function Layout({ children }: LayoutProps) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showOptInModal, setShowOptInModal] = useState(false);
  
  // Shared filtering state between Summary and History
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const addRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onNavigate = {
    add: () => scrollTo(addRef),
    summary: () => scrollTo(summaryRef),
    history: () => scrollTo(historyRef),
  };

  return (
    <div className="flex h-screen overflow-hidden font-inter">
      {/* Sidebar - fixed to viewport left */}
      <Sidebar 
        onNavigate={onNavigate}
        openFeedbackModal={() => setShowFeedbackModal(true)} 
        openOptInModal={() => setShowOptInModal(true)} 
      />

      {/* Topbar - now fixed to the viewport top, spanning from sidebar to right edge */}
      <TopBar />

      {/* Main content area, shifted right by sidebar width */}
      <div className="flex flex-col flex-1 ml-16">
        {/* Scrollable content below the topbar */}
        <div className="flex-1 overflow-y-auto bg-gray-50 pt-16">
          <div className="space-y-8 py-4">
            <section ref={addRef} className="scroll-mt-20">
              <AddBetSection />
            </section>
            
            <section ref={summaryRef} className="scroll-mt-20">
              <Summary 
                viewMode={viewMode}
                setViewMode={setViewMode}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </section>
            
            <section ref={historyRef} className="scroll-mt-20">
              <History 
                viewMode={viewMode}
                startDate={startDate}
                endDate={endDate}
                searchTerm={searchTerm}
              />
            </section>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showFeedbackModal && (
        <Modal onClose={() => setShowFeedbackModal(false)}>
          <FeedbackForm onClose={() => setShowFeedbackModal(false)} />
        </Modal>
      )}
      {showOptInModal && (
        <Modal onClose={() => setShowOptInModal(false)}>
          <OptInForm onClose={() => setShowOptInModal(false)} />
        </Modal>
      )}
    </div>
  );
}