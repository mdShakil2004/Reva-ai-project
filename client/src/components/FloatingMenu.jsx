// components/FloatingMenu.jsx
import React from "react";
import { FaMicrophoneAlt, FaMagic, FaGlobe } from "react-icons/fa";

const FloatingMenu = ({ setShowVoiceInteraction, setSearchType }) => {
  const icons = [
    {
      icon: <FaMicrophoneAlt />,
      label: "Voice Talk",
      color: "bg-gradient-to-br from-pink-500 to-red-500",
      shadow: "shadow-pink-400/40",
      onClick: () => setShowVoiceInteraction(true),
    },
    {
      icon: <FaMagic />,
      label: "Text to Image",
      color: "bg-gradient-to-br from-green-400 to-green-600",
      shadow: "shadow-green-400/40",
      onClick: () => setSearchType("image"),
    },
    {
      icon: <FaGlobe />,
      label: "General Search",
      color: "bg-gradient-to-br from-sky-400 to-blue-600",
      shadow: "shadow-sky-400/40",
      onClick: () => setSearchType("none"),
    },
  ];

  return (
    <div className="flex flex-row  gap-8 justify-center items-center mt-6">
      {icons.map((item, index) => (
        <div key={index} className="relative flex flex-col items-center group">
          <div
            onClick={item.onClick}
            className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md bg-white/5 ${item.shadow} transition-transform duration-300 transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden cursor-pointer`}
          >
            <div
              className={`absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-90 ${item.color}`}
            ></div>
            <div className="text-white text-2xl z-10">{item.icon}</div>
          </div>
          <div className="absolute bottom-[-28px] bg-white/10 px-2 py-0.5 rounded-md text-white text-xs opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap backdrop-blur-md">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloatingMenu;
