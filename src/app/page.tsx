"use client";
import { Card, CardBody, Navbar, NavbarContent, NavbarItem } from "@nextui-org/react";
import Setting from "./setting";
import Preview from "./preview";
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { useState, useEffect } from 'react';

export default function Home() {
  // url

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [url, setUrl] = useState('');
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };
  const handleClick = (open: boolean) => {
    // 如果url 为空
    if (!url) return;
    if (open) {
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
  const settingPage = (
    <div className="flex-1 overflow-y-auto px-2 py-4">
      <Card className="h-full">
        <CardBody>
          <Setting onUrlChange={handleUrlChange} />
        </CardBody>
      </Card>
    </div>
  )
  return (
    <div className="container mx-auto">
      <Navbar className="shadow-lg md:hidden">
        {
          isMobile && (
            <>
              <NavbarContent className="sm:flex gap-4 animate-fade-up" justify="center">
                <p className="font-bold text-inherit text-3xl">Script Hub</p>
              </NavbarContent>
              <NavbarContent justify="end">

                <NavbarItem>
                  <Popover placement="bottom" isOpen={isOpen} onOpenChange={handleClick}>
                    <PopoverTrigger>
                      <Button color="primary" size="sm" disabled={!url}>
                        点击复制
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="px-1 py-2">
                        <div className="text-small font-bold">复制成功</div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </NavbarItem>
              </NavbarContent>
            </>
          )
        }

      </Navbar>

      <div className="flex h-screen">
        <div className="flex-1 flex flex-col w-full">
          {settingPage}
        </div>
        {!isMobile && url && (
          <div className="w-2/5 px-2 py-4 space-y-2 ">
            <Preview url={url} />
          </div>
        )}
      </div>
    </div>
  )
}
