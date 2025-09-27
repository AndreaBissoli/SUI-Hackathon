module edu_defi::contract {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use std::string::String;
    use sui::vec_map::{Self, VecMap};

    // ============ Error Codes ============
    const E_INVALID_AMOUNT: u64 = 1;
    const E_INVALID_PERCENTAGE: u64 = 2;
    const E_CONTRACT_NOT_FOUND: u64 = 5;
    const E_UNAUTHORIZED: u64 = 6;
    const E_INSUFFICIENT_FUNDS: u64 = 8;
    const E_INVALID_DURATION: u64 = 9;
    const E_ALREADY_CLAIMED: u64 = 10;

    /// Student token witness for creating currency
    public struct STUDENT_TOKEN has drop {}

    /// Student token for equity tracking  
    public struct StudentToken has drop {}

    /// Dividend payment record
    public struct DividendPayment has store {
        payment_id: u64,
        total_amount: u64,
        payment_timestamp: u64,
        token_snapshot: VecMap<address, u64>,
        claimed_by: vector<address>,
    }

    /// Reward Pool per gestire i dividendi di ogni studente
    public struct RewardPool has key, store {
        id: UID,
        student_address: address,
        contract_id: ID,
        total_token_supply: u64,
        current_token_holders: VecMap<address, u64>, // distribuzione attuale dei token
        dividend_payments: vector<DividendPayment>,
        next_payment_id: u64,
        total_balance: Balance<SUI>, // Pool dei fondi per i dividendi
    }

    /// Contract structure modificato per supportare i token
    public struct Contract has key, store {
        id: UID,
        student_address: address,
        investor_address: address,
        pdf_hash: String,
        funding_amount: u64,
        release_interval_days: u64,
        equity_percentage: u64,
        duration_months: u64,
        balance: Balance<SUI>,
        funds_released: u64,
        next_release_time: u64,
        student_monthly_income: u64,
        is_active: bool,
        created_at: u64,
        // Nuovi campi per il sistema di token
        reward_pool_id: Option<ID>,
        has_tokens_issued: bool,
    }



    /// Create and share a contract, return its address
    public fun create_and_share_contract(
        student_address: address,
        pdf_hash: String,
        funding_amount: u64,
        release_interval_days: u64,
        equity_percentage: u64,
        duration_months: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): address {
        assert!(funding_amount > 0, E_INVALID_AMOUNT);
        assert!(equity_percentage <= 100, E_INVALID_PERCENTAGE);
        assert!(duration_months > 0, E_INVALID_DURATION);

        let contract = Contract {
            id: object::new(ctx),
            student_address,
            investor_address: tx_context::sender(ctx),
            pdf_hash,
            funding_amount,
            release_interval_days,
            equity_percentage,
            duration_months,
            balance: balance::zero<SUI>(),
            funds_released: 0,
            next_release_time: clock::timestamp_ms(clock) + (release_interval_days * 24 * 60 * 60 * 1000),
            student_monthly_income: 0,
            is_active: false,
            created_at: clock::timestamp_ms(clock),
            reward_pool_id: option::none(),
            has_tokens_issued: false,
        };
        
        let contract_address = object::uid_to_address(&contract.id);
        transfer::share_object(contract);
        contract_address
    }

    /// Get contract ID as address
    public fun get_address(contract: &Contract): address {
        object::uid_to_address(&contract.id)
    }

    /// Student accepts a contract
    public fun accept_contract(
        contract: &mut Contract,
        ctx: &mut TxContext
    ) {
        assert!(contract.student_address == tx_context::sender(ctx), E_UNAUTHORIZED);
        contract.is_active = true;
    }

    /// Test version of fund_contract_with_tokens that doesn't create currency
    #[test_only]
    public fun fund_contract_with_tokens_test(
        contract: &mut Contract,
        payment: Coin<SUI>,
        _clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(contract.investor_address == tx_context::sender(ctx), E_UNAUTHORIZED);
        
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= contract.funding_amount, E_INSUFFICIENT_FUNDS);
        
        // Add payment to contract balance
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut contract.balance, payment_balance);
        
        contract.has_tokens_issued = true;
    }

    /// Production version - Investor funds contract and receives student tokens
    public fun fund_contract_with_tokens(
        contract: &mut Contract,
        payment: Coin<SUI>,
        _clock: &Clock,
        ctx: &mut TxContext
    ): Coin<StudentToken> {
        assert!(contract.investor_address == tx_context::sender(ctx), E_UNAUTHORIZED);
        assert!(contract.is_active, E_CONTRACT_NOT_FOUND);
        assert!(!contract.has_tokens_issued, E_UNAUTHORIZED); // Tokens possono essere emessi solo una volta
        
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= contract.funding_amount, E_INSUFFICIENT_FUNDS);
        
        // Add payment to contract balance
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut contract.balance, payment_balance);
        
        // Create student tokens (test version - creates zero coin for simplicity)
        let token_supply = 1000000;
        let token_balance = balance::zero<StudentToken>();
        let investor_tokens = coin::from_balance(token_balance, ctx);
        
        // Create reward pool for dividend management
        let mut token_holders = vec_map::empty<address, u64>();
        vec_map::insert(&mut token_holders, tx_context::sender(ctx), token_supply);
        
        let reward_pool = RewardPool {
            id: object::new(ctx),
            student_address: contract.student_address,
            contract_id: object::id(contract),
            total_token_supply: token_supply,
            current_token_holders: token_holders,
            dividend_payments: vector::empty<DividendPayment>(),
            next_payment_id: 0,
            total_balance: balance::zero<SUI>(),
        };
        
        let pool_id = object::id(&reward_pool);
        contract.reward_pool_id = option::some(pool_id);
        contract.has_tokens_issued = true;
        
        transfer::share_object(reward_pool);
        
        investor_tokens
    }

    /// Student pays monthly dividend
    public fun pay_monthly_dividend(
        contract: &Contract,
        reward_pool: &mut RewardPool,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(contract.student_address == tx_context::sender(ctx), E_UNAUTHORIZED);
        assert!(contract.has_tokens_issued, E_CONTRACT_NOT_FOUND);
        assert!(object::id(reward_pool) == *option::borrow(&contract.reward_pool_id), E_UNAUTHORIZED);
        
        let payment_amount = coin::value(&payment);
        let monthly_equity = (contract.student_monthly_income * contract.equity_percentage) / 100;
        assert!(payment_amount >= monthly_equity, E_INSUFFICIENT_FUNDS);
        
        // Crea snapshot della distribuzione token attuale (DIVIDEND RECORD DATE)
        let dividend_payment = DividendPayment {
            payment_id: reward_pool.next_payment_id,
            total_amount: payment_amount,
            payment_timestamp: clock::timestamp_ms(clock),
            token_snapshot: reward_pool.current_token_holders, // SNAPSHOT!
            claimed_by: vector::empty<address>(),
        };
        
        vector::push_back(&mut reward_pool.dividend_payments, dividend_payment);
        reward_pool.next_payment_id = reward_pool.next_payment_id + 1;
        
        // Aggiungi fondi alla pool per i dividendi
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut reward_pool.total_balance, payment_balance);
    }

    /// Claim dividends from specific payment
    public fun claim_dividend_payment(
        reward_pool: &mut RewardPool,
        payment_id: u64,
        ctx: &mut TxContext
    ): Coin<SUI> {
        let investor_address = tx_context::sender(ctx);
        let payments_length = vector::length(&reward_pool.dividend_payments);
        assert!(payment_id < payments_length, E_CONTRACT_NOT_FOUND);
        
        let dividend_payment = vector::borrow_mut(&mut reward_pool.dividend_payments, payment_id);
        
        // Verifica che non abbia già fatto claim su questo dividendo
        assert!(!vector::contains(&dividend_payment.claimed_by, &investor_address), E_ALREADY_CLAIMED);
        
        // Verifica che avesse token al momento dello snapshot
        assert!(vec_map::contains(&dividend_payment.token_snapshot, &investor_address), E_UNAUTHORIZED);
        
        let investor_tokens = *vec_map::get(&dividend_payment.token_snapshot, &investor_address);
        let investor_share = (dividend_payment.total_amount * investor_tokens) / reward_pool.total_token_supply;
        
        // Marca come claimed
        vector::push_back(&mut dividend_payment.claimed_by, investor_address);
        
        // Transfer del dividendo
        let dividend_coin = coin::from_balance(
            balance::split(&mut reward_pool.total_balance, investor_share),
            ctx
        );
        
        dividend_coin
    }

    /// Claim all unclaimed dividends
    public fun claim_all_dividends(
        reward_pool: &mut RewardPool,
        ctx: &mut TxContext
    ): Coin<SUI> {
        let investor_address = tx_context::sender(ctx);
        let mut total_claimable = 0;
        let payments_length = vector::length(&reward_pool.dividend_payments);
        let mut i = 0;
        
        while (i < payments_length) {
            let dividend_payment = vector::borrow_mut(&mut reward_pool.dividend_payments, i);
            
            if (!vector::contains(&dividend_payment.claimed_by, &investor_address) &&
                vec_map::contains(&dividend_payment.token_snapshot, &investor_address)) {
                
                let investor_tokens = *vec_map::get(&dividend_payment.token_snapshot, &investor_address);
                let investor_share = (dividend_payment.total_amount * investor_tokens) / reward_pool.total_token_supply;
                
                vector::push_back(&mut dividend_payment.claimed_by, investor_address);
                total_claimable = total_claimable + investor_share;
            };
            i = i + 1;
        };
        
        assert!(total_claimable > 0, E_INSUFFICIENT_FUNDS);
        
        coin::from_balance(
            balance::split(&mut reward_pool.total_balance, total_claimable),
            ctx
        )
    }

    /// Update token distribution when tokens are transferred/sold
    public fun update_token_distribution(
        reward_pool: &mut RewardPool,
        from_address: address,
        to_address: address,
        token_amount: u64,
        _ctx: &mut TxContext
    ) {
        // Update distribuzione dei token quando vengono trasferiti
        if (vec_map::contains(&reward_pool.current_token_holders, &from_address)) {
            let from_balance = *vec_map::get(&reward_pool.current_token_holders, &from_address);
            assert!(from_balance >= token_amount, E_INSUFFICIENT_FUNDS);
            
            if (from_balance == token_amount) {
                vec_map::remove(&mut reward_pool.current_token_holders, &from_address);
            } else {
                vec_map::insert(&mut reward_pool.current_token_holders, from_address, from_balance - token_amount);
            }
        };
        
        if (vec_map::contains(&reward_pool.current_token_holders, &to_address)) {
            let to_balance = *vec_map::get(&reward_pool.current_token_holders, &to_address);
            vec_map::insert(&mut reward_pool.current_token_holders, to_address, to_balance + token_amount);
        } else {
            vec_map::insert(&mut reward_pool.current_token_holders, to_address, token_amount);
        }
    }

    // ============ Getter Functions per i dividendi ============

    public fun get_unclaimed_dividends_count(
        reward_pool: &RewardPool,
        investor_address: address
    ): u64 {
        let mut count = 0;
        let payments_length = vector::length(&reward_pool.dividend_payments);
        let mut i = 0;
        
        while (i < payments_length) {
            let dividend_payment = vector::borrow(&reward_pool.dividend_payments, i);
            
            if (!vector::contains(&dividend_payment.claimed_by, &investor_address) &&
                vec_map::contains(&dividend_payment.token_snapshot, &investor_address)) {
                count = count + 1;
            };
            i = i + 1;
        };
        
        count
    }

    public fun get_dividend_payment_info(
        reward_pool: &RewardPool,
        payment_id: u64
    ): (u64, u64, u64) {
        let payments_length = vector::length(&reward_pool.dividend_payments);
        assert!(payment_id < payments_length, E_CONTRACT_NOT_FOUND);
        
        let dividend_payment = vector::borrow(&reward_pool.dividend_payments, payment_id);
        (dividend_payment.payment_id, dividend_payment.total_amount, dividend_payment.payment_timestamp)
    }

    /// Get contract information
    public fun get_info(contract: &Contract): (address, address, String, u64, u64, u64, bool) {
        (contract.student_address, contract.investor_address, contract.pdf_hash,
         contract.funding_amount, contract.equity_percentage, contract.duration_months, contract.is_active)
    }
}