/**
 * PSKReporter Panel
 * Shows where your digital mode signals are being received
 * Toggles between PSKReporter (internet) and WSJT-X (local UDP) views
 */
import React, { useState, useMemo } from 'react';
import { usePSKReporter } from '../hooks/usePSKReporter.js';
import { getBandColor } from '../utils/callsign.js';

const PSKReporterPanel = ({ 
  callsign, 
  onShowOnMap, 
  showOnMap, 
  onToggleMap,
  filters = {},
  onOpenFilters,
  // WSJT-X props
  wsjtxDecodes = [],
  wsjtxClients = {},
  wsjtxQsos = [],
  wsjtxStats = {},
  wsjtxLoading,
  wsjtxEnabled,
  wsjtxPort,
  showWSJTXOnMap,
  onToggleWSJTXMap
}) => {
  const [panelMode, setPanelMode] = useState('psk'); // 'psk' | 'wsjtx'
  const [activeTab, setActiveTab] = useState('tx'); // PSK: tx | rx
  const [wsjtxTab, setWsjtxTab] = useState('decodes'); // WSJT-X: decodes | qsos
  const [bandFilter, setBandFilter] = useState('all');
  const [showCQ, setShowCQ] = useState(false);
  
  const { 
    txReports, 
    txCount, 
    rxReports, 
    rxCount, 
    loading, 
    error,
    connected,
    source,
    refresh 
  } = usePSKReporter(callsign, { 
    minutes: 15,
    enabled: callsign && callsign !== 'N0CALL'
  });

  // PSK filter logic
  const filterReports = (reports) => {
    return reports.filter(r => {
      if (filters?.bands?.length && !filters.bands.includes(r.band)) return false;
      if (filters?.grids?.length) {
        const grid = activeTab === 'tx' ? r.receiverGrid : r.senderGrid;
        if (!grid) return false;
        const gridPrefix = grid.substring(0, 2).toUpperCase();
        if (!filters.grids.includes(gridPrefix)) return false;
      }
      if (filters?.modes?.length && !filters.modes.includes(r.mode)) return false;
      return true;
    });
  };

  const filteredTx = useMemo(() => filterReports(txReports), [txReports, filters, activeTab]);
  const filteredRx = useMemo(() => filterReports(rxReports), [rxReports, filters, activeTab]);
  const filteredReports = activeTab === 'tx' ? filteredTx : filteredRx;

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters?.bands?.length) count++;
    if (filters?.grids?.length) count++;
    if (filters?.modes?.length) count++;
    return count;
  };
  const filterCount = getActiveFilterCount();

  const getFreqColor = (freqMHz) => {
    if (!freqMHz) return 'var(--text-muted)';
    return getBandColor(parseFloat(freqMHz));
  };

  const formatAge = (minutes) => {
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes/60)}h`;
  };

  const getStatusIndicator = () => {
    if (connected) return <span style={{ color: '#4ade80', fontSize: '10px' }}>● LIVE</span>;
    if (source === 'connecting' || source === 'reconnecting') return <span style={{ color: '#fbbf24', fontSize: '10px' }}>◐ {source}</span>;
    if (error) return <span style={{ color: '#ef4444', fontSize: '10px' }}>● offline</span>;
    return null;
  };

  // WSJT-X helpers
  const activeClients = Object.entries(wsjtxClients);
  const primaryClient = activeClients.length > 0 ? activeClients[0][1] : null;

  const wsjtxBands = useMemo(() => {
    const bands = new Set(wsjtxDecodes.map(d => d.band).filter(Boolean));
    return ['all', ...Array.from(bands).sort((a, b) => (parseInt(b) || 999) - (parseInt(a) || 999))];
  }, [wsjtxDecodes]);

  const filteredDecodes = useMemo(() => {
    let filtered = [...wsjtxDecodes];
    if (bandFilter !== 'all') filtered = filtered.filter(d => d.band === bandFilter);
    if (showCQ) filtered = filtered.filter(d => d.type === 'CQ');
    return filtered.reverse();
  }, [wsjtxDecodes, bandFilter, showCQ]);

  const getSnrColor = (snr) => {
    if (snr === null || snr === undefined) return 'var(--text-muted)';
    if (snr >= 0) return '#4ade80';
    if (snr >= -10) return '#fbbf24';
    if (snr >= -18) return '#fb923c';
    return '#ef4444';
  };

  const getMsgColor = (decode) => {
    if (decode.type === 'CQ') return '#60a5fa';
    if (decode.exchange === 'RR73' || decode.exchange === '73' || decode.exchange === 'RRR') return '#4ade80';
    if (decode.exchange?.startsWith('R')) return '#fbbf24';
    return 'var(--text-primary)';
  };

  // Mode switch button style
  const modeBtn = (mode, color) => ({
    padding: '2px 8px',
    background: panelMode === mode ? `${color}22` : 'transparent',
    border: `1px solid ${panelMode === mode ? color : 'var(--border-color)'}`,
    color: panelMode === mode ? color : 'var(--text-muted)',
    borderRadius: '3px',
    fontSize: '10px',
    cursor: 'pointer',
    fontWeight: panelMode === mode ? '700' : '400',
  });

  return (
    <div className="panel" style={{ 
      padding: '10px', 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Mode switcher header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '4px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          <button onClick={() => setPanelMode('psk')} style={modeBtn('psk', 'var(--accent-primary)')}>
            📡 PSKReporter
          </button>
          <button onClick={() => setPanelMode('wsjtx')} style={modeBtn('wsjtx', '#a78bfa')}>
            🔊 WSJT-X
          </button>
        </div>
        
        {/* Controls row - differs per mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {panelMode === 'psk' && (
            <>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                {filteredReports.length}/{activeTab === 'tx' ? txCount : rxCount}
              </span>
              {getStatusIndicator()}
              <button onClick={onOpenFilters} style={{
                background: filterCount > 0 ? 'rgba(255, 170, 0, 0.3)' : 'rgba(100, 100, 100, 0.3)',
                border: `1px solid ${filterCount > 0 ? '#ffaa00' : '#666'}`,
                color: filterCount > 0 ? '#ffaa00' : '#888',
                padding: '2px 6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer'
              }}>🔍</button>
              <button onClick={refresh} disabled={loading} style={{
                background: 'rgba(100, 100, 100, 0.3)', border: '1px solid #666',
                color: '#888', padding: '2px 6px', borderRadius: '4px', fontSize: '10px',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1
              }}>🔄</button>
              {onToggleMap && (
                <button onClick={onToggleMap} style={{
                  background: showOnMap ? 'rgba(68, 136, 255, 0.3)' : 'rgba(100, 100, 100, 0.3)',
                  border: `1px solid ${showOnMap ? '#4488ff' : '#666'}`,
                  color: showOnMap ? '#4488ff' : '#888',
                  padding: '2px 6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer'
                }}>🗺️ {showOnMap ? 'ON' : 'OFF'}</button>
              )}
            </>
          )}
          {panelMode === 'wsjtx' && (
            <>
              {primaryClient && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {primaryClient.mode || ''} {primaryClient.band || ''}
                  {primaryClient.transmitting && <span style={{ color: '#ef4444', marginLeft: '3px' }}>TX</span>}
                  {primaryClient.decoding && <span style={{ color: '#4ade80', marginLeft: '3px' }}>RX</span>}
                </span>
              )}
              <select value={bandFilter} onChange={(e) => setBandFilter(e.target.value)} style={{
                background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
                border: '1px solid var(--border-color)', borderRadius: '3px',
                fontSize: '10px', padding: '1px 2px', cursor: 'pointer'
              }}>
                {wsjtxBands.map(b => <option key={b} value={b}>{b === 'all' ? 'All' : b}</option>)}
              </select>
              <button onClick={() => setShowCQ(!showCQ)} style={{
                background: showCQ ? '#60a5fa33' : 'transparent',
                color: showCQ ? '#60a5fa' : 'var(--text-muted)',
                border: `1px solid ${showCQ ? '#60a5fa55' : 'var(--border-color)'}`,
                borderRadius: '3px', fontSize: '10px', padding: '1px 4px', cursor: 'pointer'
              }}>CQ</button>
              {onToggleWSJTXMap && (
                <button onClick={onToggleWSJTXMap} style={{
                  background: showWSJTXOnMap ? 'rgba(167, 139, 250, 0.3)' : 'rgba(100, 100, 100, 0.3)',
                  border: `1px solid ${showWSJTXOnMap ? '#a78bfa' : '#666'}`,
                  color: showWSJTXOnMap ? '#a78bfa' : '#888',
                  padding: '2px 6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer'
                }}>🗺️ {showWSJTXOnMap ? 'ON' : 'OFF'}</button>
              )}
            </>
          )}
        </div>
      </div>

      {/* === PSKReporter View === */}
      {panelMode === 'psk' && (
        <>
          {(!callsign || callsign === 'N0CALL') ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '10px', fontSize: '11px' }}>
              Set callsign in Settings
            </div>
          ) : (
            <>
              {/* PSK Tabs */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexShrink: 0 }}>
                <button onClick={() => setActiveTab('tx')} style={{
                  flex: 1, padding: '4px 6px',
                  background: activeTab === 'tx' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                  border: `1px solid ${activeTab === 'tx' ? '#4ade80' : '#555'}`,
                  borderRadius: '3px', color: activeTab === 'tx' ? '#4ade80' : '#888',
                  cursor: 'pointer', fontSize: '10px', fontFamily: 'JetBrains Mono'
                }}>
                  📤 Being Heard ({filterCount > 0 ? filteredTx.length : txCount})
                </button>
                <button onClick={() => setActiveTab('rx')} style={{
                  flex: 1, padding: '4px 6px',
                  background: activeTab === 'rx' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                  border: `1px solid ${activeTab === 'rx' ? '#60a5fa' : '#555'}`,
                  borderRadius: '3px', color: activeTab === 'rx' ? '#60a5fa' : '#888',
                  cursor: 'pointer', fontSize: '10px', fontFamily: 'JetBrains Mono'
                }}>
                  📥 Hearing ({filterCount > 0 ? filteredRx.length : rxCount})
                </button>
              </div>

              {/* PSK Reports list */}
              {error && !connected ? (
                <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
                  ⚠️ Connection failed - click 🔄 to retry
                </div>
              ) : loading && filteredReports.length === 0 && filterCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '15px', color: 'var(--text-muted)', fontSize: '11px' }}>
                  <div className="loading-spinner" style={{ margin: '0 auto 8px' }} />
                  Connecting to MQTT...
                </div>
              ) : !connected && filteredReports.length === 0 && filterCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
                  Waiting for connection...
                </div>
              ) : filteredReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
                  {filterCount > 0 
                    ? 'No spots match filters'
                    : activeTab === 'tx' 
                      ? 'Waiting for spots... (TX to see reports)' 
                      : 'No stations heard yet'}
                </div>
              ) : (
                <div style={{ flex: 1, overflow: 'auto', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                  {filteredReports.slice(0, 20).map((report, i) => {
                    const freqMHz = report.freqMHz || (report.freq ? (report.freq / 1000000).toFixed(3) : '?');
                    const color = getFreqColor(freqMHz);
                    const displayCall = activeTab === 'tx' ? report.receiver : report.sender;
                    const grid = activeTab === 'tx' ? report.receiverGrid : report.senderGrid;
                    
                    return (
                      <div
                        key={`${displayCall}-${report.freq}-${i}`}
                        onClick={() => onShowOnMap && report.lat && report.lon && onShowOnMap(report)}
                        style={{
                          display: 'grid', gridTemplateColumns: '55px 1fr auto',
                          gap: '6px', padding: '4px 6px', borderRadius: '3px', marginBottom: '2px',
                          background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                          cursor: report.lat && report.lon ? 'pointer' : 'default',
                          transition: 'background 0.15s', borderLeft: '2px solid transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(68, 136, 255, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'}
                      >
                        <div style={{ color, fontWeight: '600', fontSize: '11px' }}>{freqMHz}</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11px' }}>
                          {displayCall}
                          {grid && <span style={{ color: 'var(--text-muted)', fontWeight: '400', marginLeft: '4px', fontSize: '9px' }}>{grid}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{report.mode}</span>
                          {report.snr !== null && report.snr !== undefined && (
                            <span style={{ color: report.snr >= 0 ? '#4ade80' : report.snr >= -10 ? '#fbbf24' : '#f97316', fontWeight: '600' }}>
                              {report.snr > 0 ? '+' : ''}{report.snr}
                            </span>
                          )}
                          <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{formatAge(report.age)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* === WSJT-X View === */}
      {panelMode === 'wsjtx' && (
        <>
          {/* WSJT-X Tabs */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '4px', flexShrink: 0 }}>
            {[
              { key: 'decodes', label: `Decodes (${wsjtxDecodes.length})` },
              { key: 'qsos', label: `QSOs (${wsjtxQsos.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setWsjtxTab(tab.key)}
                style={{
                  flex: 1,
                  background: wsjtxTab === tab.key ? 'var(--bg-tertiary)' : 'transparent',
                  color: wsjtxTab === tab.key ? '#a78bfa' : 'var(--text-muted)',
                  border: 'none',
                  borderBottom: wsjtxTab === tab.key ? '2px solid #a78bfa' : '2px solid transparent',
                  fontSize: '10px', padding: '3px 6px', cursor: 'pointer',
                  borderRadius: '3px 3px 0 0',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* No WSJT-X connected */}
          {!wsjtxLoading && activeClients.length === 0 && wsjtxDecodes.length === 0 ? (
            <div style={{ 
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '6px', color: 'var(--text-muted)',
              fontSize: '11px', textAlign: 'center', padding: '8px'
            }}>
              <div>Waiting for WSJT-X...</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                Settings → Reporting → UDP Server
                <br />
                Address: {'{server IP}'} &nbsp; Port: {wsjtxPort || 2237}
              </div>
            </div>
          ) : (
            <>
              {/* Decodes / QSOs content */}
              <div style={{ 
                flex: 1, overflowY: 'auto', overflowX: 'hidden',
                fontSize: '11px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}>
                {wsjtxTab === 'decodes' && (
                  <>
                    {filteredDecodes.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px', fontSize: '11px' }}>
                        {wsjtxDecodes.length > 0 ? 'No decodes match filter' : 'Listening for decodes...'}
                      </div>
                    ) : (
                      filteredDecodes.map((d, i) => (
                        <div 
                          key={d.id || i}
                          style={{
                            display: 'flex', gap: '6px', padding: '2px 0',
                            borderBottom: '1px solid var(--border-color)',
                            alignItems: 'baseline',
                            opacity: d.lowConfidence ? 0.6 : 1,
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)', minWidth: '48px', fontSize: '10px' }}>{d.time}</span>
                          <span style={{ color: getSnrColor(d.snr), minWidth: '28px', textAlign: 'right', fontSize: '10px' }}>
                            {d.snr != null ? (d.snr >= 0 ? `+${d.snr}` : d.snr) : ''}
                          </span>
                          <span style={{ color: 'var(--text-muted)', minWidth: '28px', textAlign: 'right', fontSize: '10px' }}>{d.dt}</span>
                          <span style={{ 
                            color: d.band ? getBandColor(d.dialFrequency / 1000000) : 'var(--text-muted)',
                            minWidth: '36px', textAlign: 'right', fontSize: '10px'
                          }}>{d.freq}</span>
                          <span style={{ 
                            color: getMsgColor(d), flex: 1, whiteSpace: 'nowrap',
                            overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>{d.message}</span>
                        </div>
                      ))
                    )}
                  </>
                )}

                {wsjtxTab === 'qsos' && (
                  <>
                    {wsjtxQsos.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px', fontSize: '11px' }}>
                        No QSOs logged yet
                      </div>
                    ) : (
                      [...wsjtxQsos].reverse().map((q, i) => (
                        <div key={i} style={{
                          display: 'flex', gap: '6px', padding: '3px 0',
                          borderBottom: '1px solid var(--border-color)', alignItems: 'baseline',
                        }}>
                          <span style={{ color: q.band ? getBandColor(q.frequency / 1000000) : 'var(--accent-green)', fontWeight: '600', minWidth: '70px' }}>
                            {q.dxCall}
                          </span>
                          <span style={{ color: 'var(--text-muted)', minWidth: '40px', fontSize: '10px' }}>{q.band}</span>
                          <span style={{ color: 'var(--text-muted)', minWidth: '30px', fontSize: '10px' }}>{q.mode}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{q.reportSent}/{q.reportRecv}</span>
                          {q.dxGrid && <span style={{ color: '#a78bfa', fontSize: '10px' }}>{q.dxGrid}</span>}
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>

              {/* WSJT-X status bar */}
              {activeClients.length > 0 && (
                <div style={{ 
                  fontSize: '9px', color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '3px', marginTop: '3px',
                  display: 'flex', justifyContent: 'space-between', flexShrink: 0
                }}>
                  <span>
                    {activeClients.map(([id, c]) => `${id}${c.version ? ` v${c.version}` : ''}`).join(', ')}
                  </span>
                  {primaryClient?.dialFrequency && (
                    <span style={{ color: '#a78bfa' }}>
                      {(primaryClient.dialFrequency / 1000000).toFixed(6)} MHz
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PSKReporterPanel;

export { PSKReporterPanel };
