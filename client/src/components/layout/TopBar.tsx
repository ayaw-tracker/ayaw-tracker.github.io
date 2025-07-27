export function TopBar() {
  return (
    <header className="fixed top-0 left-16 right-0 bg-white shadow-sm z-20 flex items-center justify-between p-4 font-inter">
      {/* Container for AYAW title and slogan, centered */}
      <div className="flex-grow flex flex-col items-center">
        <h1 className="text-xl font-bold text-gray-800">Are You Actually Winning?</h1>
        <p className="text-sm text-gray-600 mt-1">Track your betting performance honestly.</p>
      </div>
    </header>
  );
}
