'use client'
import React from 'react'
import { useSession } from 'next-auth/react'
import { useAppDispatch } from '@/lib/hooks'
import { loadToastifyState } from '@/lib/features/toastify/toastifySlice'

const AddNewDeckComponent = ({ newDeckName, setNewDeckName, fetchDecks }: { newDeckName: string, setNewDeckName: (name: string) => void, fetchDecks: () => void }) => {
    const { data: session, status } = useSession()
    const dispatch = useAppDispatch()
    return (

        <div className="flex items-center gap-2">
            <input
                type="text"
                placeholder="New deck name"
                className="input input-sm input-bordered"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
            />
            <button
                className="btn btn-sm btn-success"
                onClick={async () => {
                    if (!newDeckName.trim()) return;

                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session?.accessToken}`
                            },
                            body: JSON.stringify({ name: newDeckName.trim(), user_id: session?.user.id })
                        });

                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || 'Failed to create deck');

                        dispatch(loadToastifyState(`Deck "${newDeckName.trim()}" has been created`));
                        setNewDeckName('');
                        fetchDecks();
                    } catch (err) {
                        console.error('Error creating deck:', err);
                        dispatch(loadToastifyState(`Failed to create deck: ${err}`));
                    }
                }}
            >
                Create
            </button>
        </div>
    )
}

export default AddNewDeckComponent