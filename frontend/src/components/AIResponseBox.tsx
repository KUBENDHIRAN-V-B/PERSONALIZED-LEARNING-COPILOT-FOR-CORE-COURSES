import React, { useRef, useState } from 'react';
import { FiCpu, FiCopy, FiCheck, FiChevronDown, FiBookOpen, FiMap } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIResponseBoxProps {
  content: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Detect if content is a flowchart/diagram
const isFlowchartContent = (text: string): boolean => {
  const hasArrows = /[↓→←↑▼▲◄►|]/.test(text);
  const hasBoxChars = /[┌┐└┘│─┬┴├┤┼╔╗╚╝║═[\]]/.test(text);
  const linesWithArrows = text.split('\n').filter(l => /^[\s]*[↓→←↑▼▲◄►|]+[\s]*$/.test(l)).length;
  const hasCodeSyntax = /\b(function|const|let|var|import|export|class|def|return|if\s*\(|else|for\s*\(|while\s*\(|=>|console\.|print\()\b/.test(text);
  
  return ((hasArrows && linesWithArrows >= 2) || hasBoxChars) && !hasCodeSyntax;
};

// Extract language from className
const getLanguageFromClass = (className?: string): string => {
  if (!className) return 'code';
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : 'code';
};

// ============================================
// FLOWCHART COMPONENT - Beautiful Learning Roadmap
// ============================================

const FlowchartBlock: React.FC<{ content: string }> = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Parse flowchart into steps
  const parseSteps = (text: string) => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    const steps: { text: string; isConnector: boolean; stepNumber?: number }[] = [];
    let stepNum = 1;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[↓→←↑▼▲◄►|─│]+$/.test(trimmed)) {
        steps.push({ text: '↓', isConnector: true });
      } else if (trimmed) {
        const cleanText = trimmed.replace(/^\d+\.\s*/, '');
        steps.push({ text: cleanText, isConnector: false, stepNumber: stepNum++ });
      }
    }
    return steps;
  };

  const steps = parseSteps(content);

  return (
    <div className="my-6 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 shadow-2xl border border-indigo-500/30">
      <div className="flex items-center justify-between px-5 py-3 bg-black/20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
            <FiMap className="text-white" size={16} />
          </div>
          <div>
            <span className="text-white font-semibold text-sm">Learning Roadmap</span>
            <p className="text-indigo-300 text-xs">{steps.filter(s => !s.isConnector).length} steps to master</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            copied ? 'bg-green-500/30 text-green-300' : 'bg-white/10 hover:bg-white/20 text-white/80'
          }`}
        >
          {copied ? <><FiCheck size={12} /> Copied</> : <><FiCopy size={12} /> Copy</>}
        </button>
      </div>
      <div className="p-6">
        <div className="flex flex-col items-center gap-0">
          {steps.map((step, index) => (
            step.isConnector ? (
              <div key={index} className="flex flex-col items-center py-1">
                <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-400 to-blue-500"></div>
                <FiChevronDown className="text-cyan-400 -my-1" size={20} />
                <div className="w-0.5 h-4 bg-gradient-to-b from-blue-500 to-purple-500"></div>
              </div>
            ) : (
              <div key={index} className="w-full max-w-lg">
                <div className="relative bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20 hover:border-cyan-400/50 hover:bg-white/15 transition-all shadow-lg">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-indigo-900">
                    {step.stepNumber}
                  </div>
                  <p className="text-white font-medium pl-4">{step.text}</p>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// CODE BLOCK COMPONENT - Language-aware with syntax highlighting colors
// ============================================

const CodeBlock: React.FC<{ children: React.ReactNode; language?: string }> = ({ children, language = 'code' }) => {
  const codeRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = codeRef.current?.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const langColors: Record<string, string> = {
    javascript: 'from-yellow-500 to-yellow-600', js: 'from-yellow-500 to-yellow-600',
    typescript: 'from-blue-500 to-blue-600', ts: 'from-blue-500 to-blue-600',
    python: 'from-green-500 to-blue-500', py: 'from-green-500 to-blue-500',
    java: 'from-red-500 to-orange-500', cpp: 'from-blue-600 to-purple-600',
    c: 'from-blue-500 to-gray-600', html: 'from-orange-500 to-red-500',
    css: 'from-blue-400 to-purple-500', sql: 'from-orange-400 to-yellow-500',
    json: 'from-gray-500 to-gray-600', bash: 'from-green-600 to-green-700',
    shell: 'from-green-600 to-green-700', code: 'from-slate-500 to-slate-600',
  };

  const gradientClass = langColors[language.toLowerCase()] || langColors.code;

  return (
    <div className="my-5 rounded-xl overflow-hidden shadow-xl border border-gray-700/50 bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className={`px-2.5 py-0.5 rounded-md bg-gradient-to-r ${gradientClass} text-white text-xs font-semibold uppercase tracking-wider`}>
            {language}
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
            copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {copied ? <><FiCheck size={12} /> Copied!</> : <><FiCopy size={12} /> Copy</>}
        </button>
      </div>
      <div className="p-4 overflow-x-auto bg-[#1a1b26]">
        <pre ref={codeRef} className="m-0">
          <code className="text-sm text-gray-100 font-mono leading-relaxed block">{children}</code>
        </pre>
      </div>
    </div>
  );
};

// ============================================
// LIST ITEM COMPONENTS
// ============================================

const NumberedListItem: React.FC<{ children: React.ReactNode; index: number }> = ({ children, index }) => (
  <li className="flex items-start gap-4 py-2 group">
    <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-md group-hover:scale-110 transition-transform">
      {index}
    </span>
    <div className="flex-1 pt-1 text-gray-700 leading-relaxed">{children}</div>
  </li>
);

const BulletListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start gap-3 py-1.5">
    <span className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mt-2"></span>
    <div className="flex-1 text-gray-700 leading-relaxed">{children}</div>
  </li>
);

export const AIResponseBox: React.FC<AIResponseBoxProps> = ({ content }) => {
  const [copied, setCopied] = useState(false);
  let olIndex = 0;

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex justify-start w-full">
      <div className="flex gap-4 max-w-[95%] w-full">
        {/* AI Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <FiCpu className="text-white" size={20} />
          </div>
        </div>

        {/* Response Container */}
        <div className="flex-1 min-w-0 relative group">
          <div className="bg-white rounded-2xl rounded-tl-md shadow-xl border border-gray-200 overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"></div>

            {/* Copy All button */}
            <div className="absolute right-4 top-6 opacity-0 group-hover:opacity-100 transition-all z-20">
              <button
                onClick={handleCopyAll}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg transition-all ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
                title="Copy entire response"
              >
                {copied ? <><FiCheck size={12} /> Copied!</> : <><FiCopy size={12} /> Copy All</>}
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // ========== HEADINGS ==========
                  h1: ({ children }) => (
                    <div className="mt-6 mb-4 first:mt-0">
                      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FiBookOpen className="text-white" size={18} />
                        </span>
                        {children}
                      </h1>
                      <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-3"></div>
                    </div>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4 first:mt-0 flex items-center gap-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-transparent px-4 py-3 rounded-xl border-l-4 border-blue-500">
                      <span className="text-blue-500">▸</span>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-semibold text-gray-700 mt-4 mb-2 pl-4 border-l-2 border-gray-300">
                      {children}
                    </h4>
                  ),

                  // ========== PARAGRAPH ==========
                  p: ({ children }) => (
                    <p className="text-gray-700 my-4 leading-7 text-[15px]">{children}</p>
                  ),

                  // ========== TEXT FORMATTING ==========
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900 bg-gradient-to-r from-yellow-100 to-amber-100 px-1.5 py-0.5 rounded-md">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-800">{children}</em>
                  ),

                  // ========== CODE BLOCKS ==========
                  pre: ({ children }) => {
                    const extractText = (child: any): string => {
                      if (typeof child === 'string') return child;
                      if (child?.props?.children) {
                        if (Array.isArray(child.props.children)) {
                          return child.props.children.map(extractText).join('');
                        }
                        return extractText(child.props.children);
                      }
                      return '';
                    };

                    const getCodeLang = (child: any): string => {
                      if (child?.props?.className) {
                        return getLanguageFromClass(child.props.className);
                      }
                      return 'code';
                    };

                    const textContent = extractText(children);
                    const codeChild = React.Children.toArray(children)[0] as React.ReactElement;
                    const language = getCodeLang(codeChild);

                    if (isFlowchartContent(textContent)) {
                      return <FlowchartBlock content={textContent} />;
                    }

                    return <CodeBlock language={language}>{codeChild?.props?.children || children}</CodeBlock>;
                  },

                  // ========== INLINE CODE ==========
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="bg-gradient-to-r from-gray-100 to-gray-200 text-indigo-700 px-2 py-1 rounded-md text-sm font-mono font-medium border border-gray-300" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return <code className={`${className || ''} text-sm`} {...props}>{children}</code>;
                  },

                  // ========== TABLES ==========
                  table: ({ children }) => (
                    <div className="my-6 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                      <table className="min-w-full divide-y divide-gray-200">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">{children}</thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="bg-white divide-y divide-gray-100">{children}</tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-indigo-50 transition-colors">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-5 py-4 text-sm text-gray-700">{children}</td>
                  ),

                  // ========== LISTS ==========
                  ul: ({ children }) => (
                    <ul className="my-4 space-y-1 pl-1">{children}</ul>
                  ),
                  ol: ({ children }) => {
                    olIndex = 0;
                    return <ol className="my-4 space-y-2 pl-1">{children}</ol>;
                  },
                  li: ({ children, ordered }) => {
                    if (ordered) {
                      olIndex++;
                      return <NumberedListItem index={olIndex}>{children}</NumberedListItem>;
                    }
                    return <BulletListItem>{children}</BulletListItem>;
                  },

                  // ========== BLOCKQUOTE ==========
                  blockquote: ({ children }) => (
                    <blockquote className="my-6 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
                      <div className="pl-6 pr-4 py-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-transparent rounded-r-xl">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">💡</span>
                          <div className="text-gray-700 flex-1 italic">{children}</div>
                        </div>
                      </div>
                    </blockquote>
                  ),

                  // ========== HORIZONTAL RULE ==========
                  hr: () => (
                    <div className="my-8 flex items-center gap-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                  ),

                  // ========== LINKS ==========
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium underline decoration-indigo-300 hover:decoration-indigo-500 underline-offset-2 transition-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                      <span className="text-xs opacity-70">↗</span>
                    </a>
                  ),

                  // ========== IMAGES ==========
                  img: ({ src, alt }) => (
                    <div className="my-4 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                      <img src={src} alt={alt} className="w-full h-auto" />
                      {alt && <p className="text-center text-sm text-gray-500 py-2 bg-gray-50">{alt}</p>}
                    </div>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResponseBox;