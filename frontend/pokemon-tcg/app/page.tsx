
'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ToastifyComponent from "./ui/components/ToastifyComponent";
import { useEffect } from 'react';
import { useAppDispatch } from './lib/hooks';
import { loadToastifyState } from './lib/features/toastify/toastifySlice';
export default function Home() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(loadToastifyState(''))
  }, [dispatch])

  return (
    <section className="min-h-[calc(100vh-105px)] bg-gradient-to-br from-[#6390F0] via-[#EE8130] to-[#F7D02C] text-base-content dark:text-white  flex flex-col justify-center items-center p-8">
      <div className="text-center max-w-3xl">
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Build Your Deck. Battle with Heart.
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          Welcome to the ultimate Pokémon TCG experience. Explore a hand-crafted catalog of the original 151 Pokémon with custom card artwork and battle-ready stats. Build your dream deck and face off in real-time matches.
        </motion.p>

        <motion.ul
          className="text-left text-base md:text-lg mb-6 max-w-lg mx-auto list-disc list-inside"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <li>🧩 Browse the full Kanto Pokémon catalog with beautiful custom cards</li>
          <li>🧠 Track your collection and build strategic decks</li>
          <li>⚔️ Enter live turn-based battles against other trainers</li>
        </motion.ul>

        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <button
            onClick={() => router.push('/catalog')}
            className="btn btn-warning text-black"
          >
            📚 View Catalog
          </button>
          <button
            onClick={() => router.push('/collection')}
            className="btn btn-outline btn-accent"
          >
            🧵 Build Collection
          </button>
          <button
            onClick={() => router.push('/play')}
            className="btn btn-success"
          >
            🎮 Play Now
          </button>
        </motion.div>
      </div>
      <ToastifyComponent />
    </section>
  )
}


