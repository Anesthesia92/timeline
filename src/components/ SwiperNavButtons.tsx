
import styled from "styled-components";

type PaginationProps = {
    activeIndex: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
};

const NavButtonGap = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 20px;
`;

const NavButton = styled.button`
    background: transparent;
    border: 1px solid #42567A;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: inline-block;
    font-size: 1rem;
    font-weight: bold;
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

export const SwiperNavButtons = ({ activeIndex, total, onPrev, onNext }: PaginationProps) => {
    const isBeginning = activeIndex === 0;
    const isEnd = activeIndex === total - 1;

    return (
        <NavButtonGap>
            {/* Кнопка "назад" */}
            <NavButton
                onClick={onPrev}
                disabled={isBeginning}
            >
                &lt;
            </NavButton>

            {/* Кнопка "вперед" */}
            <NavButton
                onClick={onNext}
                disabled={isEnd}
            >
                &gt;
            </NavButton>
        </NavButtonGap>
    );
};