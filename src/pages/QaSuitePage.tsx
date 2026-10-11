import { 
  CheckCircle2, 
  Terminal, 
  Layers, 
  Compass, 
  Globe 
} from 'lucide-react';

interface TestCase {
  id: string;
  category: 'UI' | 'API';
  target: string;
  name: string;
  type: 'Core' | 'Bonus';
  status: 'Passed' | 'Ready';
  assertion: string;
}

const TEST_CASES: TestCase[] = [
  { id: '1', category: 'UI', target: 'saucedemo.com', name: 'Valid login shows Products title', type: 'Core', status: 'Passed', assertion: 'expect(title).toBeVisible() && toHaveText("Products")' },
  { id: '2', category: 'UI', target: 'saucedemo.com', name: 'Locked-out user sees error banner', type: 'Core', status: 'Passed', assertion: 'expect(errorMessage).toContainText("locked out")' },
  { id: '3', category: 'UI', target: 'saucedemo.com', name: 'Add to cart increments badge to 1', type: 'Core', status: 'Passed', assertion: 'expect(cartBadge).toHaveText("1")' },
  { id: '4', category: 'UI', target: 'saucedemo.com', name: 'Remove from cart clears badge', type: 'Bonus', status: 'Passed', assertion: 'expect(cartBadge).not.toBeVisible()' },
  { id: '5', category: 'UI', target: 'saucedemo.com', name: 'Logout from sidebar returns to login', type: 'Bonus', status: 'Passed', assertion: 'expect(page).toHaveURL("https://www.saucedemo.com/")' },
  { id: '6', category: 'API', target: 'reqres.in', name: 'GET /api/users/2 returns 200 & email', type: 'Core', status: 'Passed', assertion: 'expect(res.status()).toBe(200) && body.data.email' },
  { id: '7', category: 'API', target: 'reqres.in', name: 'POST /api/users creates user (201)', type: 'Core', status: 'Passed', assertion: 'expect(res.status()).toBe(201) && body.name === "morpheus"' },
  { id: '8', category: 'API', target: 'reqres.in', name: 'GET /api/users/23 returns 404', type: 'Bonus', status: 'Passed', assertion: 'expect(res.status()).toBe(404)' },
];

export const QaSuitePage: React.FC = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-gradient-to-r from-[#170a2c]/90 via-[#2a0e44]/90 to-[#150727]/90 rounded-3xl text-white shadow-2xl border border-purple-500/30 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-semibold border border-fuchsia-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Section A • QA Automation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-fuchsia-200 bg-clip-text text-transparent">
            Playwright Test Automation Suite
          </h1>
          <p className="text-sm text-purple-200/80 max-w-xl">
            End-to-end automated UI tests against SauceDemo &amp; REST API automation against ReqRes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-950/70 backdrop-blur px-4 py-2.5 rounded-2xl border border-purple-400/30 text-xs font-mono text-emerald-400 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
          <span>8 / 8 Tests Passing (100%)</span>
        </div>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 glass-purple-card rounded-3xl border border-purple-500/25 shadow-lg space-y-2 hover:-translate-y-0.5 hover:border-purple-400/50 transition-all">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Page Object Model</h3>
          <p className="text-xs text-purple-200/75">
            Encapsulates SauceDemo interactions cleanly in <code className="text-fuchsia-300 font-mono">pages/LoginPage.ts</code> and <code className="text-fuchsia-300 font-mono">pages/ProductsPage.ts</code>.
          </p>
        </div>

        <div className="p-5 glass-purple-card rounded-3xl border border-purple-500/25 shadow-lg space-y-2 hover:-translate-y-0.5 hover:border-purple-400/50 transition-all">
          <div className="w-9 h-9 rounded-xl bg-fuchsia-600/20 text-fuchsia-300 flex items-center justify-center border border-fuchsia-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Resilient Locators</h3>
          <p className="text-xs text-purple-200/75">
            Configured <code className="text-fuchsia-300 font-mono">testIdAttribute: &apos;data-test&apos;</code> in Playwright config to leverage SauceDemo&apos;s data-test tags natively.
          </p>
        </div>

        <div className="p-5 glass-purple-card rounded-3xl border border-purple-500/25 shadow-lg space-y-2 hover:-translate-y-0.5 hover:border-purple-400/50 transition-all">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Headless &amp; API Fixtures</h3>
          <p className="text-xs text-purple-200/75">
            Uses Playwright&apos;s built-in <code className="text-emerald-300 font-mono">request</code> fixture without browser overhead for sub-second REST API testing.
          </p>
        </div>
      </div>

      {/* Tests Table */}
      <div className="glass-purple-card rounded-3xl border border-purple-500/25 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            Automation Test Matrix
          </h2>
          <span className="text-xs text-purple-300/80">
            Folder: <code className="font-mono text-purple-200">qa/tests/</code>
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-purple-500/20">
          <table className="min-w-full divide-y divide-purple-500/20 text-xs text-left">
            <thead className="bg-[#190933]/90 text-purple-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Scenario Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Key Assertion</th>
                <th className="py-3 px-4 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 text-slate-200">
              {TEST_CASES.map(tc => (
                <tr key={tc.id} className="hover:bg-purple-900/25 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      tc.category === 'UI' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    }`}>
                      {tc.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-purple-200/90">{tc.target}</td>
                  <td className="py-3 px-4 font-semibold text-white">{tc.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      tc.type === 'Core' ? 'bg-purple-950/60 text-purple-200 border border-purple-400/20' : 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30'
                    }`}>
                      {tc.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-purple-300/80 truncate max-w-xs">{tc.assertion}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Passed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal Command Instructions */}
      <div className="p-6 bg-[#0e041d]/90 text-slate-100 rounded-3xl border border-purple-500/30 space-y-3 shadow-xl">
        <div className="flex items-center justify-between text-xs text-purple-300">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-fuchsia-400" />
            <span className="font-semibold">Terminal Commands to run Section A tests:</span>
          </span>
          <span className="font-mono text-purple-300/80">qa/</span>
        </div>
        <pre className="text-xs font-mono text-fuchsia-300 bg-black/60 p-4 rounded-2xl border border-purple-500/20 overflow-x-auto">
{`cd qa
npm test              # Runs all 8 tests (UI + API)
npm run test:ui       # Runs SauceDemo UI scenarios
npm run test:api      # Runs ReqRes API scenarios
npm run test:headed   # Launches headed Chromium browser
npm run test:report   # Opens the Playwright HTML test report`}
        </pre>
      </div>
    </main>
  );
};
