import React from 'react';

interface Topic {
  number: number;
  title: string;
  description?: string;
}

interface CodeBlockLayoutProps {
  topics: Topic[];
  title?: string;
}

export const CodeBlockLayout: React.FC<CodeBlockLayoutProps> = ({ topics, title = 'Learning Path' }) => {
  return (
    <div className="my-4 rounded-lg overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
      {/* Header */}
      <div 
        className="px-6 py-4 border-b"
        style={{ backgroundColor: '#334155', borderColor: '#475569' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-sm">&lt;/&gt;</span>
          <span className="text-slate-300 font-mono text-sm font-semibold tracking-wide uppercase">{title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-0 font-mono text-sm">
          {topics.map((topic, idx) => (
            <div key={topic.number}>
              {/* Topic Line */}
              <div className="flex items-start gap-4">
                <span className="text-cyan-400 font-semibold min-w-fit">{topic.number}.</span>
                <div className="flex-1">
                  <span className="text-emerald-400">{topic.title}</span>
                  {topic.description && (
                    <div className="text-slate-400 text-xs mt-1 ml-0">
                      {topic.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow (if not last) */}
              {idx < topics.length - 1 && (
                <div className="flex items-center gap-4 py-2">
                  <span className="text-slate-500 min-w-fit">↓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
