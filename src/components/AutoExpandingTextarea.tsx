import React, { ChangeEvent } from 'react';
import { Textarea } from '@nextui-org/react';

interface AutoExpandingTextareaProps {
    onChange: (e: string) => void;
    value: string;
    label ?: string;
}


const AutoExpandingTextarea: React.FC<AutoExpandingTextareaProps> = ({onChange, value,label }) => {
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        <Textarea
        labelPlacement="outside"
            label={label}
            value={value}
            minRows={2}
            cacheMeasurements={true}
            onChange={handleInputChange}
        />
      
    );
};

export default AutoExpandingTextarea;
