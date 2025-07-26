'use client'
import React from 'react'

const btnSizeMap: Record<string, string> = {
    "xs": "btn-xs",
    "sm": "btn-sm",
    "md": "btn-md",
    "lg": "btn-lg",
    "xl": "btn-xl"

}
const btnColorMap: Record<string, string> = {
    "neutral": "btn-neutral",
    "primary": "btn-primary",
    "secondary": "btn-secondary",
    "accent": "btn-accent",
    "info": "btn-info",
    "success": "btn-success",
    "warning": "btn-warning",
    "error": "btn-error",
    "soft": "btn-soft"
}
const OpenModalBtn = ({ title, pokemon_collector_number, buttonSize, buttonColor }: { pokemon_collector_number: number, title?: string, buttonSize?: string, buttonColor?: string }) => {
    const btnSize = buttonSize ? btnSizeMap[buttonSize] : btnSizeMap["md"]
    const btnColor = buttonColor ? btnColorMap[buttonColor] : btnColorMap["primary"]
    const openModal = () => {
        const modal = document.getElementById(`modal-pokemon-${pokemon_collector_number}`) as HTMLDialogElement | null;
        if (modal) {
            modal.showModal();
        }
    };
    return (
        <button className={`btn ${btnSize} ${btnColor}`} onClick={openModal}>{title ? title : "View Full Details"}</button>
    )
}

export default OpenModalBtn