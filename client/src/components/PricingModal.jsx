import React, { useState } from 'react';

const PricingModal = ({ showPricing, setShowPricing, darkMode }) => {
  const [pricingTab, setPricingTab] = useState('individual');

  if (!showPricing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      
      <div className={`rounded-xl w-11/12 max-w-6xl max-h-[90vh] overflow-auto ${darkMode ? 'bg-[#1E1E1E] text-gray-200' : 'bg-white text-gray-900'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Pricing Plans</h2>
            <button
              onClick={() => setShowPricing(false)}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <div className="flex space-x-4 mb-8">
            {['individual', 'business', 'enterprise', 'compare'].map((tab) => (
              <button
                key={tab}
                onClick={() => setPricingTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  pricingTab === tab
                    ? 'bg-blue-600 text-white'
                    : darkMode
                    ? 'text-gray-400 hover:bg-[#252525]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i
                  className={`fas fa-${
                    tab === 'individual' ? 'user' : tab === 'business' ? 'building' : tab === 'enterprise' ? 'university' : 'calculator'
                  } mr-2`}
                ></i>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {pricingTab === 'individual' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Basic',
                  price: 9,
                  features: ['Up to 100 searches/month', 'Basic text search', 'Email support'],
                },
                {
                  name: 'Pro',
                  price: 29,
                  features: ['Unlimited searches', 'Advanced text & image search', 'Priority support', 'Analytics dashboard'],
                  popular: true,
                },
                {
                  name: 'Premium',
                  price: 79,
                  features: ['Everything in Pro', 'Voice search', 'Custom integrations', '24/7 dedicated support'],
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`p-8 rounded-xl shadow-sm border ${
                    plan.popular
                      ? darkMode
                        ? 'border-2 border-blue-600'
                        : 'border-2 border-indigo-600'
                      : darkMode
                      ? 'border-gray-700'
                      : 'border-gray-200'
                  } hover:shadow-lg transition-shadow relative ${darkMode ? 'bg-[#252525]' : 'bg-white'}`}
                >
                  {plan.popular && (
                    <div
                      className={`absolute top-0 right-0 px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm ${
                        darkMode ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      Popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {plan.name === 'Basic' ? 'Perfect for getting started' : plan.name === 'Pro' ? 'For growing needs' : 'For power users'}
                    </p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/month</span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <i className="fas fa-check text-green-500 mr-3"></i>{feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    // onClick={() => window.location.href = '/Reva'}
                    className={`w-full py-3 px-4 rounded-lg transition-colors ${
                      darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {plan.name === 'Premium' ? 'Contact Sales' : plan.name === 'Pro' ? 'Start Free Trial' : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>
          )}
          {pricingTab === 'business' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Startup',
                  price: 99,
                  features: ['Up to 5 team members', 'Advanced search features', 'Basic analytics'],
                },
                {
                  name: 'Growth',
                  price: 299,
                  features: ['Up to 20 team members', 'All search features', 'Advanced analytics', 'API access'],
                  popular: true,
                },
                {
                  name: 'Scale',
                  price: 799,
                  features: ['Unlimited team members', 'Custom features', 'Enterprise analytics', '24/7 support'],
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`p-8 rounded-xl shadow-sm border ${
                    plan.popular
                      ? darkMode
                        ? 'border-2 border-blue-600'
                        : 'border-2 border-indigo-600'
                      : darkMode
                      ? 'border-gray-700'
                      : 'border-gray-200'
                  } hover:shadow-lg transition-shadow relative ${darkMode ? 'bg-[#252525]' : 'bg-white'}`}
                >
                  {plan.popular && (
                    <div
                      className={`absolute top-0 right-0 px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm ${
                        darkMode ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      Most Popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {plan.name === 'Startup' ? 'For small teams' : plan.name === 'Growth' ? 'For growing businesses' : 'For large teams'}
                    </p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>/month</span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <i className="fas fa-check text-green-500 mr-3"></i>{feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    // onClick={() => window.location.href = 'https://x.ai/Reva'}
                    className={`w-full py-3 px-4 rounded-lg transition-colors ${
                      darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {plan.name === 'Scale' ? 'Contact Sales' : plan.name === 'Growth' ? 'Get Started' : 'Start Free Trial'}
                  </button>
                </div>
              ))}
            </div>
          )}
          {pricingTab === 'enterprise' && (
            <div className="space-y-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h3 className="text-3xl font-bold mb-4">Enterprise Solutions</h3>
                <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Custom solutions for large organizations with complex needs. Get in touch with our sales team to discuss your requirements.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Security & Compliance',
                    icon: 'shield-alt',
                    features: ['Advanced security features', 'Compliance management', 'Data encryption'],
                  },
                  {
                    title: 'Custom Integration',
                    icon: 'cogs',
                    features: ['API customization', 'Workflow automation', 'Custom development'],
                  },
                  {
                    title: 'Dedicated Support',
                    icon: 'headset',
                    features: ['24/7 priority support', 'Dedicated account manager', 'Training & onboarding'],
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`p-8 rounded-xl shadow-sm border ${darkMode ? 'border-gray-700 bg-[#252525]' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex items-center justify-center mb-6">
                      <i className={`fas fa-${item.icon} text-4xl ${darkMode ? 'text-blue-500' : 'text-indigo-600'}`}></i>
                    </div>
                    <h4 className="text-xl font-bold text-center mb-4">{item.title}</h4>
                    <ul className="space-y-3">
                      {item.features.map((feature) => (
                        <li key={feature} className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <i className="fas fa-check text-green-500 mr-3"></i>{feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <button
                  onClick={() => window.location.href = '/Reva'}
                  className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors ${
                    darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <i className="fas fa-envelope mr-2"></i>Contact Enterprise Sales
                </button>
              </div>
            </div>
          )}
          {pricingTab === 'compare' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`py-4 px-6 text-left font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Features
                    </th>
                    {['Basic', 'Pro', 'Premium', 'Enterprise'].map((plan) => (
                      <th key={plan} className="py-4 px-6 text-center font-bold">
                        {plan}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {[
                    { feature: 'Search Limit', values: ['100/month', 'Unlimited', 'Unlimited', 'Custom'] },
                    { feature: 'Text Search', values: ['check', 'check', 'check', 'check'] },
                    { feature: 'Image Search', values: ['times', 'check', 'check', 'check'] },
                    { feature: 'Voice Search', values: ['times', 'times', 'check', 'check'] },
                    { feature: 'Analytics', values: ['Basic', 'Advanced', 'Premium', 'Custom'] },
                    { feature: 'API Access', values: ['times', 'Limited', 'Full', 'Custom'] },
                    { feature: 'Support', values: ['Email', 'Priority', '24/7', 'Dedicated'] },
                  ].map((row) => (
                    <tr key={row.feature}>
                      <td className={`py-4 px-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{row.feature}</td>
                      {row.values.map((value, index) => (
                        <td key={index} className="py-4 px-6 text-center">
                          {value.includes('check') ? (
                            <i className="fas fa-check text-green-500"></i>
                          ) : value.includes('times') ? (
                            <i className="fas fa-times text-red-500"></i>
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default PricingModal;