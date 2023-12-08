import { useState } from 'react';


const CodeBlock = ({ code, url } : {code: string, url: string}) => {
    const [copySuccess, setCopySuccess] = useState('');
    const copyToClipboard = () => {
      navigator.clipboard.writeText(code).then(
        () => setCopySuccess('已复制!'),
        () => setCopySuccess('复制失败')
      );
    };
    const copyUrlToClipboard = () => {
      navigator.clipboard.writeText(url).then(
        () => setCopySuccess('已复制!'),
        () => setCopySuccess('复制失败')
      );
    };
    return (
      <div className="relative">
      <pre className="bg-gray-800 text-white p-4 rounded-md overflow-auto">
        <code className="block whitespace-pre">{code}</code>
      </pre>
      <button 
        onClick={copyToClipboard} 
        className="absolute top-2 right-2 text-xs text-gray-800 bg-white p-1 rounded">
        复制
      </button>
      {/* 复制URL */}
      <button
        onClick={copyUrlToClipboard}
        className="absolute top-2 right-2 text-xs text-gray-800 bg-white p-1 rounded">
        复制URL
        </button>
      {copySuccess && <span className="text-sm text-green-500">{code}</span>}
    </div>
    );
  };
  
  export default CodeBlock;
  