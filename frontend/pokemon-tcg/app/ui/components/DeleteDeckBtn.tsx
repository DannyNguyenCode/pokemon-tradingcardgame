'use client'
import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAppDispatch } from '@/lib/hooks'
import { loadToastifyState } from '@/lib/features/toastify/toastifySlice'
import { Deck } from '@/lib/definitions'
import { useRouter } from 'next/navigation'
const DeleteDeckBtn = ({ deck, onDelete }: { deck?: Deck | null, onDelete: () => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { data: session } = useSession()
    const dispatch = useAppDispatch()
    const router = useRouter()

    return (
        <>
            <button disabled={deck?.name ? false : true} className="btn btn-error btn-sm" onClick={() => setIsModalOpen(true)}>
                Delete Deck
            </button>
            {isModalOpen && (
                <dialog id="delete_modal" className="modal modal-open" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-bold text-lg">Delete <span className='text-error font-semibold underline'>{deck?.name}</span> Deck</h3>
                        <p className="py-4">Are you sure you want to permanently delete your <span className='text-error font-semibold underline'>{deck?.name}</span> deck?</p>
                        <div className="modal-action">
                            <form method="dialog" className="flex gap-2">
                                <button className="btn" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-error"
                                    onClick={async (e) => {
                                        e.preventDefault()
                                        try {
                                            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/${deck?.id}`, {
                                                method: 'DELETE',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    Authorization: `Bearer ${session?.accessToken}`
                                                }
                                            })
                                            if (!res.ok) throw new Error('Delete failed')
                                            setIsModalOpen(false)
                                            onDelete()
                                            router.refresh()
                                            dispatch(loadToastifyState('Deck has been deleted'))
                                        } catch (err) {
                                            console.error('Delete failed', err)
                                        }
                                    }}
                                >
                                    Confirm Delete
                                </button>
                            </form>
                        </div>
                    </div>
                </dialog>
            )}
        </>

    )
}

export default DeleteDeckBtn