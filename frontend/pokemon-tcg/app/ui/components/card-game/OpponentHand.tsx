import React from 'react'

const OpponentHand = ({ opponentHandSize }: { opponentHandSize: number }) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <p>Opponent&apos;s Hand</p>
            <div className="flex gap-2">
                {Array.from({ length: opponentHandSize }).map((_, idx) => (
                    <div
                        key={idx}
                        className="w-24 h-36 md:w-28 md:h-40 rounded-lg border-4 border-yellow-500 bg-gradient-to-br from-blue-700 to-blue-400  shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center text-3xl font-bold text-white select-none"
                    >
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            stroke="url(#pokeballGradient)"
                            fill="none"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <defs>
                                <linearGradient id="pokeballGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#E60012" />
                                    <stop offset="50%" stopColor="#FFFFFF" />
                                    <stop offset="100%" stopColor="#000000" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4m2-2h7M3 12h7"
                                stroke="url(#pokeballGradient)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <path
                                d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
                                stroke="url(#pokeballGradient)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />

                        </svg>

                    </div>
                ))}
            </div>
        </div>

    )
}

export default OpponentHand