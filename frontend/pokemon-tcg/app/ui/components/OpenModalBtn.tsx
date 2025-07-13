'use client'
import React from 'react'

const OpenModalBtn = ({ pokemon_collector_number }: { pokemon_collector_number: number }) => {
    const openModal = () => {
        const modal = document.getElementById(`modal-pokemon-${pokemon_collector_number}`) as HTMLDialogElement | null;
        console.log("modal", modal)
        if (modal) {
            modal.showModal();
        }
    };
    return (
        <button className="btn" onClick={openModal}>View Full Details</button>
    )
}

export default OpenModalBtn