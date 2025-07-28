'use client'
import React, { useState } from 'react'
import { useAppDispatch } from '@/lib/hooks';
import { loadToastifyState } from '@/lib/features/toastify/toastifySlice';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
const CreateDeckModal = ({ onCreate }: { onCreate: () => void }) => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const [newDeckName, setNewDeckName] = useState('');
    const { data: session } = useSession()
    return (
        <div>
            <input
                type='radio'
                name="deckSelect"
                className="btn btn-info"
                value='+ Create Deck'
                aria-label='+ Create Deck'
                onClick={() => {
                    const modal = document.getElementById('create_deck_modal') as HTMLDialogElement;
                    modal?.showModal();
                }}
            />
            <dialog id="create_deck_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Create New Deck</h3>
                    <p className="py-2">Give your deck a name:</p>
                    <input
                        type="text"
                        placeholder="Deck name"
                        className="input input-bordered w-full"
                        value={newDeckName}
                        onChange={(e) => setNewDeckName(e.target.value)}
                    />
                    <div className="modal-action">
                        <form method="dialog" className="flex gap-2">
                            {/* Close button */}
                            <button className="btn">Cancel</button>
                            {/* Create button */}
                            <button
                                type="button"
                                className={`btn btn-primary ${!newDeckName.trim() ? 'btn-disabled' : ''}`}
                                onClick={async () => {
                                    if (!newDeckName.trim()) return;

                                    try {
                                        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${session?.accessToken}`,
                                            },
                                            body: JSON.stringify({ name: newDeckName.trim() }),
                                        });

                                        const data = await res.json();
                                        if (!res.ok) throw new Error(data?.error || 'Failed to create deck');

                                        dispatch(loadToastifyState(`Deck "${newDeckName.trim()}" has been created`));
                                        setNewDeckName('');
                                        (document.getElementById('create_deck_modal') as HTMLDialogElement)?.close();
                                        onCreate();
                                        router.refresh()
                                    } catch (err) {
                                        console.error('Error creating deck:', err);
                                        dispatch(loadToastifyState(`Failed to create deck`));
                                    }
                                }}
                            >
                                Create Deck
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    )
}

export default CreateDeckModal