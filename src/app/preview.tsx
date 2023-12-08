import CodeBlock from '@/components/CodeBlock';
import React, { useState, useEffect } from 'react';

interface PreviewComponentProps {
  url: string;
}


const PreviewComponent: React.FC<PreviewComponentProps> = ({ url }) => {
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      if (!url) return;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // 获取到的是字符串
        const data = await response.text();
        setData(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className='w-full overflow-auto  h-full  '>
       <CodeBlock code={data ?? ""} url={url} />
    </div>
  );
};

export default PreviewComponent;
