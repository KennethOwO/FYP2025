import React from 'react';
import { StarFilled, StarOutlined } from '@ant-design/icons';

interface RatingStarsProps {
    rating: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push(<StarFilled key={i} style={{ color: 'gold' }} />);
        } else {
            stars.push(<StarOutlined key={i} />);
        }
    }
    return <div>{stars}</div>;
};

export default RatingStars;
