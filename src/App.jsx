import React, { useState } from 'react';
import { Search, Scale, TrendingUp, AlertTriangle, BookOpen, Clock, Award, ChevronRight, CheckCircle, FileText, AlertCircle, Flame, ChevronDown, LogOut, Shield } from 'lucide-react';

const COURTS = {
  "Federal Circuits": [
    { id: "scotus", name: "U.S. Supreme Court" },
    { id: "ca1", name: "1st Circuit" },
    { id: "ca2", name: "2nd Circuit" },
    { id: "ca3", name: "3rd Circuit" },
    { id: "ca4", name: "4th Circuit" },
    { id: "ca5", name: "5th Circuit" },
    { id: "ca6", name: "6th Circuit" },
    { id: "ca7", name: "7th Circuit" },
    { id: "ca8", name: "8th Circuit" },
    { id: "ca9", name: "9th Circuit" },
    { id: "ca10", name: "10th Circuit" },
    { id: "ca11", name: "11th Circuit" },
    { id: "cadc", name: "D.C. Circuit" },
    { id: "cafc", name: "Federal Circuit" },
  ],
  "California": [
    { id: "cal", name: "CA Supreme Court" },
    { id: "calctapp", name: "CA Court of Appeal (All)" },
    { id: "calctapp1d", name: "CA Court of Appeal, 1st Dist" },
    { id: "calctapp2d", name: "CA Court of Appeal, 2nd Dist (LA)" },
    { id: "calctapp3d", name: "CA Court of Appeal, 3rd Dist" },
    { id: "calctapp4d", name: "CA Court of Appeal, 4th Dist" },
    { id: "calctapp5d", name: "CA Court of Appeal, 5th Dist" },
    { id: "calctapp6d", name: "CA Court of Appeal, 6th Dist" },
  ],
  "Texas": [
    { id: "tex", name: "TX Supreme Court" },
    { id: "texcrimapp", name: "TX Court of Criminal Appeals" },
    { id: "texapp", name: "TX Courts of Appeals (All)" },
    { id: "txctapp1", name: "TX 1st Dist (Houston)" },
    { id: "txctapp2", name: "TX 2nd Dist (Fort Worth)" },
    { id: "txctapp3", name: "TX 3rd Dist (Austin)" },
    { id: "txctapp4", name: "TX 4th Dist (San Antonio)" },
    { id: "txctapp5", name: "TX 5th Dist (Dallas)" },
    { id: "txctapp14", name: "TX 14th Dist (Houston)" },
  ],
  "Florida": [
    { id: "fla", name: "FL Supreme Court" },
    { id: "fladistctapp", name: "FL District Courts of Appeal (All)" },
    { id: "fladistctapp1", name: "FL 1st DCA" },
    { id: "fladistctapp2", name: "FL 2nd DCA" },
    { id: "fladistctapp3", name: "FL 3rd DCA" },
    { id: "fladistctapp4", name: "FL 4th DCA" },
    { id: "fladistctapp5", name: "FL 5th DCA" },
  ],
  "New York": [
    { id: "ny", name: "NY Court of Appeals" },
    { id: "nyappdiv", name: "NY Appellate Division" },
  ],
  "Other State Supreme Courts": [
    { id: "ala", name: "Alabama" },
    { id: "alaska", name: "Alaska" },
    { id: "ariz", name: "Arizona" },
    { id: "ark", name: "Arkansas" },
    { id: "colo", name: "Colorado" },
    { id: "conn", name: "Connecticut" },
    { id: "del", name: "Delaware" },
    { id: "ga", name: "Georgia" },
    { id: "haw", name: "Hawaii" },
    { id: "idaho", name: "Idaho" },
    { id: "ill", name: "Illinois" },
    { id: "ind", name: "Indiana" },
    { id: "iowa", name: "Iowa" },
    { id: "kan", name: "Kansas" },
    { id: "ky", name: "Kentucky" },
    { id: "la", name: "Louisiana" },
    { id: "me", name: "Maine" },
    { id: "md", name: "Maryland" },
    { id: "mass", name: "Massachusetts" },
    { id: "mich", name: "Michigan" },
    { id: "minn", name: "Minnesota" },
    { id: "miss", name: "Mississippi" },
    { id: "mo", name: "Missouri" },
    { id: "mont", name: "Montana" },
    { id: "neb", name: "Nebraska" },
    { id: "nev", name: "Nevada" },
    { id: "nh", name: "New Hampshire" },
    { id: "nj", name: "New Jersey" },
    { id: "nm", name: "New Mexico" },
    { id: "nc", name: "North Carolina" },
    { id: "nd", name: "North Dakota" },
    { id: "ohio", name: "Ohio" },
    { id: "okla", name: "Oklahoma" },
    { id: "or", name: "Oregon" },
    { id: "pa", name: "Pennsylvania" },
    { id: "ri", name: "Rhode Island" },
    { id: "sc", name: "South Carolina" },
    { id: "sd", name: "South Dakota" },
    { id: "tenn", name: "Tennessee" },
    { id: "utah", name: "Utah" },
    { id: "vt", name: "Vermont" },
    { id: "va", name: "Virginia" },
    { id: "wash", name: "Washington" },
    { id: "wva", name: "West Virginia" },
    { id: "wis", name: "Wisconsin" },
    { id: "wyo", name: "Wyoming" },
    { id: "dc", name: "District of Columbia" },
  ],
  "Other State Appellate": [
    { id: "alactapp", name: "AL Court of Appeals" },
    { id: "alaskactapp", name: "AK Court of Appeals" },
    { id: "arizctapp", name: "AZ Court of Appeals" },
    { id: "arkctapp", name: "AR Court of Appeals" },
    { id: "coloctapp", name: "CO Court of Appeals" },
    { id: "connappct", name: "CT Appellate Court" },
    { id: "gactapp", name: "GA Court of Appeals" },
    { id: "hawapp", name: "HI Intermediate Court of Appeals" },
    { id: "idahoctapp", name: "ID Court of Appeals" },
    { id: "illappct", name: "IL Appellate Court" },
    { id: "indctapp", name: "IN Court of Appeals" },
    { id: "iowactapp", name: "IA Court of Appeals" },
    { id: "kanctapp", name: "KS Court of Appeals" },
    { id: "kyctapp", name: "KY Court of Appeals" },
    { id: "lactapp", name: "LA Court of Appeal" },
    { id: "massappct", name: "MA Appeals Court" },
    { id: "mdctspecapp", name: "MD Court of Special Appeals" },
    { id: "michctapp", name: "MI Court of Appeals" },
    { id: "minnctapp", name: "MN Court of Appeals" },
    { id: "missctapp", name: "MS Court of Appeals" },
    { id: "moctapp", name: "MO Court of Appeals" },
    { id: "nebctapp", name: "NE Court of Appeals" },
    { id: "nevapp", name: "NV Court of Appeals" },
    { id: "njsuperctappdiv", name: "NJ Superior Court App. Div." },
    { id: "nmctapp", name: "NM Court of Appeals" },
    { id: "ncctapp", name: "NC Court of Appeals" },
    { id: "ndctapp", name: "ND Court of Appeals" },
    { id: "ohioctapp", name: "OH Court of Appeals" },
    { id: "orctapp", name: "OR Court of Appeals" },
    { id: "pasuperct", name: "PA Superior Court" },
    { id: "scctapp", name: "SC Court of Appeals" },
    { id: "tennctapp", name: "TN Court of Appeals" },
    { id: "utahctapp", name: "UT Court of Appeals" },
    { id: "vactapp", name: "VA Court of Appeals" },
    { id: "washctapp", name: "WA Court of Appeals" },
    { id: "wvactapp", name: "WV Intermediate Court of Appeals" },
    { id: "wisctapp", name: "WI Court of Appeals" },
  ],
};

// Lookup court display name from ID
function getCourtDisplayName(courtId) {
  for (const courts of Object.values(COURTS)) {
    const found = courts.find(c => c.id === courtId);
    if (found) return found.name;
  }
  return courtId;
}

const ConfidenceBadge = ({ level, label }) => {
  const blocks = [1, 2, 3].map(i => (
    <span
      key={i}
      className={`inline-block w-2 h-3 mr-0.5 rounded-sm ${i <= level ? 'bg-blue-600' : 'bg-gray-300'}`}
    />
  ));
  return (
    <span className="inline-flex items-center text-xs text-gray-500 ml-2">
      {blocks} <span className="ml-1">({label})</span>
    </span>
  );
};

const SparkLine = ({ data, years, height = 28 }) => {
  const max = Math.max(...data, 1);
  return (
    <div>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((val, i) => (
          <div
            key={i}
            className="bg-blue-500 rounded-sm flex-1 transition-all hover:bg-blue-600"
            style={{ height: `${(val / max) * 100}%`, minHeight: 2 }}
            title={`${years?.[i] || i}: ${val} opinions`}
          />
        ))}
      </div>
      {years && (
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {years.map((y, i) => <span key={i}>'{y}</span>)}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      </div>
      <Icon className="w-5 h-5 text-blue-500" />
    </div>
  </div>
);

const DeltaBadge = ({ value, avg }) => {
  const delta = value - avg;
  if (Math.abs(delta) < 3) return null;
  const isHigh = delta > 0;
  return (
    <span className={`text-xs ml-1 ${isHigh ? 'text-blue-600' : 'text-gray-400'}`}>
      ({isHigh ? '+' : ''}{delta.toFixed(0)}% vs avg)
    </span>
  );
};

const ReversalHeatmap = ({ data }) => {
  if (!data.reversalHeatmap || Object.keys(data.reversalHeatmap).length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500 text-sm">
        No reversal patterns detected in available data.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-700 mb-3 text-sm flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-500" />
        REVERSAL HEATMAP
        <ConfidenceBadge level={data.outcomes?.confidence || 2} label={data.outcomes?.confidenceLabel || 'Baseline'} />
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {Object.entries(data.reversalHeatmap).map(([caseType, metrics]) => {
          const { rate, delta, vs_avg, sampleSize } = metrics;
          if (rate === null || rate === undefined) return null;
          let colorClass = 'bg-green-50 border-green-200 text-green-700';
          let riskLevel = 'Low';
          if (rate > 30) { colorClass = 'bg-yellow-50 border-yellow-200 text-yellow-700'; riskLevel = 'Med'; }
          if (rate > 45) { colorClass = 'bg-red-50 border-red-200 text-red-700'; riskLevel = 'High'; }
          const opacity = sampleSize < 10 ? 'opacity-60' : '';

          return (
            <div
              key={caseType}
              className={`p-3 rounded-lg border ${colorClass} ${opacity} relative group cursor-pointer hover:shadow-md transition-shadow`}
            >
              <div className="text-xs font-medium truncate mb-1">{caseType}</div>
              <div className="text-xl font-bold">{rate}%</div>
              <div className="text-xs opacity-75">
                {delta > 0 ? '+' : ''}{delta}% vs avg
              </div>
              {delta > 10 && <AlertCircle className="w-4 h-4 text-red-500 absolute top-2 right-2" />}
              {sampleSize < 10 && (
                <span className="absolute bottom-1 right-1 text-xs bg-gray-200 px-1 rounded text-gray-500">n={sampleSize}</span>
              )}
              <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs p-2 rounded shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 w-48 text-center">
                {rate > 45 ? 'High Risk: Strengthen procedural arguments' :
                 rate > 30 ? 'Moderate: Standard prep recommended' :
                 'Low Risk: Favorable venue for this case type'}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Color indicates reversal risk vs. district baseline. Hover for strategy tips.
      </p>
    </div>
  );
};

const JudgeCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-6 space-y-5 print:bg-white print:shadow-none" id="judge-card">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Scale className="w-6 h-6 text-blue-600" />
              {data.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{data.court}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-blue-600">BenchIntel</div>
            <div className="text-xs text-gray-400">JudgeCard&trade;</div>
          </div>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} value={data.stats.totalOpinions} label="Published Opinions" />
        <StatCard icon={Clock} value={data.stats.yearsActive} label="Years Active" />
        <StatCard icon={Award} value={data.stats.avgCitations} label="Avg Citations" />
        <StatCard icon={TrendingUp} value={data.stats.velocityPerYear} label="Opinions/Year" />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Case Type Breakdown */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">CASE TYPE BREAKDOWN</h3>
          <div className="space-y-2">
            {data.caseTypes.map((ct, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-28 text-gray-600 truncate text-xs">{ct.type}</span>
                <span className="w-12 text-right text-gray-500 text-xs">
                  {ct.percent}%
                  <DeltaBadge value={ct.percent} avg={ct.districtAvg} />
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${ct.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Judge's Pulse */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">JUDGE'S PULSE</h3>
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-blue-600">{data.pulse.velocity}</div>
            <div className="text-xs text-gray-500">opinions per year</div>
            <div className="text-sm font-medium text-gray-700">{data.pulse.rating}</div>
          </div>
          {data.pulse.trendBars && data.pulse.trendBars.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">CASELOAD TREND</div>
              <SparkLine data={data.pulse.trendBars} years={data.pulse.years} height={28} />
            </div>
          )}
          <div className={`text-sm ${data.pulse.trend === 'Decreasing' ? 'text-orange-500' : data.pulse.trend === 'Stable' ? 'text-gray-500' : 'text-green-500'}`}>
            {data.pulse.trend === 'Decreasing' ? '\u2198' : data.pulse.trend === 'Stable' ? '\u2192' : '\u2197'} {data.pulse.trend}
          </div>
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
            <strong>Strategy Tip:</strong> {data.pulse.tip}
          </div>
        </div>
      </div>

      {/* Most Cited Opinions */}
      {data.notableCases && data.notableCases.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">MOST CITED OPINIONS</h3>
          <div className="space-y-2">
            {data.notableCases.slice(0, 5).map((nc, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                <span className="text-gray-700 font-medium truncate max-w-xs">{nc.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-blue-600 font-semibold">{nc.citations}</span>
                  <span className="text-gray-400 text-xs">{nc.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ruling Patterns */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm flex items-center">
          RULING PATTERNS
          <ConfidenceBadge level={data.outcomes.confidence} label={data.outcomes.confidenceLabel} />
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">~{data.outcomes.affirmanceRate}%</div>
            <div className="text-xs text-green-700">Est. Affirmance Rate</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-500">~{data.outcomes.reversalRate}%</div>
            <div className="text-xs text-red-600">Est. Reversal Rate</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{data.caseTypes[0]?.percent}%</div>
            <div className="text-xs text-blue-700">{data.caseTypes[0]?.type} Focus</div>
          </div>
        </div>
        {data.outcomes.interpretation && (
          <div className="p-2 bg-gray-50 rounded text-sm text-gray-600 italic">
            <strong>Interpretation:</strong> {data.outcomes.interpretation}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Note: Outcome estimates based on available opinion data. Full opinion text analysis available in premium tier.
        </p>
      </div>

      {/* Reversal Heatmap */}
      <ReversalHeatmap data={data} />

      {/* Vulnerability Alerts */}
      {data.alerts && data.alerts.length > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-700 mb-2 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            STRATEGIC RISK ALERTS
          </h3>
          {data.alerts.map((alert, i) => (
            <div key={i} className="text-sm text-red-600 py-1 flex items-center gap-2">
              <strong>{alert.case_type}:</strong> {alert.reversal_rate}% reversal rate ({alert.multiplier}x baseline)
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span><strong>No elevated risk patterns detected.</strong> This judge aligns with district norms in analyzed categories.</span>
          </div>
        </div>
      )}

      {/* Strategic Signals */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm flex items-center gap-2">
          STRATEGIC SIGNALS
        </h3>
        <div className="space-y-2">
          {data.strategicSignals?.map((sig, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                sig.priority === 'Primary' ? 'bg-blue-100 text-blue-700' :
                sig.priority === 'Secondary' ? 'bg-gray-100 text-gray-600' :
                'bg-gray-50 text-gray-500'
              }`}>
                {sig.priority}
              </span>
              <span className="text-gray-700">{sig.signal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filing Guidance */}
      <div className="bg-blue-600 text-white rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          IF YOU'RE FILING HERE
        </h3>
        <ul className="space-y-1">
          {data.filingGuidance?.map((tip, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className="text-blue-300">&bull;</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <strong>BenchIntel</strong> &bull; &ldquo;Those services give you a database. We give you an answer.&rdquo;
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Powered by CourtListener API (Free Law Project) &bull; Generated {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

// Map API response to the shape our UI expects
function mapApiResponse(api) {
  const yearsTrend = api.yearsTrend || [];
  const trendBars = yearsTrend.map(y => y.count);
  const years = yearsTrend.map(y => String(y.year).slice(-2));

  let trend = 'Stable';
  if (trendBars.length >= 2) {
    const recent = trendBars[trendBars.length - 1];
    const prior = trendBars[trendBars.length - 2];
    if (recent > prior * 1.2) trend = 'Increasing';
    else if (recent < prior * 0.8) trend = 'Decreasing';
  }

  const velocity = api.velocity || 0;
  let rating = 'Low velocity';
  if (velocity >= 20) rating = 'High velocity';
  else if (velocity >= 10) rating = 'Moderate velocity';

  let tip = 'Limited data—monitor for patterns as more opinions publish.';
  if (velocity >= 20) tip = 'Fast-moving docket—prepare for compressed timelines.';
  else if (velocity >= 10) tip = 'Standard pace—follow typical timeline expectations.';

  const courtDisplay = api.courtName || getCourtDisplayName(api.court) || api.court;

  return {
    name: `Justice ${api.judgeName.toUpperCase()}`,
    court: courtDisplay,
    stats: {
      totalOpinions: api.totalOpinions,
      yearsActive: api.yearsActive,
      avgCitations: api.avgCitations,
      velocityPerYear: velocity,
    },
    caseTypes: (api.caseTypes || []).map(ct => ({
      type: ct.type,
      count: ct.count,
      percent: ct.percentage,
      districtAvg: ct.districtAvg,
    })),
    pulse: {
      velocity,
      rating,
      trend,
      trendBars,
      years,
      tip,
    },
    outcomes: {
      affirmanceRate: api.outcomes?.affirmed || 72,
      reversalRate: api.outcomes?.reversed || 28,
      confidence: api.outcomes?.confidence || 2,
      confidenceLabel: api.outcomes?.confidenceLabel || 'Baseline',
      interpretation: 'Most appeals fail here—success typically requires clear procedural error or statutory misapplication.',
    },
    notableCases: (api.mostCitedCases || []).map(c => ({
      name: c.name,
      citations: c.citations,
      date: c.date,
    })),
    alerts: api.alerts || [],
    reversalHeatmap: api.reversalHeatmap || {},
    strategicSignals: (api.strategicSignals || []).map(s => ({
      priority: s.rank,
      signal: s.text,
    })),
    filingGuidance: api.ifFilingHere || [],
  };
}

const PasskeyGate = ({ onAuthenticated }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsChecking(true);
    setError(null);

    try {
      const res = await fetch('/.netlify/functions/judge-profile?judge=__validate__&court=scotus', {
        headers: { 'x-passkey': code.trim() },
      });
      const data = await res.json();

      if (res.status === 401) {
        setError(data.message || 'Invalid access code.');
      } else {
        sessionStorage.setItem('benchintel_passkey', code.trim());
        onAuthenticated(code.trim());
      }
    } catch {
      setError('Unable to verify access code. Please try again.');
    }
    setIsChecking(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Scale className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">BenchIntel</h1>
          <p className="text-sm text-gray-500 mt-1">Judicial Intelligence Platform</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access Code
            </label>
            <input
              type="text"
              placeholder="Enter your access code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-lg tracking-widest font-mono uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 text-center">
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isChecking || !code.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isChecking ? 'Verifying...' : 'Enter'}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-6">
          Access codes are provided for authorized demo sessions.
          <br />Contact your representative for access.
        </p>
      </div>
    </div>
  );
};

export default function BenchIntelApp() {
  const [passkey, setPasskey] = useState(() => sessionStorage.getItem('benchintel_passkey'));
  const [remainingUses, setRemainingUses] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('calctapp');
  const [judgeData, setJudgeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  // If no passkey, show the gate
  if (!passkey) {
    return <PasskeyGate onAuthenticated={(key) => setPasskey(key)} />;
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    setJudgeData(null);

    try {
      const res = await fetch(
        `/.netlify/functions/judge-profile?judge=${encodeURIComponent(searchQuery.trim())}&court=${encodeURIComponent(selectedCourt)}`,
        { headers: { 'x-passkey': passkey } }
      );
      const data = await res.json();

      // Handle expired/revoked passkey mid-session
      if (res.status === 401 && data.authError) {
        sessionStorage.removeItem('benchintel_passkey');
        setPasskey(null);
        return;
      }

      if (!res.ok || data.ok === false) {
        setError(data.message || `No results found for "${searchQuery}". Try a different name.`);
        setJudgeData(null);
      } else {
        setJudgeData(mapApiResponse(data));
        if (data.remainingUses !== undefined) {
          setRemainingUses(data.remainingUses);
        }
      }
    } catch (err) {
      setError('Failed to connect to the analysis engine. Please try again.');
    }

    setIsLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <header className="bg-white shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 relative group cursor-pointer">
                  BenchIntel
                  <span className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs px-2 py-1 rounded top-full left-0 mt-1 whitespace-nowrap z-20">
                    Powered by Rabid Raccoon Intel
                  </span>
                </h1>
                <p className="text-xs text-gray-500">Judicial Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 italic hidden md:block">
                &ldquo;Those services give you a database. We give you an answer.&rdquo;
              </p>
              {remainingUses !== null && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {remainingUses} searches left
                </span>
              )}
              {judgeData && (
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Export PDF
                </button>
              )}
              <button
                onClick={() => { sessionStorage.removeItem('benchintel_passkey'); setPasskey(null); }}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                title="Exit demo session"
              >
                <LogOut className="w-3 h-3" />
                Exit
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 print:p-0">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 print:hidden">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Generate JudgeCard&trade;</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter judge last name (e.g., Baker, Roberts, Sotomayor...)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="px-3 py-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[220px]"
            >
              {Object.entries(COURTS).map(([group, courts]) => (
                <optgroup key={group} label={group}>
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {isLoading ? 'Analyzing...' : 'Generate'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {getCourtDisplayName(selectedCourt)} &bull; Powered by CourtListener (Free Law Project)
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-12 print:hidden">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Analyzing judicial patterns from CourtListener...</p>
            <p className="mt-1 text-xs text-gray-400">This may take a few seconds</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center print:hidden">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">{error}</p>
            <p className="text-sm text-gray-500 mt-2">Try a different spelling or check the judge's last name.</p>
          </div>
        )}

        {!isLoading && judgeData && <JudgeCard data={judgeData} />}

        {!hasSearched && (
          <div className="text-center py-12 bg-white rounded-xl print:hidden">
            <Scale className="w-16 h-16 text-blue-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Enter a judge name to begin</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              BenchIntel transforms raw court data into actionable judicial intelligence.
              Get case breakdowns, ruling patterns, and strategic signals in seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { name: 'Baker', court: 'calctapp', label: 'Baker (CA Appeal)' },
                { name: 'Sotomayor', court: 'scotus', label: 'Sotomayor (SCOTUS)' },
                { name: 'Smith', court: 'ca5', label: 'Smith (5th Cir)' },
              ].map(({ name, court, label }) => (
                <button
                  key={name}
                  onClick={() => { setSearchQuery(name); setSelectedCourt(court); }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  Try &ldquo;{label}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
