import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';

const LogoQueryTool = () => {
  const [data, setData] = useState({ website_logo: [], footer_config: [], footer_content: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [logoRes, footerConfigRes, footerContentRes] = await Promise.all([
          supabase.from('website_logo').select('*'),
          supabase.from('footer_configuration').select('*'),
          supabase.from('footer_content').select('*')
        ]);

        setData({
          website_logo: logoRes.data || [],
          footer_config: footerConfigRes.data || [],
          footer_content: footerContentRes.data || []
        });
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const parseStorageUrl = (url) => {
    if (!url) return { bucket: 'N/A', path: 'N/A' };
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (match) {
      return { bucket: match[1], path: match[2] };
    }
    return { bucket: 'Unknown/External', path: url };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">Database Logo Query Results</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Table: website_logo</h2>
        {data.website_logo.length === 0 ? (
          <p className="text-gray-500">No records found.</p>
        ) : (
          <div className="space-y-4">
            {data.website_logo.map((item) => {
              const { bucket, path } = parseStorageUrl(item.logo_url);
              return (
                <div key={item.id} className="p-4 bg-white shadow rounded-lg border">
                  <div className="flex gap-4">
                    {item.logo_url && (
                      <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded">
                        <img src={item.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2 text-sm">
                      <p><strong>ID:</strong> {item.id}</p>
                      <p><strong>URL:</strong> <a href={item.logo_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{item.logo_url}</a></p>
                      <p><strong>Bucket:</strong> {bucket}</p>
                      <p><strong>File Path:</strong> {path}</p>
                      <p><strong>Settings:</strong> <pre className="bg-gray-100 p-2 rounded text-xs mt-1">{JSON.stringify(item.settings, null, 2)}</pre></p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Table: footer_configuration (Checking JSON content)</h2>
        {data.footer_config.length === 0 ? (
          <p className="text-gray-500">No records found.</p>
        ) : (
          <div className="grid gap-4 overflow-auto">
            {data.footer_config.map((item) => (
              <div key={item.id} className="p-4 bg-white shadow rounded-lg border text-sm">
                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>Pole ID:</strong> {item.pole_id}</p>
                <div className="mt-2 text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto">
                  {JSON.stringify(item.content, null, 2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Table: footer_content (Checking fields)</h2>
        {data.footer_content.length === 0 ? (
          <p className="text-gray-500">No records found.</p>
        ) : (
          <div className="grid gap-4 overflow-auto">
            {data.footer_content.map((item) => (
              <div key={item.id} className="p-4 bg-white shadow rounded-lg border text-sm">
                 <p><strong>ID:</strong> {item.id}</p>
                 <p><strong>Pole ID:</strong> {item.pole_id}</p>
                 <pre className="mt-2 text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto">
                  {JSON.stringify(item, null, 2)}
                 </pre>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LogoQueryTool;