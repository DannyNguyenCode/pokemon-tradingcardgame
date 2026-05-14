'use client'

import Image from 'next/image'
import { normalizePokemonType, typeColor, typeIconUrl, type Pokemon } from '@/lib/pokemon'

type HoloCardProps = {
    pokemon: Pokemon
    className?: string
    /** Team builder: no white inner panel—content sits on the type gradient frame. */
    variant?: 'default' | 'binder'
}

function costTypeTokens(cost: string | undefined): string[] {
    if (!cost?.trim()) return []
    return cost.replace(/^\{|\}$/g, '').split(/[,\s]+/).filter(Boolean)
}

function formatAttribute(type: string): string {
    const k = normalizePokemonType(type)
    return k ? k.charAt(0).toUpperCase() + k.slice(1).toLowerCase() : ''
}

export function HoloCard({ pokemon, className = '', variant = 'default' }: HoloCardProps) {
    const color = typeColor(pokemon.type)
    const attacks = [...pokemon.attacks].filter((a) => Boolean(a?.name))

    const setLabel =
        pokemon.set_code?.trim() && !/^kanto$/i.test(pokemon.set_code.trim())
            ? pokemon.set_code.trim()
            : ''
    const metaRight = setLabel

    return (
        <div
            className={`relative flex h-full min-h-[22rem] w-full min-w-[14rem] max-w-[14rem] flex-col rounded-3xl p-1 ${className}`.trim()}
            style={{
                background: `linear-gradient(140deg, ${color}, oklch(0.95 0.05 80) 50%, ${color})`,
                boxShadow: 'var(--shadow-card)',
            }}
        >
            <div
                className={
                    variant === 'binder'
                        ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.4rem] bg-transparent p-3 text-base-content'
                        : 'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.4rem] bg-base-100 p-4 text-base-content'
                }
            >
                <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
                    <div className="flex shrink-0 items-baseline justify-between gap-2">
                        <h3
                            className="min-w-0 flex-1 truncate text-base font-black uppercase tracking-wide"
                            style={{ color }}
                        >
                            {pokemon.name}
                        </h3>
                        <div className="flex shrink-0 items-baseline gap-1">
                            <span className="text-xs opacity-70">HP</span>
                            <span className="text-base font-black tabular-nums">{pokemon.hp}</span>
                        </div>
                    </div>

                    <div
                        className="relative mt-3 flex shrink-0 aspect-[4/3] items-center justify-center overflow-hidden rounded-xl"
                        style={{
                            background: `radial-gradient(circle at 30% 30%, oklch(0.98 0.02 95), ${color} 140%)`,
                        }}
                    >
                        <Image
                            src={pokemon.image_url}
                            alt={pokemon.name}
                            fill
                            sizes="224px"
                            className="relative z-[1] object-contain p-3"
                            unoptimized
                        />
                    </div>

                    <div
                        className={`mt-2 flex shrink-0 items-center gap-2 text-[10px] ${metaRight ? 'justify-between' : ''}`}
                    >
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5">
                            {pokemon.rarity ? (
                                <>
                                    <span className="truncate font-semibold uppercase tracking-wider opacity-70">
                                        {pokemon.rarity}
                                    </span>
                                    <span className="shrink-0 opacity-40" aria-hidden>
                                        ·
                                    </span>
                                </>
                            ) : null}
                            <Image
                                className="shrink-0 rounded-full object-cover"
                                src={typeIconUrl(pokemon.type)}
                                alt={formatAttribute(pokemon.type)}
                                width={20}
                                height={20}
                                title={formatAttribute(pokemon.type)}
                            />
                        </div>
                        {metaRight ? (
                            <span className="shrink-0 text-right font-medium tabular-nums opacity-80">
                                {metaRight}
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-base-300 pt-3">
                        <div className="space-y-3">
                            {attacks.map((a, i) => {
                                const costIcons = costTypeTokens(a.cost)
                                return (
                                    <div key={`${a.name}-${i}`} className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="mb-0.5 flex min-h-[18px] flex-wrap items-center gap-0.5">
                                                {costIcons.length ? (
                                                    costIcons.map((token, j) => (
                                                        <Image
                                                            key={`${a.name}-cost-${j}`}
                                                            src={typeIconUrl(token)}
                                                            alt={formatAttribute(token)}
                                                            width={16}
                                                            height={16}
                                                            className="rounded-full object-cover"
                                                            title={formatAttribute(token)}
                                                        />
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] uppercase tracking-wider opacity-50">—</span>
                                                )}
                                            </div>
                                            <div className="truncate text-sm font-semibold">{a.name}</div>
                                        </div>
                                        <div className="shrink-0 text-2xl font-black tabular-nums" style={{ color }}>
                                            {typeof a.damage === 'number' ? a.damage : '—'}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="mt-auto shrink-0 space-y-1 border-t border-base-300 pt-2 text-[10px] opacity-80">
                        <div className="flex flex-wrap items-center gap-1">
                            <span className="shrink-0 font-semibold opacity-70">Weakness</span>
                            {pokemon.weakness.length ? (
                                <span className="flex flex-wrap items-center gap-0.5">
                                    {pokemon.weakness.map((t, i) => (
                                        <Image
                                            key={`${t}-${i}`}
                                            src={typeIconUrl(t)}
                                            alt={formatAttribute(t)}
                                            width={16}
                                            height={16}
                                            className="rounded-full object-cover"
                                            title={formatAttribute(t)}
                                        />
                                    ))}
                                </span>
                            ) : (
                                <span>—</span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                            <span className="shrink-0 font-semibold opacity-70">Resistance</span>
                            {pokemon.resistance.length ? (
                                <span className="flex flex-wrap items-center gap-0.5">
                                    {pokemon.resistance.map((t, i) => (
                                        <Image
                                            key={`${t}-${i}`}
                                            src={typeIconUrl(t)}
                                            alt={formatAttribute(t)}
                                            width={16}
                                            height={16}
                                            className="rounded-full object-cover"
                                            title={formatAttribute(t)}
                                        />
                                    ))}
                                </span>
                            ) : (
                                <span>—</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
