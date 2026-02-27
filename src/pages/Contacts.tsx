import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Download,
  Mail,
  Phone,
  Building2,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  X,
  ChevronDown
} from 'lucide-react';

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  title?: string;
  company_name?: string;
  status: string;
  lead_score: number;
  created_at: string;
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const fetchContacts = async () => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      if (!userId) {
        navigate('/welcome');
        return;
      }

      let url = 'http://localhost:8056/api/contacts?limit=100';
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url, {
        headers: { 'X-User-ID': userId }
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      const response = await fetch('http://localhost:8056/api/contacts/export/csv', {
        headers: { 'X-User-ID': userId! }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contacts.csv';
        a.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const deleteContact = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const userId = localStorage.getItem('crm_user_id');
      const response = await fetch(`http://localhost:8056/api/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-ID': userId! }
      });

      if (response.ok) {
        setContacts(contacts.filter(c => c.id !== id));
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-700 border-blue-200',
      prospect: 'bg-amber-100 text-amber-700 border-amber-200',
      customer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      partner: 'bg-violet-100 text-violet-700 border-violet-200'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    if (score >= 30) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
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
                Contacts
              </h1>
              <p className="text-slate-600 mt-1">{filteredContacts.length} contacts</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => navigate('/contacts/new')}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Contact
              </button>
            </div>
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
                placeholder="Search contacts by name, email, title, or company..."
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
                onClick={() => setStatusFilter('')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === ''
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('lead')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === 'lead'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Leads
              </button>
              <button
                onClick={() => setStatusFilter('prospect')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === 'prospect'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Prospects
              </button>
              <button
                onClick={() => setStatusFilter('customer')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === 'customer'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Customers
              </button>
            </div>
          )}
        </div>

        {/* Contacts Grid */}
        {filteredContacts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No contacts found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || statusFilter
                ? 'Try adjusting your filters'
                : 'Get started by adding your first contact'}
            </p>
            {!searchTerm && !statusFilter && (
              <button
                onClick={() => navigate('/contacts/new')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Contact
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {contact.first_name[0]}{contact.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{contact.full_name}</h3>
                      {contact.title && (
                        <p className="text-sm text-slate-600 truncate">{contact.title}</p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setSelectedContact(selectedContact === contact.id ? null : contact.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>
                    {selectedContact === contact.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-10">
                        <button
                          onClick={() => navigate(`/contacts/${contact.id}`)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm font-medium text-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(`/contacts/${contact.id}/edit`)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm font-medium text-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm font-medium text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company */}
                {contact.company_name && (
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-slate-50 rounded-lg">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-700 font-medium truncate">{contact.company_name}</span>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors group/email"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="truncate group-hover/email:underline">{contact.email}</span>
                  </a>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors group/phone"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="group-hover/phone:underline">{contact.phone}</span>
                    </a>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className={`text-sm font-bold px-2 py-1 rounded-lg ${getScoreColor(contact.lead_score)}`}>
                      {contact.lead_score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}