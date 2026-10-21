import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Clock,
  Briefcase,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { AdminMetrics, ProviderProfile, ProviderDocument } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [pendingProviders, setPendingProviders] = useState<ProviderProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [metricsRes, pendingRes, logsRes] = await Promise.all([
        apiRequest<AdminMetrics>('/admin/metrics', {}, currentUser.id),
        apiRequest<ProviderProfile[]>('/admin/providers/pending', {}, currentUser.id),
        apiRequest<any[]>('/admin/audit-logs', {}, currentUser.id),
      ]);

      if (metricsRes.success) setMetrics(metricsRes.data);
      if (pendingRes.success) setPendingProviders(pendingRes.data);
      if (logsRes.success) setAuditLogs(logsRes.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [currentUser.id]);

  const handleVerify = async (providerId: string, decision: 'approve' | 'reject') => {
    const notes = prompt(`Enter notes for ${decision}ing this provider:`, decision === 'approve' ? 'All documents verified' : 'Incomplete documentation');
    if (notes === null) return;

    setActionLoadingId(providerId);
    try {
      const res = await apiRequest(
        `/admin/providers/${providerId}/verify`,
        {
          method: 'POST',
          body: JSON.stringify({ decision, notes }),
        },
        currentUser.id
      );

      if (res.success) {
        alert((res as any).message || `Provider ${decision}d.`);
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Verification action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-64 bg-stone-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              FixNear Marketplace Administration
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Ground-truth live metrics, provider application vetting, and compliance logging
          </p>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-l-4 border-l-emerald-600">
            <span className="text-xs text-stone-500 font-medium">Total Gross GMV</span>
            <p className="text-2xl font-extrabold text-stone-900 mt-1">₹{metrics.total_gmv_inr}</p>
            <span className="text-[11px] text-emerald-700 block mt-1">Completed + active bookings</span>
          </Card>

          <Card className="p-5 border-l-4 border-l-brand-600">
            <span className="text-xs text-stone-500 font-medium">Platform Net Revenue</span>
            <p className="text-2xl font-extrabold text-brand-700 mt-1">₹{metrics.platform_revenue_inr}</p>
            <span className="text-[11px] text-stone-500 block mt-1">15% commission + ₹49 platform fee</span>
          </Card>

          <Card className="p-5 border-l-4 border-l-blue-600">
            <span className="text-xs text-stone-500 font-medium">Bookings Volume</span>
            <p className="text-2xl font-extrabold text-stone-900 mt-1">{metrics.total_bookings}</p>
            <span className="text-[11px] text-blue-700 block mt-1">{metrics.active_bookings} ongoing jobs</span>
          </Card>

          <Card className="p-5 border-l-4 border-l-amber-500">
            <span className="text-xs text-stone-500 font-medium">Provider Applications</span>
            <p className="text-2xl font-extrabold text-stone-900 mt-1">{metrics.total_providers}</p>
            <span className="text-[11px] text-amber-700 font-semibold block mt-1">{metrics.pending_verification} pending review</span>
          </Card>
        </div>
      )}

      {/* Provider Verification Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <span>Provider Verification Queue</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
              {pendingProviders.length} pending
            </span>
          </h2>
        </div>

        {pendingProviders.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs text-stone-600">All provider applications have been reviewed. Verification queue is clear.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProviders.map((pro) => (
              <Card key={pro.id} className="p-6 border-amber-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80"
                      alt={pro.business_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">{pro.business_name}</h3>
                      <p className="text-xs text-stone-500">
                        {pro.full_name} • {pro.email} • {pro.phone}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 rounded-full w-max">
                    Status: Pending Verification
                  </span>
                </div>

                <div className="py-4 space-y-3 text-xs text-stone-700">
                  <div>
                    <span className="text-stone-500 font-semibold block mb-1">Professional Experience & Bio:</span>
                    <p className="bg-surface-50 p-3 rounded-lg border border-stone-200 leading-relaxed">
                      {pro.bio} ({pro.experience_years} years experience, coverage radius: {pro.service_radius_km} km)
                    </p>
                  </div>

                  {/* Submitted Documents */}
                  <div>
                    <span className="text-stone-500 font-semibold block mb-1">Submitted Identification & Trade Documents:</span>
                    <div className="flex flex-wrap gap-2">
                      {pro.documents && pro.documents.length > 0 ? (
                        pro.documents.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.document_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 border border-stone-300 rounded-lg text-stone-800 hover:bg-surface-200 transition-colors font-medium"
                          >
                            <FileText className="w-3.5 h-3.5 text-brand-600" />
                            <span>{doc.file_name}</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </a>
                        ))
                      ) : (
                        <span className="text-stone-500 italic">No document links attached.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review Action Buttons */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={actionLoadingId === pro.id}
                    onClick={() => handleVerify(pro.id, 'reject')}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject Application
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    isLoading={actionLoadingId === pro.id}
                    onClick={() => handleVerify(pro.id, 'approve')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Approve & Grant Verified Badge
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
          <span>Administrative Audit Logs</span>
          <span className="text-xs text-stone-500 font-normal">(Tamper-evident system actions)</span>
        </h2>

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-surface-100 text-stone-700 uppercase font-semibold text-[10px] tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Target Table</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-50">
                    <td className="p-3.5 whitespace-nowrap text-stone-500">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3.5 font-semibold text-stone-900">
                      <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded font-mono text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-stone-600">{log.target_table}</td>
                    <td className="p-3.5 text-stone-700">{JSON.stringify(log.details)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
