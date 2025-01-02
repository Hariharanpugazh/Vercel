// src/Count.js
import React, { useEffect, useState } from 'react';
import { getCount } from '../../../../api';

const Count = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            const data = await getCount();
            setCount(data);  // Set the total count of questions
        };

        fetchCount();
    }, []);

    return (
        <div>
            <h3>Total Questions: {count}</h3>
        </div>
    );
};

export default Count;