'use client'
import React from 'react'

const OpenDeckDetailsModalBtn = ({ openId }: { openId: string }) => {
    const openModal = () => {
        // Get the modal element by its ID.
        const modal = document.getElementById(`${openId}`) as HTMLDialogElement | null;
        if (!modal) {
            console.error('Deck details dialog not found');
            return null;
        } else {
            modal.showModal(); // Show the modal when the button is clicked
        }
    }

    return (
        <button className="btn" onClick={openModal}>Update</button>
    )
}

export default OpenDeckDetailsModalBtn