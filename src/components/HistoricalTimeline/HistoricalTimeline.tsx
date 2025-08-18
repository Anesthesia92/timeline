import React, {useState, useRef, useCallback, useEffect} from 'react';
import styled, {css} from 'styled-components';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import {useGSAP} from '@gsap/react';
import gsap from 'gsap';
import {Swiper as SwiperCore} from 'swiper';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import {historicalDates} from "../data";
import {SwiperNavButtons} from "../ SwiperNavButtons";

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
    padding: 170px 0 0;
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
    display: flex;
    align-items: center;
    gap: 78px;
`;

const Gradient = styled.div`
    width: 5px;
    background: linear-gradient(180deg, #3877EE 0%, #EF5DA8 100%);
    height: 120px;
`;

const Title = styled.p`
    font-size: 56px;
    font-weight: 700;
    font-family: 'PT Sans', sans-serif;
    line-height: 120%;
    letter-spacing: 0;
    max-width: 353px;
    text-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    color: #42567A;
    margin: 0;
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
    @media (max-width: 768px) {
        display: none;
    }
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
    @media (max-width: 768px) {
        display: none;
    }
`;

const YearText = styled.span<{ color: string }>`
    color: ${({color}) => color};
    margin: 0;
    display: inline-block;
    position: relative;
    z-index: 1;
    opacity: 1;
    transform: translateY(0);
    transition: color 0.3s ease;
`;

const NavigationButtons = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(10px, 1.04vw, 15px);
    padding-left: 80px;
    @media (max-width: 768px) {
        padding: 0;
    }
`;

const CurrentIndexDisplay = styled.div`
    font-size: clamp(0.9rem, 0.69vw, 1rem);
    font-weight: 400;
    color: #42567A;
    min-width: clamp(40px, 4.16vw, 60px);
    text-align: center;
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
    width: inherit;
    height: inherit;
    border: 2px solid #E6E6E6;
    border-radius: 50%;
    z-index: 0;
`;

const DotWrapper = styled.div<{ x: number; y: number }>`
    position: absolute;
    transform: translate(-50%, -50%);
    left: ${({x}) => x}px;
    top: ${({y}) => y}px;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #42567A;
    cursor: pointer;
    z-index: 1;
    pointer-events: all;
    transition: all 0.3s ease;
`;

const CircleDotDiv = styled.div<{ isActive: boolean, isHovered: boolean }>`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #42567A;

    ${({isActive, isHovered}) => !isActive && isHovered && css`
        width: 56px;
        height: 56px;
        background-color: #F4F5F9;
        border: 1px solid rgba(48, 62, 88, 0.75);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    `}

    ${({isActive}) =>
            isActive &&
            css`
                width: 56px;
                height: 56px;
                border: 1px solid rgba(48, 62, 88, 0.75);
                background-color: #F4F5F9;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            `}
`;

const ActiveDotContent = styled.div`
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
`;

const ActiveIndexDisplay = styled.span`
    font-size: 20px;
    line-height: 30px;
    color: #42567A;
    font-weight: bold;
`;

const ActiveCategoryDisplay = styled.div`
    font-size: 20px;
    line-height: 30px;
    color: #42567A;
    font-weight: bold;
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    margin-left: 40px;
`;

const SliderSection = styled.div`
    width: 100%;
    max-width: 100%;
    padding: clamp(15px, 1.38vw, 20px);
    border-radius: 20px;
    opacity: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const EventCard = styled.div`
    background: transparent;
    border-radius: 15px;
    padding-left: clamp(15px, 1.38vw, 20px);
    padding-right: clamp(15px, 1.38vw, 20px);
    min-height: clamp(120px, 10.41vw, 150px);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    text-align: left;
    transition: transform 0.2s ease;

    &:hover {
        background: #f8f9fa;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    h3 {
        font-size: clamp(1rem, 1.25vw, 1.2rem);
        color: #3877EE;
        margin-bottom: clamp(5px, 0.69vw, 10px);
        font-weight: 700;
    }

    p {
        font-size: clamp(0.9rem, 0.69vw, 1rem);
        color: #42567A;
        line-height: 1.5;
    }
`;

const HistoricalTimeline: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const swiperRef = useRef<SwiperCore | null>(null);
    const currentData = historicalDates[activeIndex];
    const [startYear, endYear] = currentData.range.split(' ');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const yearRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const sliderRef = useRef<HTMLDivElement | null>(null);

    const [activeIndexSlide, setActiveIndexSlide] = useState(0);

    const getDotPosition = useCallback((index: number, total: number) => {
        const containerSize = 534;
        const radius = 266;
        const centerX = containerSize / 2;
        const centerY = containerSize / 2;

        const angle = 90 - (index / total) * 360;
        const radians = (angle * Math.PI) / 180;
        const x = centerX + radius * Math.cos(radians);
        const y = centerY - radius * Math.sin(radians);

        return {x, y};
    }, []);

    useGSAP(() => {
        gsap.fromTo(yearRefs.current,
            {y: 20, opacity: 0},
            {y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.1}
        );

        gsap.fromTo(sliderRef.current,
            {opacity: 0, y: 20},
            {opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.2}
        );
    }, {scope: containerRef, dependencies: [activeIndex]});

    const handlePrevClick = () => {
        if (activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };

    const handleNextClick = () => {
        if (activeIndex < historicalDates.length - 1) {
            setActiveIndex(activeIndex + 1)
            console.log(activeIndex, historicalDates.length - 1);
        }
    };

    const handleDotClick = (index: number) => {
        setActiveIndex(index);
    };

    const handleSlideChange = (swiper:any ) => {
        console.log('Slide changed to:', swiper.activeIndex);
        setActiveIndexSlide(4);
    };

    return (
        <TimelineContainer ref={containerRef}>
            <TimelineSection>
                <Header>
                    <Gradient></Gradient>
                    <Title>Исторические даты</Title>
                </Header>

                <VerticalLineBackground/>
                <HorizontalLineBackground/>

                <DateDisplay>
                    <YearText ref={el => {
                        if (el) yearRefs.current[0] = el;
                    }} color="#5D5FEF">
                        {startYear}
                    </YearText>
                    <YearText ref={el => {
                        if (el) yearRefs.current[1] = el;
                    }} color="#EF5DA8">
                        {endYear}
                    </YearText>
                </DateDisplay>

                <CircleContainer>
                    <BackgroundCircle/>
                    {historicalDates.map((item, index) => {
                        const {x: dotX, y: dotY} = getDotPosition(index, historicalDates.length);
                        const isHovered = index === hoveredIndex;
                        const isActive = index === activeIndex;

                        return (
                            <DotWrapper
                                key={index}
                                x={dotX}
                                y={dotY}
                                onClick={() => handleDotClick(index)}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <CircleDotDiv isActive={isActive} isHovered={isHovered}>
                                    {(isActive || isHovered) && (
                                        <ActiveDotContent>
                                            <ActiveIndexDisplay>
                                                {index + 1}
                                            </ActiveIndexDisplay>

                                            {isActive && (
                                                <ActiveCategoryDisplay>
                                                    {item.category}
                                                </ActiveCategoryDisplay>
                                            )}
                                        </ActiveDotContent>
                                    )}
                                </CircleDotDiv>
                            </DotWrapper>
                        );
                    })}
                </CircleContainer>
            </TimelineSection>

            <SliderSection ref={sliderRef}>
                <VerticalLineBackground/>
                <NavigationButtons>
                    <CurrentIndexDisplay>
                        {String(activeIndex + 1).padStart(2, '0')}/
                        {String(historicalDates.length).padStart(2, '0')}
                    </CurrentIndexDisplay>
                    <SwiperNavButtons activeIndex={activeIndex}
                                      total={historicalDates.length}
                                      onNext={handleNextClick}
                                      onPrev={handlePrevClick}/>
                </NavigationButtons>
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={30}
                    slidesPerView={3}
                    navigation
                    onSlideChange={handleSlideChange}
                    pagination={{clickable: true}}
                    onSwiper={(swiper) => console.log(swiper)}
                    breakpoints={{
                        450: {slidesPerView: 1, spaceBetween: 20,},
                        768: {slidesPerView: 3, spaceBetween: 30,},
                        1024: {slidesPerView: 3, spaceBetween: 30,},
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