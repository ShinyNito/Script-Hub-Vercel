"use client";
import { Navbar, NavbarContent, NavbarItem } from "@nextui-org/react";
import Setting from "./setting";
import Preview from "./preview";
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { useState, useEffect } from 'react';
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化窗口大小

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default function Home() {
  // url
  const [isOpen, setIsOpen] =   useState(false);
  const [url, setUrl] = useState('');
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };
  const { width } = useWindowSize();
  const breakpoint = 768;
  const handleClick = (open:boolean) => {
    // 如果url 为空
    if (!url) return;
    if(open){
      navigator.clipboard.writeText(url).then(
        () => {
          setIsOpen(true);
          setTimeout(() => setIsOpen(false), 2000); // 2秒后隐藏提示
        },
        () => {
          setIsOpen(true);
          setTimeout(() => setIsOpen(false), 2000); // 2秒后隐藏提示
        }
      );
    }
  };

  return (
    <>
      {(width <= breakpoint) ? (
        <>
          <Navbar className="shadow-lg">
            <NavbarContent className="" justify="start">

            </NavbarContent>
            <NavbarContent className="sm:flex gap-4" justify="center">
              <p className="font-bold text-inherit text-3xl">Script Hub</p>
            </NavbarContent>
            <NavbarContent justify="end">
              <Popover placement="bottom" isOpen={isOpen} onOpenChange={handleClick}>
                <PopoverTrigger>
                  <Button   color="primary" size="sm">
                    点击复制
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="px-1 py-2">
                    <div className="text-small font-bold">复制成功</div>
                  </div>
                </PopoverContent>
              </Popover>
              <NavbarItem>

              </NavbarItem>
            </NavbarContent>
          </Navbar>
        </>
      ) : null}
      <div className="flex h-screen ">
        <div className="flex-1 flex flex-col">
          {/* 主内容 */}
          <div className="flex-1 overflow-y-auto px-2 py-4">
            <div className="bg-gray-50 p-6 rounded shadow-md  h-full ">
              <Setting onUrlChange={handleUrlChange} />
            </div>
          </div>
        </div>
        {width >= breakpoint ? (
          <div className="w-2/5 px-2 py-4 space-y-2">
            <div className="lg:row-span-3 lg:mt-0 flex-0 h-full">
              <div className="lg:col-span-2 lg:border-r rounded lg:border-gray-200  bg-gray-100 overflow-y-auto h-full">
                <div className="ring-1 ring-gray-300/50 p-4 w-full h-full">
                  <Preview url={url} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
