import HomeClient from './HomeClient'
import { fetchHomeFeatureCards } from '@/lib/fetchHomeFeatureCards'

export default async function Home() {
    const { heroPokemon, legendaryBirds, kantoStarters } = await fetchHomeFeatureCards()

    return (
        <HomeClient
            heroPokemon={heroPokemon}
            legendaryBirds={legendaryBirds}
            kantoStarters={kantoStarters}
        />
    )
}
