import React, { ChangeEvent } from 'react';
import { Textarea } from '@nextui-org/react';

interface AutoExpandingTextareaProps {
    id?: string;
    onChange: (e: string) => void;
    value: string;
}


const AutoExpandingTextarea: React.FC<AutoExpandingTextareaProps> = ({ id, onChange, value }) => {
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        <Textarea
            className="block mt-3 w-full rounded-md border-0  text-gray-900 ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={value}
            id={id}
            maxRows={3}
            onChange={handleInputChange}
        />
      
    );
};

export default AutoExpandingTextarea;
