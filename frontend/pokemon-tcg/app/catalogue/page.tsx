
import React from 'react'
import CardList from '@app/ui/components/CardList'

const CataloguePage = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/`, { next: { revalidate: 86400 } }).then((res) => {

        return res.json()
    })

    return (
        <CardList data={response.data} />
    )
}

export default CataloguePage