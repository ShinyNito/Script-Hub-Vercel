"use client";
import Setting from "./setting";
import Preview from "./preview";
import { useState } from "react";

//来源类型
//目标类型

export default function Home() {
  // url
  const [url, setUrl] = useState<string>('');
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };
  return (
    <div className="flex h-screen ">
      <div className="flex-1 flex flex-col">
        {/* 主内容 */}
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <div className="bg-gray-50 p-6 rounded shadow-md  h-full ">
            <Setting onUrlChange={handleUrlChange} />
          </div>
        </div>
      </div>
      <div className="w-2/5 px-2 py-4 space-y-2">
        <div className="lg:row-span-3 lg:mt-0 flex-0 h-full">
          <div className="lg:col-span-2 lg:border-r rounded lg:border-gray-200  bg-gray-100 overflow-y-auto h-full">
            <div className="ring-1 ring-gray-300/50 p-4 w-full h-full">
              <Preview url={url} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
