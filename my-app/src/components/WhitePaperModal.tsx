"use client";
import { X } from "lucide-react";

interface WhitePaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
}

export function WhitePaperModal({ isOpen, onClose, showCloseButton = false }: WhitePaperModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="neural-panel max-w-4xl max-h-[90vh] overflow-y-auto relative">
        {/* Close button for unauthenticated users */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors group"
          >
            <X className="w-5 h-5 text-red-400 group-hover:text-red-300" />
          </button>
        )}
        {/* White Paper Content */}
        <div className="p-8 space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent font-mono mb-2">
              Proof of Life: The Human Heartbeat on Chain
            </h1>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-data-stream"></div>
          </div>

          {/* Section 1 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-cyan-400 font-mono flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-neural-pulse" />
              1. The Idea
            </h2>
            <div className="text-slate-300 space-y-3 pl-4">
              <p>Imagine a world where no one knows if humanity is still out there. Wars rage, machines take over, cities fall silent.</p>
              <p className="text-green-400 font-mono">{'>'} How do we prove we&apos;re still here?</p>
              <p>Proof of Life is a simple, powerful answer: every day, real humans verify they&apos;re alive by claiming a small token on the blockchain. It&apos;s not about money—it&apos;s about creating an unbreakable record that humanity endures.</p>
              <p>Think of it as the world&apos;s heartbeat, recorded forever on-chain.</p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-cyan-400 font-mono flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-neural-pulse" />
              2. How It Works
            </h2>
            <div className="text-slate-300 space-y-3 pl-4">
              <p>The process is beautifully simple:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>World ID confirms you&apos;re a real, unique human</li>
                <li>You claim 1 LIFE token per day</li>
                <li>Your proof of life gets recorded on Worldchain</li>
                <li>The global counter of living humans updates</li>
              </ol>
              <p>No complex staking, no financial games—just pure, honest proof that you exist.</p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-cyan-400 font-mono flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-neural-pulse" />
              3. Why This Matters
            </h2>
            <div className="text-slate-300 space-y-3 pl-4">
              <p>In an age of AI, deepfakes, and digital uncertainty, Proof of Life creates something unprecedented:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-green-400">A living census</strong> - Real-time count of active humans</li>
                <li><strong className="text-green-400">Historical record</strong> - Permanent proof of human activity</li>
                <li><strong className="text-green-400">Global unity</strong> - Shared daily ritual across all cultures</li>
                <li><strong className="text-green-400">Future insurance</strong> - Evidence for tomorrow that we were here today</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-cyan-400 font-mono flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-neural-pulse" />
              4. The Technology
            </h2>
            <div className="text-slate-300 space-y-3 pl-4">
              <p>Built on Worldchain with World ID verification:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-cyan-400">Sybil-resistant</strong> - One human, one daily claim</li>
                <li><strong className="text-cyan-400">Privacy-preserving</strong> - Zero-knowledge proofs protect identity</li>
                <li><strong className="text-cyan-400">Globally accessible</strong> - Works anywhere with internet</li>
                <li><strong className="text-cyan-400">Permanent</strong> - Blockchain ensures data lives forever</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-cyan-400 font-mono flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-neural-pulse" />
              5. Beyond Survival
            </h2>
            <div className="text-slate-300 space-y-3 pl-4">
              <p>While Proof of Life starts with a simple daily claim, it opens doors to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Emergency response systems that know who&apos;s alive</li>
                <li>Democratic processes with verified human participation</li>
                <li>Economic systems that account for real human activity</li>
                <li>Historical research with unprecedented accuracy</li>
              </ul>
              <p className="text-green-400 font-mono">{'>'} The future needs proof that humans were here.</p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-cyan-400 font-mono flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-neural-pulse" />
              6. The Network Effect
            </h2>
            <div className="text-slate-300 space-y-3 pl-4">
              <p>Every person who joins makes the system more valuable:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>More accurate global population data</li>
                <li>Stronger proof of human civilization</li>
                <li>Greater resilience against existential risks</li>
                <li>Richer dataset for future generations</li>
              </ul>
              <p>Social media companies know when you&apos;re online. Governments know when you pay taxes. But no one knows if humanity&apos;s still here.</p>
              <p className="text-orange-400 font-mono">{'>'} Until now.</p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-cyan-400 font-mono flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-neural-pulse" />
              7. The Bigger Picture
            </h2>
            <div className="text-slate-300 space-y-3 pl-4">
              <p>Proof of Life isn&apos;t just about tokens or technology. It&apos;s about creating something that outlasts us all:</p>
              <p className="text-green-400 italic">&ldquo;A permanent, unalterable record that real humans lived, loved, and chose to prove their existence every single day.&rdquo;</p>
              <p>In a universe that tends toward entropy, Proof of Life is humanity&apos;s signature—written in code, secured by cryptography, and preserved for eternity.</p>
              <p>That&apos;s forever.</p>
              <p className="text-cyan-400 font-mono text-center mt-6">{'>'} Join the proof. Claim your life. Make history.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}