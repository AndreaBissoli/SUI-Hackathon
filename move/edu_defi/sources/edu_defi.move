
/// Module: edu_defi
module edu_defi::edu_defi {

    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use std::string::String;

    // ============ Error Codes ============
    const E_INVALID_AMOUNT: u64 = 1;
    const E_INVALID_PERCENTAGE: u64 = 2;
    const E_CONTRACT_NOT_FOUND: u64 = 5;
    const E_UNAUTHORIZED: u64 = 6;
    const E_INSUFFICIENT_FUNDS: u64 = 8;
    const E_INVALID_DURATION: u64 = 9;

    // ============ Structs ============

    /// Student profile structure
    public struct Student has key, store {
        id: UID,
        owner: address,
        name: String,
        surname: String,
        age: u64,
        cv_hash: String,
        profile_image: String,
        funding_requested: u64, // Amount requested in SUI
        equity_percentage: u64, // Percentage of equity offered (0-100)
        duration_months: u64, // Duration in months for equity sharing
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

    /// Contract structure
    public struct Contract has key, store {
        id: UID,
        student_address: address,
        investor_address: address,
        pdf_hash: String, // Hash of the legal PDF contract
        funding_amount: u64, // Amount funded by investor
        release_interval_days: u64, // Interval for releasing funds to student
        equity_percentage: u64, // Percentage of student's income to return
        duration_months: u64, // Duration for equity sharing
        balance: Balance<SUI>, // Contract balance
        funds_released: u64, // Total funds released to student
        next_release_time: u64, // Timestamp for next fund release
        student_monthly_income: u64, // Student's monthly income
        is_active: bool,
        created_at: u64,
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

    /// Investor funds the accepted contract
    public fun investor_fund_contract(
        contract: &mut Contract,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(contract.investor_address == tx_context::sender(ctx), E_UNAUTHORIZED);
        assert!(contract.is_active, E_CONTRACT_NOT_FOUND);
        
        let payment_amount = coin::value(&payment);
        assert!(payment_amount >= contract.funding_amount, E_INSUFFICIENT_FUNDS);
        
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut contract.balance, payment_balance);
    }

    /// Student sets monthly income for equity calculation
    public fun student_set_monthly_income(
        contract: &mut Contract,
        monthly_income: u64,
        ctx: &mut TxContext
    ) {
        assert!(contract.student_address == tx_context::sender(ctx), E_UNAUTHORIZED);
        contract.student_monthly_income = monthly_income;
    }

    /// Student buys back equity tokens
    public fun student_buy_back(
        contract: &mut Contract,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(contract.student_address == tx_context::sender(ctx), E_UNAUTHORIZED);
        
        let payment_amount = coin::value(&payment);
        let monthly_equity = (contract.student_monthly_income * contract.equity_percentage) / 100;
        
        assert!(payment_amount >= monthly_equity, E_INSUFFICIENT_FUNDS);
        
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut contract.balance, payment_balance);
        
        // Send equity payment to investor
        let equity_coin = coin::from_balance(
            balance::split(&mut contract.balance, monthly_equity), 
            ctx
        );
        transfer::public_transfer(equity_coin, contract.investor_address);
    }

    /// Release funds to student (can be called by investor or automated)
    public fun release_funds_to_student(
        contract: &mut Contract,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(contract.is_active, E_CONTRACT_NOT_FOUND);
        assert!(clock::timestamp_ms(clock) >= contract.next_release_time, E_UNAUTHORIZED);
        
        let release_amount = contract.funding_amount / (contract.duration_months * 30 / contract.release_interval_days);
        let available_balance = balance::value(&contract.balance);
        
        if (available_balance >= release_amount && contract.funds_released < contract.funding_amount) {
            let release_coin = coin::from_balance(
                balance::split(&mut contract.balance, release_amount), 
                ctx
            );
            transfer::public_transfer(release_coin, contract.student_address);
            
            contract.funds_released = contract.funds_released + release_amount;
            contract.next_release_time = clock::timestamp_ms(clock) + (contract.release_interval_days * 24 * 60 * 60 * 1000);
        };
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

