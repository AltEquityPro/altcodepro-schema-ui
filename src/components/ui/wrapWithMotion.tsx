import { classesFromStyleProps, getAccessibilityProps, motionFromAnimation } from '@/src/lib/utils';
import React from 'react'
import { motion } from "framer-motion";
import { UIElement } from '@/src/types';

const wrapWithMotion = (element: UIElement, children: React.ReactNode) => {
    const animationProps = motionFromAnimation(element.animations);
    const accessibilityProps = getAccessibilityProps(element.accessibility);
    const className = classesFromStyleProps(element.styles);
    const MotionComponent = animationProps ? motion.div : 'div';
    return (
        <MotionComponent className={className} {...accessibilityProps} {...animationProps}>
            {children}
        </MotionComponent>
    )
};

export default wrapWithMotion