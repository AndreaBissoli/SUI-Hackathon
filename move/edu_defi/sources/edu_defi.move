/// Module: edu_defi
module edu_defi::edu_defi {
    
    use edu_defi::student;
    use edu_defi::investor;
    use edu_defi::contract;
    use sui::clock::Clock;
    use std::string::String;

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

    // ============ Registry Functions ============
    
    /// Add student to registry
    fun add_student(registry: &mut ServiceRegistry, student_address: address) {
        vector::push_back(&mut registry.students, student_address);
    }

    /// Add investor to registry
    fun add_investor(registry: &mut ServiceRegistry, investor_address: address) {
        vector::push_back(&mut registry.investors, investor_address);
    }

    /// Add contract to registry
    fun add_contract(registry: &mut ServiceRegistry, contract_address: address) {
        vector::push_back(&mut registry.contracts, contract_address);
    }

    // ============ Test Helper Functions ============
    
    #[test_only]
    /// Create a ServiceRegistry for testing
    public fun create_registry_for_testing(ctx: &mut TxContext): ServiceRegistry {
        ServiceRegistry {
            id: object::new(ctx),
            students: vector::empty<address>(),
            investors: vector::empty<address>(),
            contracts: vector::empty<address>(),
        }
    }

    #[test_only]
    /// Get registry stats for testing
    public fun get_registry_stats(registry: &ServiceRegistry): (u64, u64, u64) {
        (
            vector::length(&registry.students),
            vector::length(&registry.investors), 
            vector::length(&registry.contracts)
        )
    }

    // ============ Wrapper Functions ============

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
    }
}