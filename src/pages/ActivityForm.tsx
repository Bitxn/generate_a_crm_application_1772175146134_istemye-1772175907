import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Phone, Mail, Calendar, CheckCircle, FileText } from 'lucide-react';

interface ActivityForm {
  activity_type: string;
  subject: string;
  description: string;
  activity_date: string;
  duration_minutes: number;
  contact_id: number | null;
  company_id: number | null;
  deal_id: number | null;
  status: string;
  priority: string;
}

interface Contact {
  id: number;
  full_name: string;
}

interface Company {
  id: number;
  name: string;
}

interface Deal {
  id: number;
  title: string;
}

export default function ActivityForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [formData, setFormData] = useState<ActivityForm>({
    activity_type: 'call',
    subject: '',
    description: '',
    activity_date: new Date().toISOString().slice(0, 16),
    duration_minutes: 30,
    contact_id: null,
    company_id: null,
    deal_id: null,
    status: 'pending',
    priority: 'medium'
  });

  useEffect(() => {
    fetchContacts();
    fetchCompanies();
    fetchDeals();
  }, []);

  const fetchContacts = async () => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      const response = await fetch('http://localhost:8056/api/contacts?limit=200', {
        headers: { 'X-User-ID': userId! }
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      const response = await fetch('http://localhost:8056/api/companies?limit=200', {
        headers: { 'X-User-ID': userId! }
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchDeals = async () => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      const response = await fetch('http://localhost:8056/api/deals?limit=200', {
        headers: { 'X-User-ID': userId! }
      });
      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('crm_user_id');
      const response = await fetch('http://localhost:8056/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId!
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate('/activities');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to save activity');
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
      alert('Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  const activityTypes = [
    { value: 'call', label: 'Phone Call', icon: Phone, color: 'from-blue-500 to-blue-600' },
    { value: 'email', label: 'Email', icon: Mail, color: 'from-violet-500 to-violet-600' },
    { value: 'meeting', label: 'Meeting', icon: Calendar, color: 'from-emerald-500 to-emerald-600' },
    { value: 'task', label: 'Task', icon: CheckCircle, color: 'from-amber-500 to-amber-600' },
    { value: 'note', label: 'Note', icon: FileText, color: 'from-slate-500 to-slate-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/activities')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Log Activity
              </h1>
              <p className="text-slate-600 text-sm mt-1">Record your interactions and tasks</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Type Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Activity Type</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {activityTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, activity_type: type.value })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.activity_type === type.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${type.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">{type.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Brief summary of the activity"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Add detailed notes..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.activity_date}
                    onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Associations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Link to Records</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact</label>
                <select
                  value={formData.contact_id || ''}
                  onChange={(e) => setFormData({ ...formData, contact_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">None</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>{contact.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                <select
                  value={formData.company_id || ''}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">None</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Deal</label>
                <select
                  value={formData.deal_id || ''}
                  onChange={(e) => setFormData({ ...formData, deal_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">None</option>
                  {deals.map(deal => (
                    <option key={deal.id} value={deal.id}>{deal.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/activities')}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Log Activity
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}