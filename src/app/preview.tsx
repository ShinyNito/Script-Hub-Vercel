import CodeBlock from '@/components/CodeBlock';
import { Card, CardBody, Skeleton } from '@nextui-org/react';
import React, { useState, useEffect } from 'react';

interface PreviewComponentProps {
  url: string;
}


const PreviewComponent: React.FC<PreviewComponentProps> = ({ url }) => {
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
  if (isLoading) return <Skeleton></Skeleton>;
  if (error) return <div>Error: {error}</div>;
  return (
    <Card className="lg:col-span-2 h-full overflow-y-auto lg:row-span-3 lg:mt-0 flex-0">
      <CardBody>
        <div className='w-full overflow-auto h-full '>
          <h1 className='py-2'>预览:</h1>
            <CodeBlock code={data ?? ""} url={url} />
        </div>
      </CardBody>
    </Card>

  );
};

export default PreviewComponent;
