import React, { useState } from 'react';
import { applyMigrations } from '../services/migrationService';

interface MigrationResult {
  tenantId: number;
  success: boolean;
  message: string;
}

const MigrationManagement: React.FC = () => {
  const [migrationResults, setMigrationResults] = useState<MigrationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyMigrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await applyMigrations();
      setMigrationResults(results);
    } catch (err) {
      console.error('Error applying migrations:', err);
      setError('Failed to apply migrations. Please check console for details.');
      setMigrationResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Migration Management</h1>
      <button
        onClick={handleApplyMigrations}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Applying Migrations...' : 'Apply Pending Migrations to All Tenants'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {migrationResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Migration Results:</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Tenant ID</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Message</th>
                </tr>
              </thead>
              <tbody>
                {migrationResults.map((result, index) => (
                  <tr key={index} className={result.success ? 'bg-green-100' : 'bg-red-100'}>
                    <td className="py-2 px-4 border-b">{result.tenantId}</td>
                    <td className="py-2 px-4 border-b">{result.success ? 'Success' : 'Error'}</td>
                    <td className="py-2 px-4 border-b">{result.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationManagement;
