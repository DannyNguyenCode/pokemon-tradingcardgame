'use client'
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
const AdminPanel = () => {
    const { data: session } = useSession()
    const router = useRouter()
    const [indentifier, setIdentifier] = React.useState('');
    const [start, setStart] = React.useState('');
    const [end, setEnd] = React.useState('');
    useEffect(() => {
        if (!session || session.user.role !== 'admin') {
            // Redirect to login if not authenticated
            router.push('/login')
        }
    }, [router, session])
    const handleImportCard = () => {
        // Logic to handle card import
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cards/import/${indentifier}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            }
        }).then(response => {
            if (response.ok) {
                console.log("response", response);
                console.log("Card imported successfully");
            } else {
                console.error("Failed to import card");
            }
        }).catch(error => {
            console.error("Error importing card:", error);
        })
    }
    const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIdentifier(e.target.value);
    }
    const handleTestJWTAdmin = async () => {
        console.log("Session:", session);
        // Logic to test JWT authentication
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authentications/test-auth-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            }
        })
        const responseData = await response.json();
        console.log("Test JWT admin button clicked");
        console.log("Response from test JWT admin:", responseData);

    }
    const handleTestJWTUser = async () => {
        // Logic to test JWT authentication
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authentications/test-auth-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            }
        })
        const responseData = await response.json();
        console.log("Test JWT user button clicked");
        console.log("Response from test JWT user:", responseData);

    }
    const handleImportCardRange = () => {
        // Logic to handle card range import
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cards/import/range/${start}/${end}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            }
        }).then(response => {
            if (response.ok) {
                console.log("Card range imported successfully");
            } else {
                console.error("Failed to import card range");
            }
        }).catch(error => {
            console.error("Error importing card range:", error);
        })
    }

    return (
        <div className='h-screen p-10'>
            <div className='flex flex-col p-4 m-10 items-center justify-center'>
                <h1 className='text-2xl font-bold'>Admin Panel</h1>
                <p className='text-lg'>Manage your application settings here.</p>
            </div>
            <div className='flex flex-col items-center justify-center'>

                <div className='grid grid-cols-2'>

                    <div className='flex flex-col items-center justify-center'>
                        <div className=''></div>
                        <h2 className='text-xl font-semibold'>Import Card</h2>
                        <p className='text-md'>Provide pokedex number or name of pokemon to add to database</p>
                        <input onChange={handleIdentifierChange} value={indentifier} aria-label='enter pokedex id or name input field' type="text" placeholder="Enter Pokedex number or Pokemon name" className="input input-bordered w-full max-w-xs mt-2" />
                        <p className='text-sm mt-2'>Note: This will add the card to the database and make it available in the catalog.</p>
                        <button onClick={handleImportCard} aria-label='single pokemon card import' className='btn btn-primary mt-4'>Import Card</button>
                    </div>
                    <div className='flex flex-col items-center justify-center gap-10'>
                        <div className='flex flex-col items-center justify-center'>
                            <h2 className='text-xl font-semibold'>Test JWT Admin Authentication</h2>
                            <p className='text-md'>Returns a message regarding your JWT token</p>
                            <p className='text-sm'>(Invalid Token, Invalid Role, Token Expired)</p>
                            <p className='text-sm mt-2'>Note: This is specifically to test JWT route protection.</p>
                            <button onClick={() => handleTestJWTAdmin()} aria-label='admin jwt test on click' className='btn btn-primary mt-4'>Test Admin Authentication</button>
                        </div>
                        <div className='flex flex-col items-center justify-center'>
                            <h2 className='text-xl font-semibold'>Test JWT user Authentication</h2>
                            <p className='text-md'>Returns a message regarding your JWT token</p>
                            <p className='text-sm'>(Invalid Token, Invalid Role, Token Expired)</p>
                            <p className='text-sm mt-2'>Note: This is specifically to test JWT route protection.</p>
                            <button onClick={() => handleTestJWTUser()} aria-label='admin jwt test on click' className='btn btn-primary mt-4'>Test Admin Authentication</button>
                        </div>
                    </div>
                    <div className='flex flex-col items-center justify-center'>
                        <div className=''></div>
                        <h2 className='text-xl font-semibold'>Import Card Range</h2>
                        <p className='text-md'>Provide range of pokedex number to add to database</p>
                        <input onChange={(e) => setStart(e.target.value)} value={start} aria-label='enter start pokedex id' type="text" placeholder="Enter start Pokedex number" className="input input-bordered mt-2" />
                        <input onChange={(e) => setEnd(e.target.value)} value={end} aria-label='enter end pokedex id' type="text" placeholder="Enter end Pokedex number" className="input input-bordered mt-2" />
                        <p className='text-sm mt-2'>Note: This will add the card to the database and make it available in the catalog.</p>
                        <button onClick={handleImportCardRange} aria-label='single pokemon card import' className='btn btn-primary mt-4'>Import Card</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminPanel