import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  DollarSign,
  Calendar,
  Building2,
  User,
  Target,
  TrendingUp
} from 'lucide-react';

interface Deal {
  id: number;
  title: string;
  value: number;
  stage: string;
  status: string;
  probability: number;
  expected_close_date?: string;
  contact_name?: string;
  company_name?: string;
  weighted_value: number;
}

const STAGES = [
  { key: 'qualification', label: 'Qualification', color: 'from-blue-500 to-blue-600' },
  { key: 'needs_analysis', label: 'Needs Analysis', color: 'from-indigo-500 to-indigo-600' },
  { key: 'proposal', label: 'Proposal', color: 'from-violet-500 to-violet-600' },
  { key: 'negotiation', label: 'Negotiation', color: 'from-purple-500 to-purple-600' },
  { key: 'closed_won', label: 'Closed Won', color: 'from-emerald-500 to-emerald-600' },
  { key: 'closed_lost', label: 'Closed Lost', color: 'from-slate-400 to-slate-500' }
];

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      if (!userId) {
        navigate('/welcome');
        return;
      }

      const response = await fetch('http://localhost:8056/api/deals?limit=200', {
        headers: { 'X-User-ID': userId }
      });

      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error);
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDealsByStage = (stage: string) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getStageTotal = (stage: string) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + deal.value, 0);
  };

  const getPipelineStats = () => {
    const openDeals = deals.filter(d => d.status === 'open');
    return {
      totalValue: openDeals.reduce((sum, d) => sum + d.value, 0),
      weightedValue: openDeals.reduce((sum, d) => sum + d.weighted_value, 0),
      count: openDeals.length
    };
  };

  const stats = getPipelineStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Deals Pipeline
              </h1>
              <p className="text-slate-600 mt-1">{stats.count} active deals</p>
            </div>
            <button
              onClick={() => navigate('/deals/new')}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Deal
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Pipeline Value</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Weighted Value</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.weightedValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Active Deals</p>
                <p className="text-2xl font-bold text-slate-900">{stats.count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGES.map((stage) => {
            const stageDeals = getDealsByStage(stage.key);
            const stageTotal = getStageTotal(stage.key);

            return (
              <div key={stage.key} className="flex flex-col min-h-[500px]">
                {/* Stage Header */}
                <div className={`bg-gradient-to-r ${stage.color} rounded-t-2xl p-4 text-white`}>
                  <h3 className="font-bold text-sm mb-1">{stage.label}</h3>
                  <div className="flex items-center justify-between text-xs">
                    <span>{stageDeals.length} deals</span>
                    <span className="font-semibold">{formatCurrency(stageTotal)}</span>
                  </div>
                </div>

                {/* Deals List */}
                <div className="bg-white rounded-b-2xl p-3 space-y-3 flex-1 overflow-y-auto border border-t-0 border-slate-200">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-400">No deals</p>
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => navigate(`/deals/${deal.id}`)}
                        className="bg-slate-50 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer border border-slate-100 hover:border-indigo-200 group"
                      >
                        <h4 className="font-semibold text-slate-900 mb-2 text-sm group-hover:text-indigo-600 transition-colors">
                          {deal.title}
                        </h4>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-indigo-600">
                              {formatCurrency(deal.value)}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded">
                              {deal.probability}%
                            </span>
                          </div>

                          {deal.company_name && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Building2 className="w-3 h-3" />
                              <span className="truncate">{deal.company_name}</span>
                            </div>
                          )}

                          {deal.contact_name && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <User className="w-3 h-3" />
                              <span className="truncate">{deal.contact_name}</span>
                            </div>
                          )}

                          {deal.expected_close_date && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(deal.expected_close_date)}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                          <div className="text-xs text-slate-500">
                            Weighted: <span className="font-semibold text-slate-700">{formatCurrency(deal.weighted_value)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {deals.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100 mt-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No deals yet</h3>
            <p className="text-slate-600 mb-6">Start tracking your sales opportunities</p>
            <button
              onClick={() => navigate('/deals/new')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Deal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}