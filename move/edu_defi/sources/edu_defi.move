/// Module: edu_defi
module edu_defi::edu_defi {
    
    use edu_defi::student;
    use edu_defi::investor::{Self, Investor};
    use edu_defi::contract;
    use edu_defi::errors;
    use sui::clock::Clock;
    use std::string::String;
    use sui::table::{Self as table, Table};

    public struct ServiceRegistry has key {
        id: UID,
        students: Table<address, bool>,
        investors: Table<address, bool>,
        contracts: vector<address>, // keep order if you really need it
    }

    fun init(ctx: &mut TxContext) {
        let registry = ServiceRegistry {
            id: object::new(ctx),
            students: table::new(ctx),
            investors: table::new(ctx),
            contracts: vector::empty(),
        };
        transfer::share_object(registry);
    }

    fun add_student(registry: &mut ServiceRegistry, a: address) {
        if (!table::contains(&registry.students, a)) {
            table::add(&mut registry.students, a, true);
        }
    }

    fun add_investor(registry: &mut ServiceRegistry, a: address) {
        if (!table::contains(&registry.investors, a)) {
            table::add(&mut registry.investors, a, true);
        }
    }
    /// Add contract to registry
    fun add_contract(registry: &mut ServiceRegistry, contract_address: address) {
        vector::push_back(&mut registry.contracts, contract_address);
    }

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
        let student = student::create_profile(
            name,
            surname,
            age,
            cv_hash,
            profile_image,
            funding_requested,
            equity_percentage,
            duration_months,
            clock,
            ctx
        );
        let student_address = student::get_address(&student);
        add_student(registry, student_address);
        transfer::public_transfer(student, tx_context::sender(ctx));
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
        let investor = investor::create_profile(
            name,
            surname,
            age,
            profile_image,
            clock,
            ctx
        );
        let investor_address = investor::get_address(&investor);
        add_investor(registry, investor_address);
        transfer::public_transfer(investor, tx_context::sender(ctx));
    }

    /// Investor proposes a contract to a student
    public fun investor_propose_contract(
        investor: &Investor,
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
        assert!(table::contains(&registry.investors, investor::get_address(investor)), errors::unauthorized());
        let contract_address = contract::create_and_share_contract(
            student_address,
            pdf_hash,
            funding_amount,
            release_interval_days,
            equity_percentage,
            duration_months,
            clock,
            ctx
        );
        
        add_contract(registry, contract_address);
        // TODO: notify student?
    }


    #[test_only]
    public fun create_registry_for_testing(ctx: &mut TxContext): ServiceRegistry {
        ServiceRegistry {
            id: object::new(ctx),
            students: table::new(ctx),
            investors: table::new(ctx),
            contracts: vector::empty()
        }
    }

    #[test_only]
    public fun get_registry_stats(registry: &ServiceRegistry): (u64, u64, u64) {
        (
            table::length(&registry.students),
            table::length(&registry.investors),
            vector::length(&registry.contracts),
        )
    }
}