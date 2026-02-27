import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Building2,
  TrendingUp,
  Activity,
  ArrowRight,
  Database,
  Lock,
  Zap
} from 'lucide-react';

export default function Welcome() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const initializeUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8056/api/user/init', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('crm_user_id', data.user_id);
        
        // Small delay for visual effect
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        alert('Failed to initialize. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Initialization failed:', error);
      alert('Failed to initialize. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full">
          {/* Main Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl mb-6 animate-bounce">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              Welcome to Your
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                CRM Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-indigo-100 mb-12 max-w-2xl mx-auto font-medium">
              Manage contacts, track deals, and grow your business with a powerful, 
              privacy-first CRM system built just for you.
            </p>

            <button
              onClick={initializeUser}
              disabled={loading}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-700 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  Initializing...
                </>
              ) : (
                <>
                  Get Started Free
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-sm text-indigo-200 mt-4">
              No credit card required • Free forever • Your data stays with you
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Contact Management</h3>
              <p className="text-indigo-100 text-sm">
                Organize and track all your contacts with custom fields and smart scoring
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Company Accounts</h3>
              <p className="text-indigo-100 text-sm">
                Manage companies, track relationships, and monitor account health
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Sales Pipeline</h3>
              <p className="text-indigo-100 text-sm">
                Visual deal tracking with stages, probabilities, and revenue forecasting
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Activity Tracking</h3>
              <p className="text-indigo-100 text-sm">
                Log calls, meetings, tasks, and emails to never miss a beat
              </p>
            </div>
          </div>

          {/* Privacy Features */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Privacy-First Architecture
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-emerald-300" />
                </div>
                <h3 className="text-white font-semibold mb-2">Your Own Database</h3>
                <p className="text-indigo-100 text-sm">
                  Each user gets their own isolated SQLite database
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-blue-300" />
                </div>
                <h3 className="text-white font-semibold mb-2">100% Private</h3>
                <p className="text-indigo-100 text-sm">
                  No data sharing, no analytics, complete privacy
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-violet-300" />
                </div>
                <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
                <p className="text-indigo-100 text-sm">
                  Local-first architecture for instant performance
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-12">
            <p className="text-indigo-200 text-sm">
              By getting started, you'll receive a unique user ID that's stored locally in your browser.
              <br />
              This ID creates your personal, isolated CRM database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}