import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Globe,
  X,
  Filter,
  ChevronDown
} from 'lucide-react';

interface Company {
  id: number;
  name: string;
  website?: string;
  industry?: string;
  company_size?: string;
  company_type: string;
  priority: string;
  contact_count: number;
  deal_count: number;
  total_revenue: number;
  created_at: string;
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, [typeFilter]);

  const fetchCompanies = async () => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      if (!userId) {
        navigate('/welcome');
        return;
      }

      let url = 'http://localhost:8056/api/companies?limit=100';
      if (typeFilter) url += `&company_type=${typeFilter}`;

      const response = await fetch(url, {
        headers: { 'X-User-ID': userId }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id: number) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
      const userId = localStorage.getItem('crm_user_id');
      const response = await fetch(`http://localhost:8056/api/companies/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-ID': userId! }
      });

      if (response.ok) {
        setCompanies(companies.filter(c => c.id !== id));
        setSelectedCompany(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      prospect: 'bg-blue-100 text-blue-700 border-blue-200',
      customer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      partner: 'bg-violet-100 text-violet-700 border-violet-200',
      vendor: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-amber-100 text-amber-600',
      critical: 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-slate-100 text-slate-600';
  };

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
                Companies
              </h1>
              <p className="text-slate-600 mt-1">{filteredCompanies.length} companies</p>
            </div>
            <button
              onClick={() => navigate('/companies/new')}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Company
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies by name or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-xl border transition-all flex items-center gap-2 font-medium ${
                showFilters
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setTypeFilter('')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  typeFilter === ''
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('prospect')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  typeFilter === 'prospect'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Prospects
              </button>
              <button
                onClick={() => setTypeFilter('customer')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  typeFilter === 'customer'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setTypeFilter('partner')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  typeFilter === 'partner'
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Partners
              </button>
            </div>
          )}
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No companies found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || typeFilter
                ? 'Try adjusting your filters'
                : 'Get started by adding your first company'}
            </p>
            {!searchTerm && !typeFilter && (
              <button
                onClick={() => navigate('/companies/new')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Company
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                      {company.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{company.name}</h3>
                      {company.industry && (
                        <p className="text-sm text-slate-600 truncate">{company.industry}</p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setSelectedCompany(selectedCompany === company.id ? null : company.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>
                    {selectedCompany === company.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-10">
                        <button
                          onClick={() => navigate(`/companies/${company.id}`)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm font-medium text-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(`/companies/${company.id}/edit`)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm font-medium text-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCompany(company.id)}
                          className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm font-medium text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Website */}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mb-4 px-3 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-sm text-slate-600 hover:text-indigo-600"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-900">{company.contact_count}</p>
                    <p className="text-xs text-slate-600">Contacts</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-slate-900">{company.deal_count}</p>
                    <p className="text-xs text-slate-600">Deals</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <DollarSign className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-900">{formatCurrency(company.total_revenue)}</p>
                    <p className="text-xs text-slate-600">Revenue</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(company.company_type)}`}>
                    {company.company_type}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getPriorityColor(company.priority)}`}>
                    {company.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}