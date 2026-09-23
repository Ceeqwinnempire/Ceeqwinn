```javascript
/*
=========================================================
CEEQWINN SUPABASE / ECONOMY CONNECTION LAYER
=========================================================

This file is the reusable client-side doorway between
CEEQWINN and the Supabase-backed player/economy system.

IMPORTANT:

The browser is NOT authoritative.

This file does NOT directly:

- change wallet balances
- insert ledger entries
- expose ticket inventory
- decide diamond amounts
- create economy transactions manually

Sensitive economy actions are performed by the
server-side Supabase functions.

=========================================================
*/


/*
=========================================================
1. SUPABASE CONFIGURATION
=========================================================
*/

const CEEQWINN_SUPABASE_URL =
    "https://iwuambqesluciawsgyww.supabase.co";


const CEEQWINN_SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Cf4ctw1m5RTNUHQ5mfsidQ_zG6WuGdx";


/*
=========================================================
2. CREATE CLIENT
=========================================================
*/

const {
    createClient
} = supabase;


const ceeqwinnSupabase =
    createClient(
        CEEQWINN_SUPABASE_URL,
        CEEQWINN_SUPABASE_PUBLISHABLE_KEY
    );


/*
=========================================================
3. INTERNAL STATE
=========================================================
*/

let ceeqwinnCurrentUser = null;

let ceeqwinnCurrentWallet = null;


/*
=========================================================
4. INITIALIZE CEEQWINN PLAYER
=========================================================

First try to use an existing Supabase session.

Only create a new anonymous session when there is
no existing session.

This prevents the site from unnecessarily creating
a completely new anonymous player every time this
module is initialized.
=========================================================
*/

async function ceeqwinnInitialize(){

    const {
        data: sessionData,
        error: sessionError
    } =
        await ceeqwinnSupabase
            .auth
            .getSession();


    if(sessionError){

        throw sessionError;

    }


    let session =
        sessionData.session;


    /*
    -----------------------------------------------------
    No existing session.
    Create an anonymous CEEQWINN player.
    -----------------------------------------------------
    */

    if(!session){

        const {
            data: authData,
            error: authError
        } =
            await ceeqwinnSupabase
                .auth
                .signInAnonymously();


        if(authError){

            throw authError;

        }


        session =
            authData.session;

    }


    if(!session || !session.user){

        throw new Error(
            "CEEQWINN player session could not be created."
        );

    }


    ceeqwinnCurrentUser =
        session.user;


    /*
    -----------------------------------------------------
    Load the player's wallet.
    -----------------------------------------------------
    */

    await ceeqwinnRefreshWallet();


    return {
        user: ceeqwinnCurrentUser,
        wallet: ceeqwinnCurrentWallet
    };

}


/*
=========================================================
5. GET CURRENT PLAYER
=========================================================
*/

function ceeqwinnGetPlayer(){

    return ceeqwinnCurrentUser;

}


/*
=========================================================
6. REFRESH CURRENT WALLET
=========================================================
*/

async function ceeqwinnRefreshWallet(){

    if(!ceeqwinnCurrentUser){

        throw new Error(
            "CEEQWINN player has not been initialized."
        );

    }


    const {
        data: wallet,
        error
    } =
        await ceeqwinnSupabase
            .from("wallets")
            .select(
                "id, balance_diamonds, player_id"
            )
            .eq(
                "player_id",
                ceeqwinnCurrentUser.id
            )
            .single();


    if(error){

        throw error;

    }


    ceeqwinnCurrentWallet =
        wallet;


    return wallet;

}


/*
=========================================================
7. GET CURRENT WALLET
=========================================================
*/

function ceeqwinnGetWallet(){

    return ceeqwinnCurrentWallet;

}


/*
=========================================================
8. GET DIAMOND BALANCE
=========================================================
*/

function ceeqwinnGetDiamondBalance(){

    if(!ceeqwinnCurrentWallet){

        return 0;

    }


    return Number(
        ceeqwinnCurrentWallet.balance_diamonds
    );

}


/*
=========================================================
9. READ CURRENT PLAYER'S LEDGER
=========================================================

Players may read their own ledger according to the
database RLS policy.

They cannot insert or modify ledger entries directly.
=========================================================
*/

async function ceeqwinnGetLedger(){

    if(!ceeqwinnCurrentWallet){

        throw new Error(
            "CEEQWINN wallet has not been initialized."
        );

    }


    const {
        data: ledger,
        error
    } =
        await ceeqwinnSupabase
            .from("wallet_ledger")
            .select(
                "id, amount_diamonds, entry_type, reference_id, created_at"
            )
            .eq(
                "wallet_id",
                ceeqwinnCurrentWallet.id
            )
            .order(
                "created_at",
                {
                    ascending:false
                }
            );


    if(error){

        throw error;

    }


    return ledger || [];

}


/*
=========================================================
10. REDEEM A TICKET
=========================================================

IMPORTANT:

The browser sends ONLY the ticket code.

The browser does NOT send:

- player ID
- wallet ID
- diamond amount

The server determines all of those.

The server-side redeem_ticket() function performs
the actual transaction.
=========================================================
*/

async function ceeqwinnRedeemTicket(
    ticketCode
){

    if(!ceeqwinnCurrentUser){

        throw new Error(
            "CEEQWINN player has not been initialized."
        );

    }


    if(!ticketCode){

        throw new Error(
            "A ticket code is required."
        );

    }


    const {
        data,
        error
    } =
        await ceeqwinnSupabase
            .rpc(
                "redeem_ticket",
                {
                    p_ticket_code:
                        ticketCode
                }
            );


    if(error){

        throw error;

    }


    /*
    -----------------------------------------------------
    Refresh wallet after successful redemption.
    -----------------------------------------------------
    */

    await ceeqwinnRefreshWallet();


    return {
        diamondsCredited:
            Number(data),

        wallet:
            ceeqwinnCurrentWallet
    };

}


/*
=========================================================
11. EXPORT CEEQWINN ECONOMY API
=========================================================

The global object gives other CEEQWINN pages a consistent
interface without exposing the internal Supabase client
everywhere.
=========================================================
*/

window.CEEQWINN = {

    supabase:
        ceeqwinnSupabase,

    initialize:
        ceeqwinnInitialize,

    getPlayer:
        ceeqwinnGetPlayer,

    getWallet:
        ceeqwinnGetWallet,

    refreshWallet:
        ceeqwinnRefreshWallet,

    getDiamondBalance:
        ceeqwinnGetDiamondBalance,

    getLedger:
        ceeqwinnGetLedger,

    redeemTicket:
        ceeqwinnRedeemTicket

};
```
