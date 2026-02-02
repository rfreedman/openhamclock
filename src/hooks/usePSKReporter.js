/**
 * usePSKReporter Hook
 * Fetches PSKReporter data showing where your signal is being received
 * and what stations you're hearing
 */
import { useState, useEffect, useCallback } from 'react';

export const usePSKReporter = (callsign, options = {}) => {
  const {
    minutes = 15,           // Time window in minutes (default 15)
    direction = 'both',     // 'tx' (being heard), 'rx' (hearing), or 'both'
    enabled = true,         // Enable/disable fetching
    refreshInterval = 120000 // Refresh every 2 minutes
  } = options;

  const [txData, setTxData] = useState({ count: 0, reports: [] });
  const [rxData, setRxData] = useState({ count: 0, reports: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    if (!callsign || callsign === 'N0CALL' || !enabled) {
      setTxData({ count: 0, reports: [] });
      setRxData({ count: 0, reports: [] });
      setLoading(false);
      return;
    }

    try {
      setError(null);

      if (direction === 'both') {
        // Fetch combined endpoint
        const response = await fetch(`/api/pskreporter/${encodeURIComponent(callsign)}?minutes=${minutes}`);
        if (response.ok) {
          const data = await response.json();
          setTxData(data.tx || { count: 0, reports: [] });
          setRxData(data.rx || { count: 0, reports: [] });
        }
      } else if (direction === 'tx') {
        // Fetch only TX (where am I being heard)
        const response = await fetch(`/api/pskreporter/tx/${encodeURIComponent(callsign)}?minutes=${minutes}`);
        if (response.ok) {
          const data = await response.json();
          setTxData(data);
        }
      } else if (direction === 'rx') {
        // Fetch only RX (what am I hearing)
        const response = await fetch(`/api/pskreporter/rx/${encodeURIComponent(callsign)}?minutes=${minutes}`);
        if (response.ok) {
          const data = await response.json();
          setRxData(data);
        }
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error('PSKReporter fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [callsign, minutes, direction, enabled]);

  useEffect(() => {
    fetchData();
    
    if (enabled && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, enabled, refreshInterval]);

  // Computed values
  const txReports = txData.reports || [];
  const rxReports = rxData.reports || [];
  
  // Get unique bands from TX reports
  const txBands = [...new Set(txReports.map(r => r.band))].filter(b => b !== 'Unknown');
  
  // Get unique modes from TX reports
  const txModes = [...new Set(txReports.map(r => r.mode))];
  
  // Stats
  const stats = {
    txCount: txData.count || 0,
    rxCount: rxData.count || 0,
    txBands,
    txModes,
    furthestTx: txReports.length > 0 
      ? txReports.reduce((max, r) => r.distance > (max?.distance || 0) ? r : max, null)
      : null,
    bestSnr: txReports.length > 0
      ? txReports.reduce((max, r) => (r.snr || -99) > (max?.snr || -99) ? r : max, null)
      : null
  };

  return {
    // TX data - where is my signal being heard
    txReports,
    txCount: txData.count || 0,
    
    // RX data - what am I hearing
    rxReports,
    rxCount: rxData.count || 0,
    
    // Combined
    stats,
    loading,
    error,
    lastUpdate,
    
    // Manual refresh
    refresh: fetchData
  };
};

export default usePSKReporter;
