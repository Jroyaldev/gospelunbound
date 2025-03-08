'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const router = useRouter();

  const runMigration = async () => {
    if (!confirm('Are you sure you want to run the database migration?')) {
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        // Refresh after successful migration
        setTimeout(() => {
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Migration</h1>
      
      <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
        <h2 className="text-lg font-semibold text-amber-800 mb-2">⚠️ Warning</h2>
        <p className="text-amber-700">
          This will add the <code className="bg-amber-100 px-1 rounded">parent_id</code> column to the 
          <code className="bg-amber-100 px-1 rounded">post_comments</code> table. This is required for replies to work correctly.
        </p>
      </div>
      
      <button
        onClick={runMigration}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Running Migration...' : 'Run Migration'}
      </button>
      
      {result && (
        <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.success ? 'Success' : 'Error'}
          </h3>
          {result.message && <p className="mt-1">{result.message}</p>}
          {result.error && <p className="mt-1 text-red-600">{result.error}</p>}
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">What this fixes:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Adds the <code className="bg-gray-100 px-1 rounded">parent_id</code> column to <code className="bg-gray-100 px-1 rounded">post_comments</code> table</li>
          <li>Enables proper reply functionality in discussions</li>
          <li>Allows likes on replies to work properly and persist</li>
          <li>Creates an index for better performance when searching for replies</li>
        </ul>
        
        <div className="mt-6">
          <button
            onClick={() => router.push('/community')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Back to Community
          </button>
        </div>
      </div>
    </div>
  );
} 