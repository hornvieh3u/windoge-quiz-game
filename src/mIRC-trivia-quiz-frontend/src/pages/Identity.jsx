import { useIdentityKit } from '@nfid/identitykit/react';
import { formatPrincipal } from '../utils';

function Identity({ user, signInWithWallet }) {

    const { connect, disconnect } = useIdentityKit()

    return (
        <>
            {
                user ?
                (
                    <div className='flex flex-row gap-2'>
                    <button className="bg-green-700 rounded px-5 py-2 text-white w-2/3" onClick={user ? signInWithWallet : () => connect()}>
                        <div className='flex flex-row gap-3 content-center justify-center'>
                        <div>{formatPrincipal(user.principal)}</div>
                        <div>|</div>
                        <div>Login</div>
                        </div>
                    </button>
                    <button className="bg-red-700 rounded px-1 py-2 text-white w-1/3" onClick={() => disconnect()}>
                        Disconnect
                    </button>
                    </div>
                ) :
                (
                    <button className="bg-green-700 rounded px-4 py-2 text-white w-full" onClick={user ? signInWithWallet : () => connect()}>
                        Login with wallet
                    </button>
                )
            }
        </>
    )
}

export default Identity;