import React from 'react';
import WelcomeScreen from '../components/WelcomeScreen';
import WelcomeHeader from '../welcome/WelcomeHeader';

function WelcomePage({ darkMode, setDarkMode, inputValue, setInputValue,setShowVoiceInteraction }) {
  return (
    <div
      className={`min-h-screen px-4 pt-[6rem] pb-8 max-w-4xl mx-auto `}
    >
      {/* Header Section */}
      <WelcomeHeader darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Welcome Screen (logo, intro, buttons, input, features) */}
      <div className="fixed top-52 left-10 pointer-events-none">
  <h1
    className="text-[10rem] font-black uppercase select-none opacity-10 transform -rotate-[30deg] "
  >
    Reva AI
  </h1>
</div>

      <WelcomeScreen
        darkMode={darkMode}
        inputValue={inputValue}
        setInputValue={setInputValue}
        setShowVoiceInteraction={setShowVoiceInteraction}
      />
    </div>
  );
}

export default WelcomePage;