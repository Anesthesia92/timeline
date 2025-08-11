import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {historicalDates} from "../data";

type DotPosition = 'top' | 'bottom' | 'side';

const TimelineContainer = styled.div`
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: inherit;
    color: #333;
    padding: 0;
    width: 1440px;
    box-sizing: border-box;
    overflow: hidden; 
    margin: 0 auto;
    max-width: 100%;

    & + & {
        margin-top: 50px;
    }
`;

const TimelineSection = styled.div`
    display: flex;
    align-items: flex-start;
    width: 100%;
    position: relative;
    margin-bottom: 40px;
    padding: 170px clamp(40px, 5.55vw, 80px) 0;
    border-radius: 20px;
    overflow: hidden;
    height: 841px;

    @media (max-width: 768px) {
        width: 100%;
        height: auto;
        padding: 20px;
    }
`;

const Header = styled.div`
    width: 100%;
    align-items: center;
`;

const Title = styled.h1`
    font-size: 56px;
    font-weight: 700;
    color: #42567A; 
    margin: 0;
    border-left: 4px solid #42567A;
    padding-left: 15px; 
    line-height: 1.2; 
    letter-spacing: 0; 
    font-family: 'PT Sans', sans-serif; 
    width: 353px;
    text-align: left;
    
    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const DateDisplay = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 700;
    letter-spacing: -2px;
    font-size: clamp(4rem, 13.88vw, 200px);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    line-height: clamp(4rem, 11.11vw, 160px);
    width: 100%;
    font-family: 'PT Sans', sans-serif;
    text-align: center;
    gap: clamp(34px, 5.5vw, 101px);
    background: none;
    pointer-events: none;

    @media (max-width: 768px) {
        font-size: 4rem;
    }
`;

const VerticalLineBackground = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background-color: #E6E6E6;
    transform: translateX(-50%);
    z-index: 0;
    pointer-events: none;
    @media (max-width: 768px) { display: none; }
`;

const HorizontalLineBackground = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background-color: #E6E6E6;
    transform: translateY(-50%);
    z-index: 0;
    pointer-events: none;
    @media (max-width: 768px) { display: none; }
`;

const YearText = styled.span<{ color: string }>`
    color: ${({ color }) => color};
    margin: 0; /* Removed margin to rely on flex gap */
    display: inline-block;
    position: relative;
    z-index: 1; 
    opacity: 1;
    transform: translateY(0);
    transition: color 0.3s ease;
`;

const NavigationButtons = styled.div`
    display: flex;
    align-items: center;
    gap: clamp(10px, 1.04vw, 15px); /* Adaptive gap */
    margin-top: clamp(15px, 1.38vw, 20px); /* Adaptive margin-top */
    position: absolute;
    bottom: clamp(15px, 1.38vw, 20px); /* Adaptive bottom */
    left: 50%;
    transform: translateX(-50%);
`;

const NavButton = styled.button`
    background: transparent; 
    border: 1px solid #42567A;
    border-radius: 50%;
    width: clamp(40px, 3.47vw, 50px); 
    height: clamp(40px, 3.47vw, 50px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(1.5rem, 1.38vw, 2rem); 
    color: #42567A; 
    cursor: pointer;
    box-shadow: none; 
    transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
    outline: none;

    &:hover {
        background-color: rgba(66, 86, 122, 0.1); 
    }

    &:active {
        background-color: rgba(66, 86, 122, 0.2); 
        transform: translateY(0);
    }

    &:disabled {
        color: #ccc;
        cursor: not-allowed;
        border-color: #ccc;
        background-color: transparent;
    }
`;

const CurrentIndexDisplay = styled.span`
    font-size: clamp(0.9rem, 0.69vw, 1rem); /* Adaptive font size */
    font-weight: 400; /* Тоньше */
    color: #42567A; /* Темнее */
    min-width: clamp(40px, 4.16vw, 60px); /* Adaptive min-width */
    text-align: center;
`;

const ActiveIndexDisplay = styled.span`
    font-size: 20px;
    line-height: 30px;
    color: #42567A;
    text-align: center;
    font-weight: bold;
`;

const CircleContainer = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    pointer-events: none;
    width: 100%;
    max-width: 530px;
    height: 100%;
    max-height: 530px;
    aspect-ratio: 1 / 1;
    margin: 0 auto;
    @media (max-width: 768px) {
        display: none;
    }
`;

const BackgroundCircle = styled.div`
    width: inherit; /* Adaptive diameter */
    height: inherit; /* Adaptive diameter */
    border: 2px solid #E6E6E6; 
    border-radius: 50%;
    z-index: 0; /* Фон, под точками и текстом */
`;

const CircleDotDiv = styled.div<{ x: number; y: number; isActive: boolean }>`
    position: absolute;
    width: clamp(8px, 0.69vw, 10px); /* Adaptive size */
    height: clamp(8px, 0.69vw, 10px); /* Adaptive size */
    border-radius: 50%;
    background-color: ${({ isActive }) => (isActive ? '#5236FF' : '#42567A')}; 
    cursor: pointer;
    z-index: 1; 
    pointer-events: all; 
    transform: translate(-50%, -50%); 
    transition: background-color 0.3s ease, transform 0.3s ease;
    left: ${({ x }) => x}px;
    top: ${({ y }) => y}px;
    
    &:hover {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #F4F5F9;
        border: 1px solid rgba(48, 62, 88, 0.75);
        border-radius: 50%;
        width: 56px;
        height: 56px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
`;

const ActiveDotDescript = styled.div<{
    x: number;
    y: number;
    position: DotPosition; // Добавляем position в пропсы
}>`
    position: absolute;
    top: ${({y}) => y}px;
    left: ${({x}) => x}px;
    transform: ${({ position }) =>
            position === 'side'
                    ? 'translate(-15%, -50%)'
                    : 'translate(-21%, -50%)'};
    display: flex;
    align-items: center;
    gap: 20px;
    justify-content: center;
    z-index: 2;
    pointer-events: none;
    transition: top 0.3s ease, left 0.3s ease;
    @media (max-width: 768px) {
        display: none;
    }
`;

const ActiveDotInfo = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F4F5F9;
    border: 1px solid rgba(48, 62, 88, 0.75);
    border-radius: 50%;
    width: 56px;
    height: 56px;
    z-index: 2;
    pointer-events: none;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
`;

const ActiveCategoryDisplay = styled.div`
    font-size: 20px;
    line-height: 30px;
    color: #42567A;
    font-weight: bold;
`;

const SliderSection = styled.div`
    width: 100%;
    max-width: 100%; 
    margin-top: clamp(15px, 1.38vw, 20px); /* Adaptive margin-top */
    padding: clamp(15px, 1.38vw, 20px); /* Adaptive padding */
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    opacity: 1;
    transform: translateY(0);
`;

const EventCard = styled.div`
    background: #f8f9fa;
    border-radius: 15px;
    padding: clamp(15px, 1.38vw, 20px); /* Adaptive padding */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    min-height: clamp(120px, 10.41vw, 150px); /* Adaptive min-height */
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    text-align: left;
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-5px);
    }

    h3 {
        font-size: clamp(1.4rem, 1.25vw, 1.8rem); /* Adaptive font size */
        color: #5236FF; /* Цвет года события */
        margin-bottom: clamp(5px, 0.69vw, 10px); /* Adaptive margin-bottom */
        font-weight: 700;
    }

    p {
        font-size: clamp(0.9rem, 0.69vw, 1rem); /* Adaptive font size */
        color: #42567A; 
        line-height: 1.5;
    }
`;

const HistoricalTimeline: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [showDemoMessage, setShowDemoMessage] = useState(false);
    const currentData = historicalDates[activeIndex];

    const containerRef = useRef<HTMLDivElement | null>(null);
    const yearRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const sliderRef = useRef<HTMLDivElement | null>(null);

    const getDotPosition = useCallback((index: number, total: number) => {
        const containerSize = 534;
        const radius = 267;
        const centerX = containerSize / 2;
        const centerY = containerSize / 2;


        const leftAngles = [140, 180, 220];

        const rightAngles = [40, 0, 320];

        // Выбираем угол в зависимости от индекса точки
        let angle = index < 3 ? leftAngles[index] : rightAngles[index - 3];

        // Конвертируем угол в радианы
        const radians = (angle * Math.PI) / 180;

        // Рассчитываем координаты с инверсией по оси Y
        const x = centerX + radius * Math.cos(radians);
        const y = centerY - radius * Math.sin(radians);

        // Определяем положение точки для трансформации
        let position: DotPosition = 'side';
        if (angle > 45 && angle < 135) position = 'top';
        else if (angle > 225 && angle < 315) position = 'bottom';

        return { x, y, position };
    }, []);

    useGSAP(() => {
        gsap.fromTo(yearRefs.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.1 }
        );

        gsap.fromTo(sliderRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 }
        );

        gsap.to('.active-dot-info', {
            duration: 0.5,
            ease: 'power2.out',
        });

    }, { scope: containerRef, dependencies: [activeIndex, currentData] });

    useEffect(() => {
        if (showDemoMessage) {
            const timer = setTimeout(() => {
                setShowDemoMessage(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showDemoMessage]);

    const handleNext = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % historicalDates.length);
        setShowDemoMessage(true);
    };

    const handlePrev = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + historicalDates.length) % historicalDates.length);
        setShowDemoMessage(true);
    };

    const handleDotClick = (index: number) => {
        setActiveIndex(index);
        setShowDemoMessage(true);
    };

    const [startYear, endYear] = currentData.range.split(' ');
    const { x: activeDotX, y: activeDotY, position } = getDotPosition(activeIndex, historicalDates.length);

    return (
        <TimelineContainer ref={containerRef}>
            <TimelineSection>
                <Header>
                    <Title>Исторические даты</Title>
                </Header>

                <VerticalLineBackground />
                <HorizontalLineBackground />

                <DateDisplay>
                    <YearText ref={el => { if (el) yearRefs.current[0] = el; }} color="#5D5FEF">
                        {startYear}
                    </YearText>
                    <YearText ref={el => { if (el) yearRefs.current[1] = el; }} color="#EF5DA8">
                        {endYear}
                    </YearText>
                </DateDisplay>

                <NavigationButtons>
                    <NavButton onClick={handlePrev}>&lt;</NavButton>
                    <CurrentIndexDisplay>
                        {activeIndex + 1}/{historicalDates.length}
                    </CurrentIndexDisplay>
                    <NavButton onClick={handleNext}>&gt;</NavButton>
                </NavigationButtons>

                <CircleContainer>
                    <BackgroundCircle />
                    {historicalDates.map((_, index) => {
                        const { x: dotX, y: dotY } = getDotPosition(index, historicalDates.length);
                        return (
                            <CircleDotDiv
                                key={index}
                                x={dotX}
                                y={dotY}
                                isActive={index === activeIndex}
                                onClick={() => handleDotClick(index)}
                            />
                        );
                    })}

                    <ActiveDotDescript className="active-dot-info" x={activeDotX} y={activeDotY} position={position}>
                        <ActiveDotInfo>
                            <ActiveIndexDisplay>
                                <span>{activeIndex + 1}</span>
                            </ActiveIndexDisplay>
                        </ActiveDotInfo>

                        <ActiveCategoryDisplay>
                            {currentData.category}
                        </ActiveCategoryDisplay>
                    </ActiveDotDescript>
                </CircleContainer>
            </TimelineSection>

            <SliderSection ref={sliderRef}>
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={30}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 30,
                        },
                        1024: {
                            slidesPerView: 4,
                            spaceBetween: 40,
                        },
                    }}
                >
                    {currentData.events.map((event, index) => (
                        <SwiperSlide key={index}>
                            <EventCard>
                                <h3>{event.year}</h3>
                                <p>{event.description}</p>
                            </EventCard>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </SliderSection>
        </TimelineContainer>
    );
};

export default HistoricalTimeline;
