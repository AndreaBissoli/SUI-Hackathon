/// Module: edu_defi
module edu_defi::edu_defi {

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

    // ============ Structs ============

    /// Student Token - ogni studente ha il suo token univoco
    public struct StudentToken<phantom T> has drop {}

    /// Dividend Payment Record - rappresenta un singolo dividendo
    public struct DividendPayment has store {
        payment_id: u64,
        total_amount: u64,
        payment_timestamp: u64,
        token_snapshot: VecMap<address, u64>, // snapshot dei token holders
        claimed_by: vector<address>, // chi ha già fatto claim
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

    /// Student profile structure
    public struct Student has key, store {
        id: UID,
        owner: address,
        name: String,
        surname: String,
        age: u64,
        cv_hash: String,
        profile_image: String,
        funding_requested: u64,
        equity_percentage: u64,
        duration_months: u64,
        created_at: u64,
    }

    /// Investor profile structure
    public struct Investor has key, store {
        id: UID,
        owner: address,
        name: String,
        surname: String,
        age: u64,
        profile_image: String,
        created_at: u64,
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

    /// Service registry to manage all profiles and contracts
    public struct ServiceRegistry has key {
        id: UID,
        students: vector<address>,
        investors: vector<address>,
        contracts: vector<address>,
    }

    /// Initialization function
    fun init(ctx: &mut TxContext) {
        let registry = ServiceRegistry {
            id: object::new(ctx),
            students: vector::empty<address>(),
            investors: vector::empty<address>(),
            contracts: vector::empty<address>(),
        };
        transfer::share_object(registry);
    }

    // ============ Service Methods ============

    /// Create a student profile
    #[allow(lint(self_transfer))]
    public fun student_create_profile(
        name: String,
        surname: String,
        age: u64,
        cv_hash: String,
        profile_image: String,
        funding_requested: u64,
        equity_percentage: u64,
        duration_months: u64,
        registry: &mut ServiceRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(equity_percentage <= 100, E_INVALID_PERCENTAGE);
        assert!(funding_requested > 0, E_INVALID_AMOUNT);
        assert!(duration_months > 0, E_INVALID_DURATION);

        let student = Student {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            name,
            surname,
            age,
            cv_hash,
            profile_image,
            funding_requested,
            equity_percentage,
            duration_months,
            created_at: clock::timestamp_ms(clock),
        };

        let student_address = object::uid_to_address(&student.id);
        vector::push_back(&mut registry.students, student_address);
        
        let sender = tx_context::sender(ctx);
        transfer::public_transfer(student, sender);
    }

    /// Create an investor profile
    #[allow(lint(self_transfer))]
    public fun investor_create_profile(
        name: String,
        surname: String,
        age: u64,
        profile_image: String,
        registry: &mut ServiceRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let investor = Investor {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            name,
            surname,
            age,
            profile_image,
            created_at: clock::timestamp_ms(clock),
        };

        let investor_address = object::uid_to_address(&investor.id);
        vector::push_back(&mut registry.investors, investor_address);
        
        let sender = tx_context::sender(ctx);
        transfer::public_transfer(investor, sender);
    }

    /// Investor proposes a contract to a student
    public fun investor_propose_contract(
        student_address: address,
        pdf_hash: String,
        funding_amount: u64,
        release_interval_days: u64,
        equity_percentage: u64,
        duration_months: u64,
        registry: &mut ServiceRegistry,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
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
        vector::push_back(&mut registry.contracts, contract_address);
        
        // Share the contract so both student and investor can access it
        transfer::share_object(contract);
    }

    /// Student accepts a contract
    public fun student_accept_contract(
        contract: &mut Contract,
        ctx: &mut TxContext
    ) {
        assert!(contract.student_address == tx_context::sender(ctx), E_UNAUTHORIZED);
        contract.is_active = true;
    }

    /// Investor funds contract and receives student tokens (SOSTITUISCE investor_fund_contract)
    public fun investor_fund_contract_with_tokens<T>(
        contract: &mut Contract,
        payment: Coin<SUI>,
        _clock: &Clock,
        ctx: &mut TxContext
    ): Coin<StudentToken<T>> {
        assert!(contract.investor_address == tx_context::sender(ctx), E_UNAUTHORIZED);
        assert!(contract.is_active, E_CONTRACT_NOT_FOUND);
        assert!(!contract.has_tokens_issued, E_UNAUTHORIZED); // Tokens possono essere emessi solo una volta
        
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= contract.funding_amount, E_INSUFFICIENT_FUNDS);
        
        // Add payment to contract balance
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut contract.balance, payment_balance);
        
        // Create student tokens
        let (mut treasury_cap, metadata) = coin::create_currency(
            StudentToken<T> {},
            8, // decimals
            b"STU_TOKEN",
            b"Student Equity Token",
            b"Token representing equity in student future income",
            option::none(),
            ctx
        );
        
        let token_supply = 1000000; // 1M token total supply
        let investor_tokens = coin::mint(&mut treasury_cap, token_supply, ctx);
        
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
        transfer::public_freeze_object(metadata);
        
        // Destroy treasury cap per sicurezza (nessuno può mintare altri token)
        transfer::public_freeze_object(treasury_cap);
        
        investor_tokens
    }

    /// Student pays monthly dividend (SOSTITUISCE student_buy_back)
    public fun student_pay_monthly_dividend(
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

    // ============ Getter Functions ============

    public fun get_student_info(student: &Student): (String, String, u64, String, u64, u64, u64) {
        (student.name, student.surname, student.age, student.cv_hash, 
         student.funding_requested, student.equity_percentage, student.duration_months)
    }

    public fun get_investor_info(investor: &Investor): (String, String, u64, String) {
        (investor.name, investor.surname, investor.age, investor.profile_image)
    }

    public fun get_contract_info(contract: &Contract): (address, address, String, u64, u64, u64, bool) {
        (contract.student_address, contract.investor_address, contract.pdf_hash,
         contract.funding_amount, contract.equity_percentage, contract.duration_months, contract.is_active)
    }

    // ============ Update Methods ============

    /// Update student profile
    public fun student_update_profile(
        student: &mut Student,
        name: String,
        surname: String,
        age: u64,
        cv_hash: String,
        profile_image: String,
        funding_requested: u64,
        equity_percentage: u64,
        duration_months: u64,
        ctx: &mut TxContext
    ) {
        assert!(student.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        assert!(equity_percentage <= 100, E_INVALID_PERCENTAGE);
        assert!(funding_requested > 0, E_INVALID_AMOUNT);
        assert!(duration_months > 0, E_INVALID_DURATION);

        student.name = name;
        student.surname = surname;
        student.age = age;
        student.cv_hash = cv_hash;
        student.profile_image = profile_image;
        student.funding_requested = funding_requested;
        student.equity_percentage = equity_percentage;
        student.duration_months = duration_months;
    }

    /// Update investor profile
    public fun investor_update_profile(
        investor: &mut Investor,
        name: String,
        surname: String,
        age: u64,
        profile_image: String,
        ctx: &mut TxContext
    ) {
        assert!(investor.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        
        investor.name = name;
        investor.surname = surname;
        investor.age = age;
        investor.profile_image = profile_image;
    }
}

