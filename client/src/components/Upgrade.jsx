import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRocket, faCheckCircle, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { SearchContext } from '../context/SearchContext';
import { assets } from '../assets/assets';
import PricingModal from './PricingModal';
import {Link} from 'react-router-dom'


const Upgrade = ({ darkMode }) => {
  const { isAuthenticated, setShowLoginModal } = useContext(SearchContext);
  const [showPricing, setShowPricing] = useState(false);

  const handleUpgradeClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowPricing(true);
    }
  };

  return (
    <>
      <Link className='text-left top-0   left-2' to='/'>
      <p >Back to Home</p>
      </Link>
      <div className={`min-h-screen ${darkMode ? 'bg-[#121212] text-gray-200' : 'bg-gray-50 text-gray-800'} pt-20 pb-12 px-4 sm:px-6 lg:px-8`}>

        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6">
              <img
                src={assets.reve_logo_for_header}
                alt="Reva AI Logo"
                className="w-full h-full object-contain scale-[1.3]"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4">Upgrade to SuperReva</h1>
            <p className="text-lg max-w-2xl mx-auto text-gray-400">
              Unlock the full potential of Reva AI with a SuperReva subscription. Enjoy higher usage quotas and enhanced features for a seamless AI experience.
            </p>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: faRocket,
                title: 'Higher Usage Quotas',
                desc: 'Access more queries and interactions with Reva AI, perfect for power users and researchers.',
              },
              {
                icon: faCheckCircle,
                title: 'Priority Support',
                desc: 'Get faster responses and dedicated support to ensure your experience is smooth.',
              },
              {
                icon: faCheckCircle,
                title: 'Enhanced Features',
                desc: 'Explore advanced capabilities tailored for in-depth analysis and productivity.',
              },
              {
                icon: faCheckCircle,
                title: 'Seamless Integration',
                desc: 'Use SuperReva across all platforms, including Reva.com, and mobile apps.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-xl transition-all ${
                  darkMode ? 'bg-[#1E1E1E] hover:bg-[#252525]' : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={feature.icon} className="text-blue-500 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{feature.title}</h3>
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <button
              onClick={handleUpgradeClick}
              className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-700'
              }`}
            >
              {isAuthenticated ? (
                <>
                  <FontAwesomeIcon icon={faRocket} className="mr-2" />
                  Upgrade to SuperReva
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                  Sign In to Upgrade
                </>
              )}
            </button>
            
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  question: 'What is SuperReva?',
                  answer: 'SuperReva is a paid subscription plan for Reva AI that offers higher usage quotas and enhanced features compared to the free plan.',
                },
                {
                  question: 'How do I upgrade?',
                  answer: 'Sign in to your account and click "Upgrade to SuperReva" to view pricing plans and choose a subscription that suits your needs.',
                },
                {
                  question: 'Can I use SuperReva on multiple platforms?',
                  answer: 'Yes, SuperReva is available on Reva.com, and the Reva iOS and Android apps.',
                },
                {
                  question: 'What happens if I’m not signed in?',
                  answer: 'You’ll need to sign in to upgrade. If you don’t have an account, you can create one easily through the login modal.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl ${
                    darkMode ? 'bg-[#1E1E1E]' : 'bg-white border border-gray-200'
                  }`}
                >
                  <h3 className="text-lg font-medium">{faq.question}</h3>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal showPricing={showPricing} setShowPricing={setShowPricing} darkMode={darkMode} />
    </>
  );
};

export default Upgrade;