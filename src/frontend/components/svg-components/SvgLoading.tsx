import React from 'react'
import './SvgLoading.css'

/**
 * Renders an SVG loading animation
 *
 * This component displays a spinning circular loading animation.
 * The animation uses CSS keyframes to rotate the spinner elements.
 * The size and colors can be customized through props.
 *
 * @param props - The loading animation properties
 * @returns SVG representation of the loading animation
 */
type SvgLoadingProps = {
    size?: number;
    primaryColor?: string;
    secondaryColor?: string;
    strokeWidth?: number;
    speed?: number;
}

const SvgLoading: React.FC<SvgLoadingProps> = ({
                                                   size = 50,
                                                   primaryColor = '#646cff',
                                                   secondaryColor = '#e0e0e0',
                                                   strokeWidth = 4,
                                                   speed = 1.5
                                               }) => {
    // Calculate dimensions
    const center = size / 2
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const dashArray = circumference
    const dashOffset = circumference * 0.75

    // Create animation style with dynamic speed
    const animationStyle = {
        animationDuration: `${speed}s`
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="svg-loading-container"
        >
            {/* Background circle */}
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={secondaryColor}
                strokeWidth={strokeWidth}
            />

            {/* Spinner circle */}
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={primaryColor}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="svg-loading-spinner"
                style={animationStyle}
            />
        </svg>
    )
}

export default SvgLoading