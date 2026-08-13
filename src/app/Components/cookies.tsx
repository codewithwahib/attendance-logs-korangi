"use client";
import React, { useState } from 'react';

const SimpleCookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleAccept = () => {
    if (isChecked) {
      console.log('Cookies accepted');
      localStorage.setItem("cookies", "true");
      setIsVisible(false);
    }
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Blur overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
      
      {/* Cookie Banner */}
      <div className="fixed top-4 right-4 z-[101] max-w-sm w-full bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
        <div className="p-4">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Privacy & Policy</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Message */}
          <p className="text-gray-600 text-sm mb-4">
            We use cookies to enhance your browsing experience. By continuing to use this site, you consent to our use of cookies.
          </p>
          
          {/* Links */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button 
              onClick={() => setShowTerms(true)}
              className="text-xs text-gray-500 hover:text-black underline transition-colors duration-200"
            >
              Terms & Conditions
            </button>
            <button 
              onClick={() => setShowPrivacy(true)}
              className="text-xs text-gray-500 hover:text-black underline transition-colors duration-200"
            >
              Privacy Policy
            </button>
          </div>
          
          {/* Checkbox with label */}
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="w-5 h-5 accent-black cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">I agree to cookies</span>
          </label>
          
          {/* Accept Button */}
          <button
            onClick={handleAccept}
            disabled={!isChecked}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
              isChecked 
                ? 'bg-black text-white hover:bg-gray-800 cursor-pointer' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="text-sm font-medium">Accept</span>
          </button>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[102]" onClick={() => setShowTerms(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[103] w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Modal Header with Close Button */}
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
                <button
                  onClick={() => setShowTerms(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-600 space-y-4">
                <p><strong className="text-black">Effective Date:</strong> 26 May 2026</p>
                <p>These Terms and Conditions govern the use of the PengOffSec website and all services provided by PengOffSec.</p>
                <p>By accessing our website or engaging our services, you agree to these Terms.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">1. Services</h3>
                <p>PengOffSec provides services including but not limited to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Cybersecurity consulting</li>
                  <li>Penetration testing</li>
                  <li>Security assessments</li>
                  <li>Security awareness training</li>
                  <li>Software development</li>
                  <li>Web development</li>
                  <li>Mobile application development</li>
                  <li>Custom software solutions</li>
                  <li>Technical consulting</li>
                </ul>
                <p>Service availability may change without notice.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">2. Client Responsibilities</h3>
                <p>Clients agree to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide accurate information</li>
                  <li>Cooperate during project execution</li>
                  <li>Deliver required materials on time</li>
                  <li>Review and approve deliverables promptly</li>
                  <li>Ensure lawful use of delivered products and services</li>
                </ul>
                <p>Delays caused by the client may impact project timelines.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">3. Payments</h3>
                <p>Unless otherwise agreed in writing:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>All payments are due according to the agreed invoice schedule.</li>
                  <li>Deposits and milestone payments may be required.</li>
                  <li>Late payments may result in suspension of services.</li>
                  <li>Completed work remains the property of PengOffSec until full payment is received.</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">4. Intellectual Property</h3>
                <p>Unless otherwise agreed in writing:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>PengOffSec retains ownership of its proprietary methodologies, frameworks, tools, and pre-existing intellectual property.</li>
                  <li>Clients receive ownership or usage rights to deliverables only after full payment has been received.</li>
                  <li>Open-source components remain subject to their respective licenses.</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">5. Development Services Disclaimer</h3>
                <p>PengOffSec develops software and technical solutions based on client-provided requirements.</p>
                <p>PengOffSec makes reasonable efforts to understand and implement client requirements accurately and professionally. However:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>PengOffSec does not investigate, monitor, verify, or determine the intended use of software, applications, websites, scripts, or systems requested by clients.</li>
                  <li>Clients are solely responsible for ensuring that their requested projects comply with all applicable laws, regulations, contractual obligations, and ethical standards.</li>
                  <li>PengOffSec is not responsible for how a client uses, deploys, modifies, distributes, or operates any delivered software, system, application, website, script, or technical solution.</li>
                  <li>Any misuse, unlawful activity, abuse, damages, losses, violations, or consequences arising from the use of a delivered project shall be the sole responsibility of the client.</li>
                  <li>By engaging PengOffSec's development services, the client agrees to indemnify and hold harmless PengOffSec, its owners, employees, contractors, and affiliates from any claims, liabilities, damages, losses, legal actions, penalties, or expenses arising from the client's use of the delivered project.</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">6. Cybersecurity Services Limitation</h3>
                <p>Cybersecurity assessments and testing are intended to improve security posture.</p>
                <p>PengOffSec does not guarantee:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Complete security</li>
                  <li>Prevention of all attacks</li>
                  <li>Detection of all vulnerabilities</li>
                  <li>Future resistance to cyber threats</li>
                </ul>
                <p>Security is an ongoing process, and no system can be guaranteed to be entirely secure.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">7. Confidentiality</h3>
                <p>Both parties agree to maintain the confidentiality of proprietary and sensitive information shared during service delivery unless:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Disclosure is required by law.</li>
                  <li>Information becomes publicly available through lawful means.</li>
                  <li>Written consent is provided by the disclosing party.</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">8. Limitation of Liability</h3>
                <p>To the fullest extent permitted by law, PengOffSec shall not be liable for:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Indirect damages</li>
                  <li>Consequential damages</li>
                  <li>Loss of profits</li>
                  <li>Loss of revenue</li>
                  <li>Loss of business opportunities</li>
                  <li>Data loss</li>
                  <li>Service interruptions</li>
                </ul>
                <p>PengOffSec's total liability shall not exceed the amount paid by the client for the specific service giving rise to the claim.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">9. Warranties Disclaimer</h3>
                <p>All services are provided on an "AS IS" and "AS AVAILABLE" basis.</p>
                <p>PengOffSec disclaims all warranties, whether express or implied, including but not limited to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Merchantability</li>
                  <li>Fitness for a particular purpose</li>
                  <li>Non-infringement</li>
                  <li>Continuous availability</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">10. Indemnification</h3>
                <p>Clients agree to indemnify, defend, and hold harmless PengOffSec and its personnel from any claims, damages, liabilities, costs, and expenses arising from:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Client misuse of services</li>
                  <li>Violation of applicable laws</li>
                  <li>Breach of these Terms</li>
                  <li>Use of delivered software or systems</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">11. Termination</h3>
                <p>PengOffSec may suspend or terminate services if:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Terms are violated</li>
                  <li>Payments are overdue</li>
                  <li>Illegal activities are suspected</li>
                  <li>Continuing service would create legal or security risks</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">12. Governing Law</h3>
                <p>These Terms shall be governed by and interpreted under the laws of Pakistan, without regard to conflict-of-law principles.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">13. Changes to Terms</h3>
                <p>PengOffSec reserves the right to modify these Terms at any time. Updated versions will be published on the website and become effective upon publication.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">14. Contact Information</h3>
                <p>PengOffSec<br />Website: https://pengoffsec.com<br />Email: info@pengoffsec.com</p>
              </div>
              
              <button
                onClick={() => setShowTerms(false)}
                className="mt-6 w-full px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
              >
                I Accept
              </button>
            </div>
          </div>
        </>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[102]" onClick={() => setShowPrivacy(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[103] w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Modal Header with Close Button */}
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-600 space-y-4">
                <p><strong className="text-black">Effective Date:</strong> 26 May 2026</p>
                <p>Welcome to PengOffSec ("Company", "we", "our", "us"). This Privacy Policy explains how we collect, use, disclose, and protect information when you visit https://pengoffsec.com, use our services, or communicate with us.</p>
                <p>By accessing our website or using our services, you agree to the practices described in this Privacy Policy.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">1. Information We Collect</h3>
                <p><strong>1.1 Information You Provide</strong></p>
                <p>We may collect information that you voluntarily provide, including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Company name</li>
                  <li>Billing information</li>
                  <li>Project requirements</li>
                  <li>Support requests</li>
                  <li>Communications and correspondence</li>
                </ul>
                
                <p><strong>1.2 Information Collected Automatically</strong></p>
                <p>When you visit our website, we may automatically collect:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Device information</li>
                  <li>Pages visited</li>
                  <li>Date and time of visits</li>
                  <li>Referring websites</li>
                  <li>Website usage analytics</li>
                </ul>
                
                <p><strong>1.3 Cookies and Tracking Technologies</strong></p>
                <p>We may use cookies and similar technologies to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Improve website performance</li>
                  <li>Analyze website traffic</li>
                  <li>Remember user preferences</li>
                  <li>Enhance user experience</li>
                </ul>
                <p>You may disable cookies through your browser settings; however, some features may not function properly.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">2. How We Use Your Information</h3>
                <p>We use collected information to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide cybersecurity services</li>
                  <li>Deliver software development services</li>
                  <li>Respond to inquiries and support requests</li>
                  <li>Process payments and invoices</li>
                  <li>Improve our website and services</li>
                  <li>Maintain security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                  <li>Communicate project updates and service announcements</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">3. Information Sharing</h3>
                <p>PengOffSec does not sell personal information.</p>
                <p>We may share information only in the following circumstances:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>With trusted contractors or service providers involved in service delivery</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights, property, systems, or users</li>
                  <li>During mergers, acquisitions, or business transfers</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">4. Data Security</h3>
                <p>We implement reasonable administrative, technical, and organizational safeguards to protect information from:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Unauthorized access</li>
                  <li>Disclosure</li>
                  <li>Alteration</li>
                  <li>Destruction</li>
                </ul>
                <p>However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">5. Data Retention</h3>
                <p>We retain information only as long as necessary to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Deliver services</li>
                  <li>Meet contractual obligations</li>
                  <li>Resolve disputes</li>
                  <li>Comply with legal requirements</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">6. Third-Party Services</h3>
                <p>Our website may contain links to third-party websites or services. We are not responsible for their privacy practices, content, or security.</p>
                <p>Users should review the privacy policies of those third parties independently.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">7. International Data Transfers</h3>
                <p>If you access our services from outside our operating jurisdiction, your information may be transferred and processed in countries where data protection laws may differ.</p>
                <p>By using our services, you consent to such transfers.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">8. Your Rights</h3>
                <p>Depending on applicable laws, you may have the right to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to processing</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <p>Requests may be submitted using the contact information provided below.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">9. Children's Privacy</h3>
                <p>Our services are not directed toward individuals under 18 years of age. We do not knowingly collect personal information from minors.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">10. Changes to This Policy</h3>
                <p>We reserve the right to update this Privacy Policy at any time. Updates will be posted on this page with a revised effective date.</p>
                
                <h3 className="font-semibold text-gray-800 mt-4 text-base">11. Contact Information</h3>
                <p>For privacy-related inquiries, contact:<br />PengOffSec<br />Email: info@pengoffsec.com<br />Website: https://pengoffsec.com</p>
              </div>
              
              <button
                onClick={() => setShowPrivacy(false)}
                className="mt-6 w-full px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
              >
                I Accept
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000000;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333333;
        }
      `}</style>
    </>
  );
};

export default SimpleCookieBanner;