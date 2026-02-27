import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  ChevronDown,
  Building2,
  User
} from 'lucide-react';

interface Activity {
  id: number;
  activity_type: string;
  subject: string;
  description?: string;
  activity_date: string;
  duration_minutes?: number;
  contact_name?: string;
  company_name?: string;
  deal_title?: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
  }, [typeFilter, statusFilter]);

  const fetchActivities = async () => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      if (!userId) {
        navigate('/welcome');
        return;
      }

      let url = 'http://localhost:8056/api/activities?limit=100';
      if (typeFilter) url += `&activity_type=${typeFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url, {
        headers: { 'X-User-ID': userId }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'meeting':
        return <Calendar className="w-5 h-5" />;
      case 'task':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    const colors = {
      call: 'from-blue-500 to-blue-600',
      email: 'from-violet-500 to-violet-600',
      meeting: 'from-emerald-500 to-emerald-600',
      task: 'from-amber-500 to-amber-600',
      note: 'from-slate-500 to-slate-600'
    };
    return colors[type as keyof typeof colors] || 'from-slate-500 to-slate-600';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      critical: 'bg-red-100 text-red-600'
    };
    return styles[priority as keyof typeof styles] || styles.medium;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const groupByDate = (activities: Activity[]) => {
    const grouped: { [key: string]: Activity[] } = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.activity_date);
      const key = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(activity);
    });

    return grouped;
  };

  const groupedActivities = groupByDate(activities);

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
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Activities
              </h1>
              <p className="text-slate-600 mt-1">{activities.length} activities</p>
            </div>
            <button
              onClick={() => navigate('/activities/new')}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Log Activity
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Filter Activities</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Activity Type</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTypeFilter('')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      typeFilter === ''
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  {['call', 'email', 'meeting', 'task', 'note'].map(type => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize ${
                        typeFilter === type
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter('')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      statusFilter === ''
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  {['pending', 'completed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize ${
                        statusFilter === status
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activities Timeline */}
        {activities.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No activities yet</h3>
            <p className="text-slate-600 mb-6">Start tracking your interactions and tasks</p>
            <button
              onClick={() => navigate('/activities/new')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Log Your First Activity
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{date}</h3>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div className="space-y-3">
                  {dayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${getActivityColor(activity.activity_type)} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                          {getActivityIcon(activity.activity_type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 mb-1">{activity.subject}</h4>
                              {activity.description && (
                                <p className="text-sm text-slate-600 line-clamp-2">{activity.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getPriorityBadge(activity.priority)}`}>
                                {activity.priority.toUpperCase()}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(activity.status)}`}>
                                {activity.status}
                              </span>
                            </div>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mt-3">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatDateTime(activity.activity_date)}</span>
                            </div>

                            {activity.duration_minutes && (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>{formatDuration(activity.duration_minutes)}</span>
                              </div>
                            )}

                            {activity.contact_name && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{activity.contact_name}</span>
                              </div>
                            )}

                            {activity.company_name && (
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                <span>{activity.company_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}