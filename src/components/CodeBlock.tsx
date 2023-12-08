import { useState } from 'react';


const CodeBlock = ({ code, url }: { code: string, url: string }) => {
  const [copySuccess, setCopySuccess] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const copyUrlToClipboard = () => {
    // 如果url 为空
    if (!url) return;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopySuccess('已复制!');
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000); // 2秒后隐藏提示
      },
      () => {
        setCopySuccess('复制失败');
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000); // 2秒后隐藏提示
      }
    );
  };
  return (
    <div className="relative">
    {showTooltip && <span className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm py-2 px-4 rounded-lg">{copySuccess}</span>}
    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-auto">
      <code className="block whitespace-pre">{code}</code>
    </pre>
    <button
      onClick={() => copyUrlToClipboard()}
      type="button"
      disabled={!url && !code}
      className="absolute top-2 right-2 text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2">
      点击复制
    </button>
  </div>
  );
};

export default CodeBlock;
