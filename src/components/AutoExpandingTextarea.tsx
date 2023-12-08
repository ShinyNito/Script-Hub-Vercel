import React, { ChangeEvent } from 'react';

interface AutoExpandingTextareaProps {
    id?: string;
    onChange: (e: string) => void;
    value: string;
}


const AutoExpandingTextarea: React.FC<AutoExpandingTextareaProps> = ({ id, onChange, value }) => {
    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const target = event.target;
        target.style.height = 'inherit';
        const height = target.scrollHeight + 2; // 这里的2是为了添加顶部和底部边框的高度
        target.style.height = `${height}px`;
        onChange(target.value);
    };

    return (
        <textarea
            className="block mt-3 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={value}
            id={id}
            onChange={handleInputChange}
            style={{ height: 'auto', minHeight: '50px' }} // 设置一个最小高度
        />
    );
};

export default AutoExpandingTextarea;
