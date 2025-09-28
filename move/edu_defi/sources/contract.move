module edu_defi::contract {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use std::string::String;
    use sui::vec_map::{Self, VecMap};
    use edu_defi::errors;
    use sui::table::{Self, Table};

    /// Dividend payment record
    public struct DividendPayment has store {
        payment_id: u64,
        total_amount: u64,
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
        funding_amount: u64, // Total funding amount by the investore
        release_interval_days: u64,  // Interval in days for fund release
        equity_percentage: u64, // Equity in the student owned by investor
        duration_months: u64,
        balance: Balance<SUI>, // Amount of money put by the student in the pool 
        funds_released: u64, 
        next_release_time: u64,
        student_monthly_income: u64,
        is_active: bool,
        // Nuovi campi per il sistema di token
        reward_pool_id: Option<ID>,
        has_tokens_issued: bool,
    }



    /// Create and share a contract, return its address
    /// Create and share a contract, return its address
    public fun create_and_share_contract(
        students_registry: &Table<address, address>,
        investors_registry: &Table<address, address>,
        student_address: address,
        pdf_hash: String,
        funding_amount: u64,
        release_interval_days: u64,
        equity_percentage: u64,
        duration_months: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ): address {
        assert!(funding_amount > 0, errors::invalid_amount());
        assert!(equity_percentage <= 100, errors::invalid_percentage());
        assert!(duration_months > 0, errors::invalid_duration());

        assert!(table::contains(students_registry, student_address), errors::unauthorized());
        assert!(table::contains(investors_registry, tx_context::sender(ctx)), errors::unauthorized());
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
        assert!(contract.student_address == tx_context::sender(ctx), errors::unauthorized());
        contract.is_active = true;
    }

    /// Student rejects a proposed contract
    public fun reject_contract(
        contract: &Contract,
        ctx: &mut TxContext
    ) {
        // Verify that the sender is the student for whom the contract was proposed
        assert!(contract.student_address == tx_context::sender(ctx), errors::unauthorized());
        
        // Verify that the contract is not yet active (can't reject an active contract)
        assert!(!contract.is_active, errors::unauthorized());
    }

    /// Student releases funds from the contract after the release interval has passed
    public fun release_funds(
        contract: &mut Contract,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(contract.student_address == tx_context::sender(ctx), errors::unauthorized());
        assert!(contract.is_active, errors::contract_not_found());
        
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time >= contract.next_release_time, errors::unauthorized()); // Time not reached yet
        
        // Calculate how many intervals have passed since contract start
        let contract_start_time = contract.next_release_time - (contract.release_interval_days * 24 * 60 * 60 * 1000);
        let intervals_passed = ((current_time - contract_start_time) / (contract.release_interval_days * 24 * 60 * 60 * 1000)) + 1;
        
        // Calculate total intervals in the contract duration
        let total_intervals = (contract.duration_months * 30) / contract.release_interval_days; // Approximate days per month
        
        // Ensure we don't exceed the total number of intervals
        let actual_intervals = if (intervals_passed > total_intervals) {
            total_intervals
        } else {
            intervals_passed
        };
        
        // Calculate total amount that should have been released by now
        let total_should_be_released = (contract.funding_amount * actual_intervals) / total_intervals;
        
        // Calculate the amount to release this time (difference between what should be released and what has been released)
        assert!(total_should_be_released > contract.funds_released, errors::insufficient_funds());
        let amount_to_release = total_should_be_released - contract.funds_released;
        
        // Check that contract has enough balance
        assert!(balance::value(&contract.balance) >= amount_to_release, errors::insufficient_funds());
        
        // Update contract state
        contract.funds_released = contract.funds_released + amount_to_release;
        contract.next_release_time = current_time + (contract.release_interval_days * 24 * 60 * 60 * 1000);
        
        // Transfer the funds directly to the student's address
        let release_balance = balance::split(&mut contract.balance, amount_to_release);
        let release_coin = coin::from_balance(release_balance, ctx);
        transfer::public_transfer(release_coin, contract.student_address);
    }

    

    // Unfortunately Move does not support minting many different coins from the same function (yet) as it's a beta feature
    // So we will track the stake of investors in a map.
    public fun fund_contract_with_tokens(
        contract: &mut Contract,
        payment: Coin<SUI>,
        _clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(contract.investor_address == tx_context::sender(ctx), errors::unauthorized());
        assert!(contract.is_active, errors::contract_not_found());
        assert!(!contract.has_tokens_issued, errors::unauthorized()); // Tokens possono essere emessi solo una volta
        
        let payment_amount = coin::value(&payment);
        assert!(payment_amount == contract.funding_amount, errors::insufficient_funds());
        
        // Add payment to contract balance
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut contract.balance, payment_balance);
        
        // Create student tokens (test version - creates zero coin for simplicity)
        let token_cap = 10000000;
        
       
        // Create reward pool for dividend management
        //* TODO: Use table */
        let mut token_holders = vec_map::empty<address, u64>();
        vec_map::insert(&mut token_holders, tx_context::sender(ctx), token_cap);
        
        let reward_pool = RewardPool {
            id: object::new(ctx),
            student_address: contract.student_address,
            contract_id: object::id(contract),
            total_token_supply: token_cap,
            current_token_holders: token_holders,
            dividend_payments: vector::empty<DividendPayment>(),
            next_payment_id: 0,
            total_balance: balance::zero<SUI>(),
        };
        
        let pool_id = object::id(&reward_pool);
        contract.reward_pool_id = option::some(pool_id);
        contract.has_tokens_issued = true;
        
        transfer::share_object(reward_pool);
    }

    /// Student pays monthly dividend
    public fun pay_monthly_dividend(
        contract: &Contract,
        reward_pool: &mut RewardPool,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(contract.student_address == tx_context::sender(ctx), errors::unauthorized());
        assert!(contract.has_tokens_issued, errors::contract_not_found());
        assert!(object::id(reward_pool) == *option::borrow(&contract.reward_pool_id), errors::unauthorized());
        
        let payment_amount = coin::value(&payment);
        let monthly_equity = (contract.student_monthly_income * contract.equity_percentage) / 100;
        assert!(payment_amount >= monthly_equity, errors::insufficient_funds());
        
        // Snapshot of current token distribution
        let dividend_payment = DividendPayment {
            payment_id: reward_pool.next_payment_id,
            total_amount: payment_amount,
            token_snapshot: reward_pool.current_token_holders,
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
        assert!(payment_id < payments_length, errors::contract_not_found());
        
        let dividend_payment = vector::borrow_mut(&mut reward_pool.dividend_payments, payment_id);
        
        // Verifica che non abbia già fatto claim su questo dividendo
        assert!(!vector::contains(&dividend_payment.claimed_by, &investor_address), errors::already_claimed());
        
        // Verifica che avesse token al momento dello snapshot
        assert!(vec_map::contains(&dividend_payment.token_snapshot, &investor_address), errors::unauthorized());
        
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
        
        assert!(total_claimable > 0, errors::insufficient_funds());
        
        coin::from_balance(
            balance::split(&mut reward_pool.total_balance, total_claimable),
            ctx
        )
    }
    
    /// function to transfer tokens between an investor who has some and another investor.
    /// it should make use of the function update_token_distribution to update the distribution of tokens
    public fun transfer_tokens(
        reward_pool: &mut RewardPool,
        to_address: address,
        token_amount: u64,
        ctx: &mut TxContext
    ) {
        let from_address = tx_context::sender(ctx);
        assert!(vec_map::contains(&reward_pool.current_token_holders, &from_address), errors::unauthorized());
        let from_balance = *vec_map::get(&reward_pool.current_token_holders, &from_address);
        assert!(from_balance >= token_amount, errors::insufficient_funds());
        assert!(token_amount > 0, errors::invalid_amount());
        assert!(from_address != to_address, errors::invalid_recipient());
        // Update token distribution
        update_token_distribution(reward_pool, from_address, to_address, token_amount, ctx);
    }


    /// Update token distribution when tokens are transferred/sold
    fun update_token_distribution(
        reward_pool: &mut RewardPool,
        from_address: address,
        to_address: address,
        token_amount: u64,
        _ctx: &mut TxContext
    ) {
        // Update distribuzione dei token quando vengono trasferiti
        if (vec_map::contains(&reward_pool.current_token_holders, &from_address)) {
            let from_balance = *vec_map::get(&reward_pool.current_token_holders, &from_address);
            assert!(from_balance >= token_amount, errors::insufficient_funds());
            
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
    ): (u64, u64) {
        let payments_length = vector::length(&reward_pool.dividend_payments);
        assert!(payment_id < payments_length, errors::contract_not_found());
        
        let dividend_payment = vector::borrow(&reward_pool.dividend_payments, payment_id);
        (dividend_payment.payment_id, dividend_payment.total_amount)
    }

    /// Get contract student address (used for validation)
    public fun get_student_address(contract: &Contract): address {
        contract.student_address
    }

    /// Check if contract is active
    public fun is_contract_active(contract: &Contract): bool {
        contract.is_active
    }

    /// Get contract information
    public fun get_info(contract: &Contract): (address, address, String, u64, u64, u64, bool) {
        (contract.student_address, contract.investor_address, contract.pdf_hash,
         contract.funding_amount, contract.equity_percentage, contract.duration_months, contract.is_active)
    }
}