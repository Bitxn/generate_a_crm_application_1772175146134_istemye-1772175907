import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  TrendingUp,
  Activity,
  DollarSign,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Phone,
  Mail,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totals: {
    contacts: number;
    companies: number;
    deals: number;
    activities: number;
  };
  pipeline: {
    total_value: number;
    weighted_value: number;
    open_deals: number;
    total_revenue: number;
    won_deals: number;
  };
  contacts: {
    leads: number;
    prospects: number;
    customers: number;
  };
  recent_activities: Array<{
    id: number;
    type: string;
    subject: string;
    date: string;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      if (!userId) {
        navigate('/welcome');
        return;
      }

      const response = await fetch('http://localhost:8056/api/dashboard/stats', {
        headers: { 'X-User-ID': userId }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const conversionRate = stats.totals.contacts > 0 
    ? ((stats.contacts.customers / stats.totals.contacts) * 100).toFixed(1)
    : '0.0';

  const winRate = stats.pipeline.open_deals + stats.pipeline.won_deals > 0
    ? ((stats.pipeline.won_deals / (stats.pipeline.open_deals + stats.pipeline.won_deals)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-slate-600 mt-1">Welcome back! Here's your overview.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-slate-500">Last updated</p>
                <p className="text-sm font-medium text-slate-700">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Contacts */}
          <div 
            onClick={() => navigate('/contacts')}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 hover:border-indigo-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                <Users className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Total Contacts</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totals.contacts}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {conversionRate}% conversion
                </span>
              </div>
            </div>
          </div>

          {/* Total Companies */}
          <div 
            onClick={() => navigate('/companies')}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 hover:border-violet-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg shadow-violet-200">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Companies</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totals.companies}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                  Active accounts
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline Value */}
          <div 
            onClick={() => navigate('/deals')}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 hover:border-emerald-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Pipeline Value</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.pipeline.total_value)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {stats.pipeline.open_deals} open deals
                </span>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="group bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(stats.pipeline.total_revenue)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  {winRate}% win rate
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Pipeline Overview</h2>
              <button 
                onClick={() => navigate('/deals')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Weighted Pipeline */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-slate-900">Weighted Pipeline</span>
                  </div>
                  <span className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(stats.pipeline.weighted_value)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 ml-8">Expected value based on deal probability</p>
              </div>

              {/* Contact Distribution */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">Leads</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stats.contacts.leads}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">Prospects</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stats.contacts.prospects}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">Customers</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stats.contacts.customers}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-500">Open Deals</p>
                    <p className="text-lg font-bold text-slate-900">{stats.pipeline.open_deals}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Activity className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-500">Activities</p>
                    <p className="text-lg font-bold text-slate-900">{stats.totals.activities}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
              <button 
                onClick={() => navigate('/activities')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {stats.recent_activities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No recent activities</p>
                </div>
              ) : (
                stats.recent_activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {activity.subject}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/activities/new')}
              className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
            >
              Log New Activity
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/contacts/new')}
              className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl transition-all duration-300 text-left group"
            >
              <Users className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-slate-900">Add Contact</p>
              <p className="text-xs text-slate-600 mt-1">Create new lead</p>
            </button>
            <button
              onClick={() => navigate('/companies/new')}
              className="p-4 bg-gradient-to-br from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200 rounded-xl transition-all duration-300 text-left group"
            >
              <Building2 className="w-5 h-5 text-violet-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-slate-900">Add Company</p>
              <p className="text-xs text-slate-600 mt-1">New account</p>
            </button>
            <button
              onClick={() => navigate('/deals/new')}
              className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl transition-all duration-300 text-left group"
            >
              <TrendingUp className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-slate-900">Create Deal</p>
              <p className="text-xs text-slate-600 mt-1">New opportunity</p>
            </button>
            <button
              onClick={() => navigate('/activities/new')}
              className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-xl transition-all duration-300 text-left group"
            >
              <Calendar className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-slate-900">Schedule Activity</p>
              <p className="text-xs text-slate-600 mt-1">Log interaction</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}