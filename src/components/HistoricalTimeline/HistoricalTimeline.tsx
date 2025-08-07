import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Define TypeScript interfaces for data structure
interface Event {
    year: string;
    description: string;
}

interface DatePeriod {
    range: string;
    category: string;
    events: Event[];
}


const historicalDates: DatePeriod[] = [
    {
        range: "1980 1986",
        category: "Технологии",
        events: [
            { year: "1980", description: "Sinclair Research выпускает домашний компьютер ZX80." },
            { year: "1982", description: "Появился домашний компьютер ZX Spectrum, выпущенный британской компанией Sinclair Research." },
        ],
    },
    {
        range: "1987 1991",
        category: "Кино",
        events: [
            { year: "1987", description: "«Хищник»/Predator, США (реж. Джон Мактирнан)." },
            { year: "1988", description: "«Кто подставил кролика Роджера»/Who Framed Roger Rabbit, США (реж. Роберт Земекис)." },
            { year: "1989", description: "«Назад в будущее 2»/Back To The Future 2, США (реж. Роберт Земекис)." },
            { year: "1990", description: "«Крепкий орешек 2»/Die Hard 2, США (реж. Ренни Харлин)." },
            { year: "1991", description: "«Семейка Аддамс»/The Addams Family, США, (reж. Барри Зонненфельд)." },
        ],
    },
    {
        range: "1992 1997",
        category: "Литература",
        events: [
            { year: "1992", description: "Нобелевская премия по литературе — Дерек Уолкотт, «За блестящий образец эпоса в 64 разделах»." },
            { year: "1994", description: "«Бессонница» — роман Стивена Кинга." },
            { year: "1995", description: "Нобелевская премия по литературе — Шеймас Хини." },
            { year: "1997", description: "«Гарри Поттер и философский камень» — роман Джоан Роулинг." },
        ],
    },
    {
        range: "1999 2004",
        category: "Литература",
        events: [
            { year: "1999", description: "премьера балета «Золушка» в постановке Жан-Кристофа Майо, сценография Эрнеста Пиньона." },
            { year: "2000", description: "возобновлено издание журнала «Театр»." },
            { year: "2002", description: "премьера трилогии Тома Стоппарда «Берег Утопии», Королевский Национальный театр, Лондон." },
            { year: "2003", description: "В Венеции произошёл пожар." },
        ],
    },
    {
        range: "2006 2014",
        category: "Спорт",
        events: [
            { year: "2006", description: "Баскетбольный клуб ЦСКА стал победителем национального первенства России." },
            { year: "2008", description: "С 8 по 24 августа в Пекине прошли XXIX летние Олимпийские игры." },
            { year: "2010", description: "13–28 февраля в Ванкувере: Зимние Олимпийские игры 2010 года." },
            { year: "2012", description: "С 27 июля по 12 августа в Лондоне прошли XXX летние Олимпийские игры." },
            { year: "2014", description: "XXII зимние Олимпийские игры (Сочи, Россия)." },
        ],
    },
    {
        range: "2015 2022",
        category: "Наука",
        events: [
            { year: "2015", description: "13 сентября — частное солнечное затмение, видимое в Южной Африке и части Антарктиды." },
            { year: "2016", description: "Телескоп «Хаббл» обнаружил самую удалённую из всех обнаруженных галактик, получившую обозначение GN-z11." },
            { year: "2017", description: "Компания Tesla официально представила первый в мире электрический грузовик Tesla Semi." },
            { year: "2018", description: "Старт космического аппарата Solar Probe Plus, предназначенного для изучения Солнца." },
            { year: "2019", description: "Google объявил о создании 53-кубитного квантового компьютера." },
            { year: "2020", description: "Корабль Crew Dragon вернулся на Землю из первого пилотируемого полёта." },
        ],
    },
];

// Keyframes for animations
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
`;

// Styled Components
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

    /* Ensure independence */
    & + & {
        margin-top: 50px;
    }
`;

const TimelineSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    position: relative; /* Важно для позиционирования линий */
    margin-bottom: 40px;
    /* Adaptive padding: vertical, horizontal */
    /* Adaptive padding: vertical, horizontal */
    padding: clamp(40px, 5.55vw, 80px) 78px;
    border-radius: 20px;
    overflow: hidden;
    flex-shrink: 0; /* Prevent shrinking below clamped size */

    @media (max-width: 768px) {
        width: 100%; /* On mobile, take full width */
        height: auto; /* On mobile, height adjusts to content */
        padding: 20px;
    }
`;

const Header = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: clamp(30px, 4.16vw, 60px); /* Adaptive margin-bottom */
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
    font-weight: 700; /* Обновленный font-weight */
    letter-spacing: -2px; /* Обновленный letter-spacing */
    margin: clamp(30px, 2.77vw, 40px) 0; /* Adaptive margin */
    font-size: clamp(4rem, 13.88vw, 200px); /* Adaptive font-size */
    position: relative;
    line-height: clamp(4rem, 11.11vw, 160px); /* Adaptive line-height */
    width: 100%;
    font-family: 'PT Sans', sans-serif; /* Обновленный font-family */
    text-align: center;
    gap: clamp(20px, 2.77vw, 40px); /* Adaptive gap */
    background: none; /* Обновленный background */

    @media (max-width: 768px) {
        font-size: 4rem;
        margin: 30px 0;
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
    pointer-events: none; /* Не мешает взаимодействию */
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
    pointer-events: none; /* Не мешает взаимодействию */
    @media (max-width: 768px) { display: none; }
`;

const YearText = styled.span<{ color: string }>`
    color: ${({ color }) => color};
    margin: 0; /* Removed margin to rely on flex gap */
    display: inline-block;
    position: relative;
    z-index: 1; /* Над линиями */
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
    background: transparent; /* Прозрачный фон */
    border: 1px solid #42567A; /* Тонкая рамка */
    border-radius: 50%;
    width: clamp(40px, 3.47vw, 50px); /* Adaptive width */
    height: clamp(40px, 3.47vw, 50px); /* Adaptive height */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(1.5rem, 1.38vw, 2rem); /* Adaptive font size */
    color: #42567A; /* Цвет стрелок */
    cursor: pointer;
    box-shadow: none; /* Убрал тень */
    transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
    outline: none;

    &:hover {
        background-color: rgba(66, 86, 122, 0.1); /* Легкий фон при наведении */
    }

    &:active {
        background-color: rgba(66, 86, 122, 0.2); /* Темнее при нажатии */
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

const CircleContainer = styled.div`
    position: relative;
    top: 0;
    /* left: 50%; */
    /* bottom: 50%; */
    transform: translateY(-73%);
    display: flex;
    align-items: center;
    justify-content: center;
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

// Новый компонент для круга (не SVG)
const BackgroundCircle = styled.div`
    position: absolute;
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
    background-color: ${({ isActive }) => (isActive ? '#5236FF' : '#42567A')}; /* Активная точка синяя, неактивная темная */
    cursor: pointer;
    z-index: 1; /* Над фоновым кругом */
    pointer-events: all; /* Позволяет кликать на сами точки */
    transform: translate(-50%, -50%); /* Центрируем по координатам */
    transition: background-color 0.3s ease, transform 0.3s ease;

    &:hover {
        transform: translate(-50%, -50%) scale(1.2);
    }
    left: ${({ x }) => x}px;
    top: ${({ y }) => y}px;
`;

const ActiveDotInfo = styled.div<{ x: number; y: number }>`
    position: absolute;
    top: ${({ y }) => y}px;
    left: ${({ x }) => x}px;
    transform: translate(-50%, -50%); /* Центрируем по точке */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff; /* Белый фон круга с номером и категорией */
    border: 1px solid #E6E6E6; /* Светлая рамка */
    border-radius: 50%;
    width: clamp(40px, 3.47vw, 50px); /* Adaptive width */
    height: clamp(40px, 3.47vw, 50px); /* Adaptive height */
    z-index: 2; /* Над кругом и точками */
    pointer-events: none; /* Не блокируем клики под ним */
    box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* Легкая тень */
    transition: top 0.3s ease, left 0.3s ease; /* Плавное перемещение */

    span:first-child {
        font-size: clamp(0.9rem, 0.76vw, 1.1rem); /* Adaptive font size */
        font-weight: 700;
        color: #383838;
    }
    span:last-child {
        font-size: clamp(0.6rem, 0.48vw, 0.7rem); /* Adaptive font size */
        font-weight: 500;
        color: #666;
        text-align: center;
        line-height: 1;
        margin-top: clamp(1px, 0.13vw, 2px); /* Adaptive margin-top */
    }

    @media (max-width: 768px) {
        display: none; /* Скрываем на мобильных */
    }
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

    .swiper {
        width: 100%;
        height: clamp(200px, 17.36vw, 250px); /* Adaptive height */
    }

    /* Стили для навигации Swiper */
    .swiper-button-prev, .swiper-button-next {
        color: #42567A; /* Цвет стрелок навигации слайдера */
        width: clamp(30px, 2.77vw, 40px); /* Adaptive width */
        height: clamp(30px, 2.77vw, 40px); /* Adaptive height */
        background-color: transparent; /* Прозрачный фон */
        border: 1px solid #42567A; /* Тонкая рамка */
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: none;
        top: 60%; /* Сдвинул ниже, чтобы не перекрывать карточки */
        transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;

        &::after {
            font-size: clamp(1rem, 1.04vw, 1.5rem); /* Adaptive font size */
        }
        &:hover {
            background-color: rgba(66, 86, 122, 0.1); /* Легкий фон при наведении */
        }
    }

    .swiper-button-prev {
        left: clamp(5px, 0.69vw, 10px); /* Adaptive left */
    }

    .swiper-button-next {
        right: clamp(5px, 0.69vw, 10px); /* Adaptive right */
    }

    .swiper-pagination {
        bottom: clamp(5px, 0.69vw, 10px); /* Adaptive bottom */
    }

    .swiper-pagination-bullet {
        background: #E6E6E6; /* Цвет неактивных точек пагинации */
        opacity: 1;
        width: clamp(8px, 0.69vw, 10px); /* Adaptive size */
        height: clamp(8px, 0.69vw, 10px); /* Adaptive size */
    }

    .swiper-pagination-bullet-active {
        background: #5236FF; /* Цвет активной точки пагинации */
        width: clamp(8px, 0.69vw, 10px); /* Сохраняем размер */
        height: clamp(8px, 0.69vw, 10px); /* Сохраняем размер */
    }
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
        color: #42567A; /* Цвет описания события */
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
        const containerSize = 530; // Max width/height of CircleContainer
        const radius = 265; // Max radius of the BackgroundCircle (120px diameter / 2)
        const centerX = containerSize / 2;
        const centerY = containerSize / 2;

        const angle = (360 / total) * index - 90; // Start from top (-90 degrees)
        const radians = (angle * Math.PI) / 180;
        const x = centerX + radius * Math.cos(radians);
        const y = centerY + radius * Math.sin(radians);
        return { x, y };
    }, []);

    // useGSAP hook for animations
    useGSAP(() => {
        // Анимация чисел года при смене
        gsap.fromTo(yearRefs.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.1 }
        );

        // Анимация появления слайдера
        gsap.fromTo(sliderRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.2 }
        );

        // Анимация ActiveDotInfo (для плавного перемещения)
        gsap.to('.active-dot-info', { // Используем класс для таргетинга
            duration: 0.5,
            ease: 'power2.out',
        });

    }, { scope: containerRef, dependencies: [activeIndex, currentData] });

    // Effect to show/hide demo message
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
    const { x: activeDotX, y: activeDotY } = getDotPosition(activeIndex, historicalDates.length);

    return (
        <TimelineContainer ref={containerRef}>
            <TimelineSection>
                <Header>
                    <Title>Исторические даты</Title>
                </Header>

                <VerticalLineBackground />
                <HorizontalLineBackground />

                <DateDisplay>
                    <YearText ref={el => { if (el) yearRefs.current[0] = el; }} color="#5D5FEF"> {/* Обновленный цвет */}
                        {startYear}
                    </YearText>
                    <YearText ref={el => { if (el) yearRefs.current[1] = el; }} color="#EF5DA8"> {/* Обновленный цвет */}
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
                    {/* ActiveDotInfo позиционируется относительно CircleContainer */}
                    <ActiveDotInfo className="active-dot-info" x={activeDotX} y={activeDotY}>
                        <span>{activeIndex + 1}</span>
                        <span>{currentData.category}</span>
                    </ActiveDotInfo>
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
