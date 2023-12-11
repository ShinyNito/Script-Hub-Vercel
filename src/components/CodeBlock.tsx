import { Snippet } from '@nextui-org/react';
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
    <Snippet 
      className='w-full' 
      hideSymbol 
      codeString={url}
      classNames={
        {
          base: 'items-start',
          copyButton: 'top-5 left-0 right-0 z-10 sticky',
        }
      }
      >
      <pre>
        {code}
      </pre>
    </Snippet>

  );
};

export default CodeBlock;
