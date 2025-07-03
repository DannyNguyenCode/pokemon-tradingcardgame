
import React from 'react'

import CardList from '@app/ui/components/CardList'
const CataloguePage = async () => {
    const response = await fetch(`${process.env.BASE_API_URL}/api/cards/`).then((res) => {
        return res.json()
    })

    return (
        <CardList data={response.data} />
    )
}

export default CataloguePage