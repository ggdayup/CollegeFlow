import { Link } from 'react-router-dom';
import { User, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Profile</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Profile page is coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
