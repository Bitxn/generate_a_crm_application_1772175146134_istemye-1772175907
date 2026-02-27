import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Download,
  Upload,
  Info,
  HardDrive,
  Users,
  Building2,
  TrendingUp,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface DatabaseInfo {
  user_id: string;
  database_path: string;
  file_size_bytes: number;
  file_size_mb: number;
  record_counts: {
    contacts: number;
    companies: number;
    deals: number;
    activities: number;
    notes: number;
    total: number;
  };
  created_at: string;
}

export default function Settings() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const fetchDatabaseInfo = async () => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      if (!userId) {
        navigate('/welcome');
        return;
      }

      const response = await fetch('http://localhost:8056/api/user/database/info', {
        headers: { 'X-User-ID': userId }
      });

      if (response.ok) {
        const data = await response.json();
        setDbInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch database info:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDatabase = async () => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      const response = await fetch('http://localhost:8056/api/user/database/download', {
        headers: { 'X-User-ID': userId! }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crm_backup_${new Date().toISOString().split('T')[0]}.db`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download database');
    }
  };

  const uploadDatabase = async (file: File) => {
    try {
      const userId = localStorage.getItem('crm_user_id');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8056/api/user/database/upload', {
        method: 'POST',
        headers: { 'X-User-ID': userId! },
        body: formData
      });

      if (response.ok) {
        alert('Database restored successfully! Refreshing...');
        window.location.reload();
      } else {
        alert('Failed to restore database');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to restore database');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (confirm('This will replace your current database. Continue?')) {
        uploadDatabase(file);
      }
    }
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
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-slate-600 mt-1">Manage your CRM database and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Database Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Database Information</h2>
              <p className="text-sm text-slate-600">Your personal CRM database details</p>
            </div>
          </div>

          {dbInfo && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-600">Database Size</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{dbInfo.file_size_mb.toFixed(2)} MB</p>
                  <p className="text-xs text-slate-500 mt-1">{dbInfo.file_size_bytes.toLocaleString()} bytes</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-600">Created</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(dbInfo.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                <p className="text-sm font-medium text-slate-700 mb-3">User ID</p>
                <code className="text-xs font-mono bg-white px-3 py-2 rounded-lg text-slate-700 block break-all border border-slate-200">
                  {dbInfo.user_id}
                </code>
                <p className="text-xs text-slate-600 mt-2">
                  <Info className="w-3 h-3 inline mr-1" />
                  Keep this safe - it's stored in your browser's localStorage
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Record Statistics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Record Statistics</h2>

          {dbInfo && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{dbInfo.record_counts.contacts}</p>
                <p className="text-xs text-slate-600 mt-1">Contacts</p>
              </div>

              <div className="text-center p-4 bg-violet-50 rounded-xl border border-violet-100">
                <Building2 className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{dbInfo.record_counts.companies}</p>
                <p className="text-xs text-slate-600 mt-1">Companies</p>
              </div>

              <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{dbInfo.record_counts.deals}</p>
                <p className="text-xs text-slate-600 mt-1">Deals</p>
              </div>

              <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                <Activity className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{dbInfo.record_counts.activities}</p>
                <p className="text-xs text-slate-600 mt-1">Activities</p>
              </div>

              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <Database className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{dbInfo.record_counts.total}</p>
                <p className="text-xs text-slate-600 mt-1">Total Records</p>
              </div>
            </div>
          )}
        </div>

        {/* Backup & Restore */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Backup & Restore</h2>
          <p className="text-sm text-slate-600 mb-6">
            Download your database for backup or restore from a previous backup
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download */}
            <button
              onClick={downloadDatabase}
              className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl transition-all duration-300 text-left group border border-indigo-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <Download className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Download Backup</h3>
                  <p className="text-sm text-slate-600">
                    Save your database as a .db file
                  </p>
                </div>
              </div>
            </button>

            {/* Upload */}
            <label className="p-6 bg-gradient-to-br from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200 rounded-xl transition-all duration-300 text-left group border border-violet-200 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <Upload className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Restore Backup</h3>
                  <p className="text-sm text-slate-600">
                    Upload a .db file to restore
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept=".db"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Important</p>
              <p>
                Restoring a backup will replace all current data. Make sure to download a backup first if you want to preserve your current data.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Info */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Info className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Privacy First</h3>
              <p className="text-sm text-slate-700">
                Your CRM data is stored in an isolated database file on the server, accessible only via your unique user ID. 
                No data sharing, no analytics, complete privacy. Your user ID is stored locally in your browser and never leaves your device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}